// components/Orders.tsx
import { registerSessionCache } from "@/lib/sessionCache";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Order, OrderStatus, UpdateOrderData } from "./types/order";
import { OrdersStats } from "./OrdersStats";
import { OrdersTable } from "./OrdersTable";
import { OrderDetailsDialog } from "./order_details_dialog/OrderDetailsDialog";
import { useAuth } from "../../contexts/AuthContext";
import { getErrorMessage } from "@/utils/orderHelpers";
import {
  getAllOrders,
  updateOrderStatus,
  assignTableToOrder,
  assignWaiterToOrder,
  waiterConfirmOrder,
} from "../../api-services/orderService";
import { getActiveWaiters, Staff } from "../../api-services/staffService";
import { getAvailableTables, Table } from "../../api-services/tableService";

const statusOptions = [
  "All",
  "paid",
  "received",
  "preparing",
  "ready",
  "served",
  "completed",
  "cancelled",
  "delivered",
];

// ============== CACHE SETUP ==============
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

interface OrdersCache {
  orders: Order[];
  waiters: Staff[];
  tables: Table[];
  lastFetched: number;
  restaurantId?: string;
}

let ordersCache: OrdersCache | null = null;
registerSessionCache(() => {
  ordersCache = null;
});

const isCacheValid = (): boolean => {
  if (!ordersCache) return false;
  return Date.now() - ordersCache.lastFetched < CACHE_DURATION;
};
// =========================================

