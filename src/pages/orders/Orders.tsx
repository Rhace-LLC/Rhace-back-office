// components/Orders.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  assignWaiterToOrder 
} from "../../api-services/orderService";
import { getActiveWaiters, Staff } from "../../api-services/staffService";
import { getAvailableTables, Table } from "../../api-services/tableService";

type OrderStatus = "received" | "preparing" | "ready" | "completed" | "cancelled" | "delivered";

const statusOptions = [
  "All",
  "received",
  "preparing",
  "ready",
  "completed",
  "cancelled",
  "delivered"
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
  const { isWaiter, isOwner, restaurants } = useAuth();

  const [orders, setOrders] = useState<Order[]>(() => ordersCache?.orders ?? []);
  const [waiters, setWaiters] = useState<Staff[]>(() => ordersCache?.waiters ?? []);
  const [tables, setTables] = useState<Table[]>(() => ordersCache?.tables ?? []);
  const [loading, setLoading] = useState(() => !isCacheValid());
  
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(() => ordersCache?.lastFetched ?? Date.now());
  const [tablesFetched, setTablesFetched] = useState(false);

  // ✅ FIX: Get restaurant ID from auth context, not from orders
  const restaurantId = restaurants?.[0]?.id;

  // DEBUG: Log restaurant ID
  useEffect(() => {
    console.log("🔍 DEBUG - Restaurants from auth:", restaurants);
    console.log("🔍 DEBUG - Restaurant ID from auth:", restaurantId);
    console.log("🔍 DEBUG - Orders array:", orders);
    console.log("🔍 DEBUG - Tables fetched flag:", tablesFetched);
    console.log("🔍 DEBUG - Current tables:", tables);
  }, [restaurants, restaurantId, orders, tablesFetched, tables]);

  const filteredOrders = (orders || []).filter(
    (order) => statusFilter === "All" || order.status === statusFilter
  );

  // Fetch tables function
  const fetchTables = async (restId: string, force = false) => {
    if (!token) return;
    
    // Skip if already fetched and not forcing
    if (tablesFetched && !force) {
      console.log("⏭️ Tables already fetched, skipping...");
      return;
    }
    
    try {
      console.log("🔧 Fetching tables for restaurant:", restId);
      const tablesData = await getAvailableTables(token, restId);
      
      console.log("✅ Tables fetched:", tablesData?.length || 0);
      console.log("📋 Tables data:", tablesData);
      
      setTables(tablesData || []);
      setTablesFetched(true);
      
      // Update cache
      if (ordersCache) {
        ordersCache.tables = tablesData || [];
        ordersCache.restaurantId = restId;
      }
      
    } catch (err) {
      console.error("❌ Error fetching tables:", err);
      setTables([]);
    }
  };

  // Background refresh (no loading state)
  const backgroundRefresh = async () => {
    if (!token || !restaurantId) return;
    
    try {
      console.log("🔄 Orders - Background refresh...");
      
      const [ordersData, waitersData] = await Promise.all([
        getAllOrders(token),
        !isWaiter ? getActiveWaiters(token) : Promise.resolve([])
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
        restaurantId: restaurantId
      };
      setLastUpdated(Date.now());
      
      console.log("✅ Orders - Background refresh complete");
    } catch (err) {
      console.error("❌ Orders - Background refresh failed:", err);
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
      console.log("🔔 Orders - Using cached data");
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
      console.log("🔧 Orders - Fetching fresh data...");
      
      const [ordersData, waitersData] = await Promise.all([
        getAllOrders(token),
        !isWaiter ? getActiveWaiters(token) : Promise.resolve([])
      ]);
      
      setOrders(ordersData || []);
      setWaiters(waitersData || []);
      
      // ✅ FIX: Use restaurant ID from auth context
      console.log("🏪 Restaurant ID from auth:", restaurantId);
      
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
        restaurantId: restaurantId
      };
      setLastUpdated(Date.now());
      
      console.log("✅ Orders fetched:", ordersData?.length || 0);
      console.log("✅ Waiters fetched:", waitersData?.length || 0);
      
      // DEBUG: Check order structure
      if (ordersData && ordersData.length > 0) {
        console.log("📦 First order structure:", JSON.stringify(ordersData[0], null, 2));
        console.log("📦 Restaurant field:", ordersData[0].restaurant);
        console.log("📦 All possible restaurant fields:", {
          restaurant: ordersData[0].restaurant,
          restaurant_id: (ordersData[0] as any).restaurant_id,
          restaurantId: (ordersData[0] as any).restaurantId,
        });
      }
      
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      
      if (ordersCache && !forceRefresh) {
        console.log("🔔 Orders - Using cached data due to error");
        setOrders(ordersCache.orders);
        setWaiters(ordersCache.waiters);
        setTables(ordersCache.tables);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        setOrders([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    console.log("🚀 Initial load effect triggered");
    console.log("   - Token:", !!token);
    console.log("   - Restaurant ID:", restaurantId);
    
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Fetch tables when restaurantId becomes available (only if not already fetched)
  useEffect(() => {
    console.log("🎯 Tables Effect Triggered!");
    console.log("   - Token:", !!token);
    console.log("   - Restaurant ID:", restaurantId);
    console.log("   - Tables Fetched:", tablesFetched);
    console.log("   - Should Fetch:", token && restaurantId && !tablesFetched);
    
    if (token && restaurantId && !tablesFetched) {
      console.log("🎯 ✅ All conditions met - Fetching tables...");
      fetchTables(restaurantId);
    } else {
      console.log("🎯 ❌ Conditions not met for fetching tables");
      if (!token) console.log("   - Missing token");
      if (!restaurantId) console.log("   - Missing restaurantId");
      if (tablesFetched) console.log("   - Already fetched");
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
    setTablesFetched(false); // Reset to force refetch
    fetchOrders(true);
  };

  // Helper to update cache after mutations
  const updateCache = (newOrders: Order[]) => {
    if (ordersCache) {
      ordersCache.orders = newOrders;
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setError(null);
      if (!token) throw new Error("Authentication token not found");

      const updatedOrders = (orders || []).map(order =>
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
      console.error(`❌ Error updating status for order ${orderId}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
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
      console.error(`❌ Error assigning table to order ${orderId}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to assign table');
    }
  };

  const handleAssignWaiter = async (orderId: string, waiterId: string) => {
    try {
      setError(null);
      if (!token) throw new Error("Authentication token not found");

      await assignWaiterToOrder(orderId, waiterId, token);
      await fetchOrders(true);
      
    } catch (err) {
      console.error(`❌ Error assigning waiter to order ${orderId}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to assign waiter');
    }
  };

  const handleOrderSelect = (order: Order) => setSelectedOrder(order);
  const handleCloseSheet = () => setSelectedOrder(null);

  if (loading && !ordersCache) {
    return (
      <div className="mt-15 space-y-6 p-5 md:mt-0">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <div className="text-lg text-gray-600">Loading orders...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-15 space-y-6 p-5 md:mt-0">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground">
            Manage restaurant orders and track order status
            {ordersCache && (
              <span className="text-xs text-gray-500 ml-2">
                • Updated {Math.round((Date.now() - lastUpdated) / 1000)}s ago
              </span>
            )}
            <span className="text-xs text-gray-500 ml-2">
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
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <OrdersStats orders={orders} />

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            {orders.length === 0 ? "No orders found" : "Click on any order to view details and update status"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">No orders found</div>
              <div className="text-gray-400 text-sm mt-2">
                {orders.length === 0 ? "No orders in the system" : `No orders match the "${statusFilter}" filter`}
              </div>
              <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Refresh Orders
              </button>
            </div>
          ) : (
            <OrdersTable orders={filteredOrders} onOrderSelect={handleOrderSelect} waiters={waiters} tables={tables} />
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