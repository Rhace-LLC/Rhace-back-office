// components/Orders.tsx
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
import { Order, UpdateOrderData } from "./types/order";
import { OrdersStats } from "./OrdersStats";
import { OrdersTable } from "./OrdersTable";
import { OrderDetailsSheet } from "./OrderDetailsSheet";
import { useAuth } from "../../contexts/AuthContext";
import {
  getAllOrders,
  updateOrderStatus,
  assignTableToOrder,
  assignWaiterToOrder,
} from "../../api-services/orderService";
import { getActiveWaiters, Staff } from "../../api-services/staffService";
import { getAvailableTables, Table } from "../../api-services/tableService";

type OrderStatus =
  | "paid"
  | "received"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"
  | "delivered";

const statusOptions = [
  "All",
  "paid",
  "received",
  "preparing",
  "ready",
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(
    () => ordersCache?.lastFetched ?? Date.now()
  );
  const [tablesFetched, setTablesFetched] = useState(false);

  // Get restaurant ID from auth context
  const restaurantId = restaurants?.[0]?.id;

  const filteredOrders = (orders || []).filter(
    (order) => statusFilter === "All" || order.status === statusFilter
  );

  // Fetch tables function
  const fetchTables = async (restId: string, force = false) => {
    if (!token) return;

    // Skip if already fetched and not forcing
    if (tablesFetched && !force) {
      return;
    }

    try {
      const tablesData = await getAvailableTables(token, restId);
      setTables(tablesData || []);
      setTablesFetched(true);

      // Update cache
      if (ordersCache) {
        ordersCache.tables = tablesData || [];
        ordersCache.restaurantId = restId;
      }
    } catch (err) {
      setTables([]);
    }
  };

  // Background refresh (no loading state)
  const backgroundRefresh = async () => {
    if (!token || !restaurantId) return;

    try {
      const [ordersData, waitersData] = await Promise.all([
        getAllOrders(token),
        !isWaiter ? getActiveWaiters(token) : Promise.resolve([]),
      ]);

      setOrders(ordersData || []);
      setWaiters(waitersData || []);

      // Fetch tables using restaurantId from auth
      if (restaurantId) {
        await fetchTables(restaurantId, true);
      }

      // Update cache
      ordersCache = {
        orders: ordersData || [],
        waiters: waitersData || [],
        tables: tables,
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
      setError(null);

      const [ordersData, waitersData] = await Promise.all([
        getAllOrders(token),
        !isWaiter ? getActiveWaiters(token) : Promise.resolve([]),
      ]);

      setOrders(ordersData || []);
      setWaiters(waitersData || []);

      if (restaurantId) {
        // Force fetch tables on initial load or refresh
        await fetchTables(restaurantId, forceRefresh);
      }

      // Update cache
      ordersCache = {
        orders: ordersData || [],
        waiters: waitersData || [],
        tables: tables,
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
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
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
      setError(err instanceof Error ? err.message : "Failed to update status");
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
      setError(err instanceof Error ? err.message : "Failed to assign table");
    }
  };

  const handleAssignWaiter = async (orderId: string, waiterId: string) => {
    try {
      setError(null);
      if (!token) throw new Error("Authentication token not found");

      await assignWaiterToOrder(orderId, waiterId, token);
      await fetchOrders(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign waiter");
    }
  };

  const handleOrderSelect = (order: Order) => setSelectedOrder(order);
  const handleCloseSheet = () => setSelectedOrder(null);

  if (loading && !ordersCache) {
    return (
      <div className="mt-15 space-y-6 p-5 md:mt-0">
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <div className="text-lg text-gray-600">Loading orders...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5 md:mt-0">
      {error && (
        <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 right-0 bottom-0 px-4 py-3"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">
            Orders Management
          </h1>
          <p className="text-muted-foreground">
            Manage restaurant orders and track order status
            {ordersCache && (
              <span className="ml-2 text-xs text-gray-500">
                • Updated {Math.round((Date.now() - lastUpdated) / 1000)}s ago
              </span>
            )}
            <span className="ml-2 text-xs text-gray-500">
              • Tables: {tables.length} • Waiters: {waiters.length}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="text-muted-foreground h-4 w-4" />
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
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

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
              <div className="text-lg text-gray-500">No orders found</div>
              <div className="mt-2 text-sm text-gray-400">
                {orders.length === 0
                  ? "No orders in the system"
                  : `No orders match the "${statusFilter}" filter`}
              </div>
              <button
                onClick={handleRefresh}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Refresh Orders
              </button>
            </div>
          ) : (
            <OrdersTable
              orders={filteredOrders}
              onOrderSelect={handleOrderSelect}
              waiters={waiters}
              tables={tables}
            />
          )}
        </CardContent>
      </Card>

      <OrderDetailsSheet
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={handleCloseSheet}
        onStatusChange={handleStatusChange}
        onAssignTable={handleAssignTable}
        onAssignWaiter={handleAssignWaiter}
        staff={waiters}
        tables={tables}
      />
    </div>
  );
}