export function Orders() {
  const auth = useAuth();
  const token = auth?.token;
  const { isWaiter, restaurants } = useAuth();

  const [orders, setOrders] = useState<Order[]>(
    () => ordersCache?.orders ?? []
  );
  const [waiters, setWaiters] = useState<Staff[]>(
    () => ordersCache?.waiters ?? []
  );
  const [tables, setTables] = useState<Table[]>(
    () => ordersCache?.tables ?? []
  );
  const [loading, setLoading] = useState(() => !isCacheValid());

  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmationFilter, setConfirmationFilter] = useState<
    "All" | "Awaiting" | "Confirmed"
  >("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(
    () => ordersCache?.lastFetched ?? Date.now()
  );
  const [tablesFetched, setTablesFetched] = useState(false);

  // Get restaurant ID from auth context
  const restaurantId = restaurants?.[0]?.id;

  const filteredOrders = (orders || []).filter((order) => {
    if (statusFilter !== "All" && order.status !== statusFilter) return false;
    // Confirmation is only meaningful while status is `received`.
    // `waiter_confirmed` may be undefined on older payloads — treat as unconfirmed.
    if (confirmationFilter === "Awaiting")
      return order.status === "received" && !order.waiter_confirmed;
    if (confirmationFilter === "Confirmed")
      return order.status === "received" && !!order.waiter_confirmed;
    return true;
  });

  const awaitingConfirmationCount = (orders || []).filter(
    (order) => order.status === "received" && !order.waiter_confirmed
  ).length;

  // Fetch tables function
  // Returns the freshly fetched tables, or undefined if nothing was fetched,
  // so callers can write them to the cache instead of stale `tables` state.
  const fetchTables = async (
    restId: string,
    force = false
  ): Promise<Table[] | undefined> => {
    if (!token) return;

    // Skip if already fetched and not forcing
    if (tablesFetched && !force) {
      return;
    }

    try {
      const tablesData = (await getAvailableTables(token, restId)) || [];
      setTables(tablesData);
      setTablesFetched(true);

      // Update cache
      if (ordersCache) {
        ordersCache.tables = tablesData;
        ordersCache.restaurantId = restId;
      }
      return tablesData;
    } catch (err) {
      setTables([]);
      return [];
    }
  };

  // Background refresh (no loading state)
  const backgroundRefresh = async () => {
    if (!token || !restaurantId) return;

    try {
      let freshTables: Table[] | undefined;
      const [ordersData, waitersData] = await Promise.all([
        getAllOrders(token),
        !isWaiter ? getActiveWaiters(token) : Promise.resolve([]),
      ]);

      setOrders(ordersData || []);
      setWaiters(waitersData || []);

      // Fetch tables using restaurantId from auth
      if (restaurantId) {
        freshTables = await fetchTables(restaurantId, true);
      }

      // Update cache
      ordersCache = {
        orders: ordersData || [],
        waiters: waitersData || [],
        tables: freshTables ?? tables,
        lastFetched: Date.now(),
        restaurantId: restaurantId,
      };
      setLastUpdated(Date.now());
    } catch (err) {
      // Silent fail for background refresh
    }
  };

  // Main fetch with cache support
  const fetchOrders = async (forceRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Use cache if valid and not forcing refresh
    if (!forceRefresh && isCacheValid() && ordersCache) {
      setOrders(ordersCache.orders);
      setWaiters(ordersCache.waiters);
      setTables(ordersCache.tables);
      setLoading(false);

      // Background refresh if cache is getting stale
      const cacheAge = Date.now() - ordersCache.lastFetched;
      if (cacheAge > CACHE_DURATION / 2) {
        backgroundRefresh();
      }
      return;
    }

    if (!ordersCache) {
      setLoading(true);
    }

    try {
      let freshTables: Table[] | undefined;
      setError(null);

      const [ordersData, waitersData] = await Promise.all([
        getAllOrders(token),
        !isWaiter ? getActiveWaiters(token) : Promise.resolve([]),
      ]);

      setOrders(ordersData || []);
      setWaiters(waitersData || []);

      if (restaurantId) {
        // Force fetch tables on initial load or refresh
        freshTables = await fetchTables(restaurantId, forceRefresh);
      }

      // Update cache
      ordersCache = {
        orders: ordersData || [],
        waiters: waitersData || [],
        tables: freshTables ?? tables,
        lastFetched: Date.now(),
        restaurantId: restaurantId,
      };
      setLastUpdated(Date.now());
    } catch (err) {
      if (ordersCache && !forceRefresh) {
        setOrders(ordersCache.orders);
        setWaiters(ordersCache.waiters);
        setTables(ordersCache.tables);
      } else {
        setError(getErrorMessage(err, "Failed to fetch orders"));
        setOrders([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Fetch tables when restaurantId becomes available (only if not already fetched)
  useEffect(() => {
    if (token && restaurantId && !tablesFetched) {
      fetchTables(restaurantId);
    }
  }, [token, restaurantId, tablesFetched]);

  // Background refresh interval
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(backgroundRefresh, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTablesFetched(false);
    fetchOrders(true);
  };

  // Helper to update cache after mutations
  const updateCache = (newOrders: Order[]) => {
    if (ordersCache) {
      ordersCache.orders = newOrders;
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      setError(null);
      if (!token) throw new Error("Authentication token not found");

      const updatedOrders = (orders || []).map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      updateCache(updatedOrders);

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      const updateData: UpdateOrderData = { status: newStatus };
      await updateOrderStatus(orderId, updateData, token);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update status"));
      await fetchOrders(true);
    }
  };

  const handleAssignTable = async (orderId: string, tableId: string) => {
    try {
      setError(null);
      if (!token) throw new Error("Authentication token not found");

      await assignTableToOrder(orderId, tableId, token);
      await fetchOrders(true);
      if (restaurantId) {
        await fetchTables(restaurantId, true);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to assign table"));
    }
  };

  const handleAssignWaiter = async (orderId: string, waiterId: string) => {
    try {
      setError(null);
      if (!token) throw new Error("Authentication token not found");

      await assignWaiterToOrder(orderId, waiterId, token);
      await fetchOrders(true);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to assign waiter"));
    }
  };

  const parseConfirmError = (err: unknown): string => {
    // The axios interceptor rejects with the response body and attaches the
    // HTTP status to it (see api-services/utils/baseUrl.ts).
    const status = (err as { status?: number } | undefined)?.status;
    if (status === 400)
      return "Order is no longer in received status. Refreshing…";
    if (status === 401 || status === 403)
      return "You are not permitted to confirm orders for this restaurant.";
    if (status === 404) return "Order not found. Refreshing…";
    return getErrorMessage(err, "Failed to confirm order");
  };

  const handleWaiterConfirm = async (orderId: string) => {
    if (!token || confirmingIds.has(orderId)) return;
    try {
      setError(null);
      setConfirmingIds((prev) => new Set(prev).add(orderId));

      const updated = await waiterConfirmOrder(orderId, token);

      const applyUpdate = (list: Order[]) =>
        list.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...updated,
                // Confirmation never changes status; keep local status stable
                // unless backend explicitly moved it.
                status: updated?.status ?? order.status,
              }
            : order
        );

      const nextOrders = applyUpdate(orders || []);
      setOrders(nextOrders);
      updateCache(nextOrders);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, ...updated, status: updated?.status ?? prev.status } : prev
        );
      }
    } catch (err) {
      setError(parseConfirmError(err));
      await fetchOrders(true);
    } finally {
      setConfirmingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const handleOrderSelect = (order: Order) => setSelectedOrder(order);
  const handleCloseSheet = () => setSelectedOrder(null);

  if (loading && !ordersCache) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-ink"></div>
            <div className="text-lg text-ink-secondary">Loading orders...</div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {error && (
        <div className="relative rounded-2xl border border-red-200 bg-red-50 px-4 py-3 pr-12 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="absolute top-0 right-0 bottom-0 px-4"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      <PageHeader
        title="Orders"
        description={
          <>
            Manage restaurant orders and track order status
            {ordersCache && (
              <span className="ml-2 text-xs text-ink-muted">
                • Updated {Math.round((Date.now() - lastUpdated) / 1000)}s ago
              </span>
            )}
          </>
        }
        actions={
          <>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-ink-muted" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "All" ? "All" : status.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(isWaiter || statusFilter === "All" || statusFilter === "received") && (
              <Select
                value={confirmationFilter}
                onValueChange={(v: "All" | "Awaiting" | "Confirmed") =>
                  setConfirmationFilter(v)
                }
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Confirmation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All confirmations</SelectItem>
                  <SelectItem value="Awaiting">
                    Awaiting confirmation
                    {awaitingConfirmationCount > 0
                      ? ` (${awaitingConfirmationCount})`
                      : ""}
                  </SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </Button>
          </>
        }
      />

      <OrdersStats orders={orders} />

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            {orders.length === 0
              ? "No orders found"
              : "Click on any order to view details and update status"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-lg text-ink-muted">No orders found</div>
              <div className="mt-2 text-sm text-ink-subtle">
                {orders.length === 0
                  ? "No orders in the system"
                  : `No orders match the "${statusFilter}" filter`}
              </div>
              <Button variant="outline" className="mt-4" onClick={handleRefresh}>
                Refresh Orders
              </Button>
            </div>
          ) : (
            <OrdersTable
              orders={filteredOrders}
              onOrderSelect={handleOrderSelect}
              waiters={waiters}
              tables={tables}
              isWaiter={!!isWaiter}
              confirmingIds={confirmingIds}
              onWaiterConfirm={handleWaiterConfirm}
            />
          )}
        </CardContent>
      </Card>

      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={handleCloseSheet}
        onStatusChange={handleStatusChange}
        onAssignTable={handleAssignTable}
        onAssignWaiter={handleAssignWaiter}
        onWaiterConfirm={handleWaiterConfirm}
        isConfirming={selectedOrder ? confirmingIds.has(selectedOrder.id) : false}
        staff={waiters}
        tables={tables}
      />
    </PageContainer>
  );
}
