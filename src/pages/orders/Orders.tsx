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
import { Order, OrderStatus, UpdateOrderData } from "./types/order";
import { OrdersStats } from "./OrdersStats";
import { OrdersTable } from "./OrdersTable";
import { OrderDetailsSheet } from "./OrderDetailsSheet";
import { useAuth } from "../../contexts/AuthContext";
import {
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  assignTableToOrder,
  assignWaiterToOrder,
} from "../../api-services/orderService";
import { getActiveWaiters, Staff } from "../../api-services/staffService";
import { getAvailableTables, Table } from "../../api-services/tableService";

const statusOptions = [
  "All",
  OrderStatus.RECEIVED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
  OrderStatus.DELIVERED,
];

export function Orders() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [waiters, setWaiters] = useState<Staff[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const auth = useAuth();
  const token = auth?.token;

  // Get restaurant ID from the first order
  const restaurantId = orders[0]?.restaurant?.id;

  // Fetch orders and waiters
  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchWaiters();
    }
  }, [token]);

  // Fetch tables when restaurantId is available
  useEffect(() => {
    if (token && restaurantId) {
      fetchTables();
    }
  }, [token, restaurantId]);

  const filteredOrders = (orders || []).filter(
    (order) => statusFilter === "All" || order.status === statusFilter
  );

  // GET /orders/
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setOrders([]);
        return;
      }

      const data = await getAllOrders(token);
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // GET only active waiters
  const fetchWaiters = async () => {
    try {
      if (!token) return;

      console.log(
        "🔧 Fetching waiters with token:",
        token ? "Present" : "Missing"
      );
      const waitersData = await getActiveWaiters(token);
      setWaiters(waitersData || []);
      console.log(
        "✅ Waiters fetched:",
        waitersData?.length || 0,
        "active waiters"
      );
    } catch (err) {
      console.error("❌ Error fetching waiters:", err);
      setWaiters([]);
    }
  };

  // GET /menu/restaurant/{restaurant_id}/tables/
  const fetchTables = async () => {
    try {
      if (!token || !restaurantId) {
        console.log("❌ Cannot fetch tables - missing token or restaurantId");
        console.log("Token:", token ? "Present" : "Missing");
        console.log("Restaurant ID:", restaurantId);
        return;
      }

      console.log("🔧 Fetching tables for restaurant:", restaurantId);
      const tablesData = await getAvailableTables(token, restaurantId);
      setTables(tablesData || []);
      console.log(
        "✅ Tables fetched:",
        tablesData?.length || 0,
        "available tables"
      );
    } catch (err) {
      console.error("❌ Error fetching tables:", err);
      setTables([]);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
    fetchWaiters();
    if (restaurantId) {
      fetchTables();
    }
  };

  // POST /orders/{order_id}/update-status/
  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      setError(null);

      if (!token) throw new Error("Authentication token not found");

      // Optimistic update
      setOrders((prevOrders) =>
        (prevOrders || []).map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      // API call
      const updateData: UpdateOrderData = { status: newStatus };
      await updateOrderStatus(orderId, updateData, token);
    } catch (err) {
      console.error(`❌ Error updating status for order ${orderId}:`, err);
      setError(err instanceof Error ? err.message : "Failed to update status");
      await fetchOrders();
    }
  };

  // POST /orders/{order_id}/cancel/
  const handleCancelOrder = async (orderId: string) => {
    try {
      setError(null);

      if (!token) throw new Error("Authentication token not found");

      const cancelData: UpdateOrderData = { status: OrderStatus.CANCELLED };
      await cancelOrder(orderId, cancelData, token);
      await handleStatusChange(orderId, OrderStatus.CANCELLED);
    } catch (err) {
      console.error(`❌ Error cancelling order ${orderId}:`, err);
      setError(err instanceof Error ? err.message : "Failed to cancel order");
    }
  };

  // POST /orders/{order_id}/assign-table/
  const handleAssignTable = async (orderId: string, tableId: string) => {
    try {
      setError(null);

      if (!token) throw new Error("Authentication token not found");

      await assignTableToOrder(orderId, tableId, token);
      await fetchOrders(); // Refresh to get updated assignments
      await fetchTables(); // Refresh tables as one just got assigned
    } catch (err) {
      console.error(`❌ Error assigning table to order ${orderId}:`, err);
      setError(err instanceof Error ? err.message : "Failed to assign table");
    }
  };

  // POST /orders/assign-waiter/
  const handleAssignWaiter = async (orderId: string, waiterId: string) => {
    try {
      setError(null);

      if (!token) throw new Error("Authentication token not found");

      await assignWaiterToOrder(orderId, waiterId, token);
      await fetchOrders(); // Refresh to get updated assignments
    } catch (err) {
      console.error(`❌ Error assigning waiter to order ${orderId}:`, err);
      setError(err instanceof Error ? err.message : "Failed to assign waiter");
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseSheet = () => {
    setSelectedOrder(null);
  };

  // Loading State
  if (loading && !orders.length) {
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
    <div className="mt-15 space-y-6 p-5 md:mt-0">
      {/* Error Display */}
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

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">
            Orders Management
          </h1>
          <p className="text-muted-foreground">
            Manage restaurant orders and track order status
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

      {/* Statistics */}
      <OrdersStats orders={orders} />

      {/* Orders Table */}
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

      {/* Order Details Sheet */}
      <OrderDetailsSheet
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={handleCloseSheet}
        onStatusChange={handleStatusChange}
        onCancelOrder={handleCancelOrder}
        onAssignTable={handleAssignTable}
        onAssignWaiter={handleAssignWaiter}
        staff={waiters}
        tables={tables}
      />
    </div>
  );
}
