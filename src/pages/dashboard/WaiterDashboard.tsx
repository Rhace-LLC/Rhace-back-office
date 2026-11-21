import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { BellRing, Check, RefreshCw, Users, UtensilsCrossed } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { getAllOrders, waiterConfirmOrder } from "@/api-services/orderService";
import type { Order } from "@/pages/orders/types/order";
import { useTableAssignments } from "@/pages/tables/useTableAssignments";
import formatPrice from "@/utils/formatPrice";
import { StatCard } from "./StatCard";
import {
  formatOrderType,
  formatTime,
  getErrorMessage,
  needsWaiterConfirmation,
  shortOrderId,
} from "@/utils/orderHelpers";

const REFRESH_INTERVAL_MS = 30_000;

export const WaiterDashboard = () => {
  const { token } = useAuth();
  const {
    userAssignment,
    loading: tablesLoading,
    error: tablesError,
    fetchAssignments,
  } = useTableAssignments();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());

  const fetchOrders = useCallback(
    async (background = false) => {
      if (!token) return;
      try {
        if (background) setRefreshing(true);
        else setLoading(true);
        setError("");
        setOrders(await getAllOrders(token));
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load orders"));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchOrders();
    const id = window.setInterval(() => fetchOrders(true), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [fetchOrders]);

  const pendingOrders = useMemo(
    () => orders.filter(needsWaiterConfirmation),
    [orders]
  );
  const readyOrders = useMemo(
    () => orders.filter((o) => o.status === "ready"),
    [orders]
  );

  const myTables = userAssignment?.tables ?? [];
  const occupiedTables = myTables.filter((t) => t.status === "occupied").length;

  const handleConfirm = async (orderId: string) => {
    if (!token || confirmingIds.has(orderId)) return;
    setConfirmingIds((prev) => new Set(prev).add(orderId));
    try {
      const updated = await waiterConfirmOrder(orderId, token);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, ...updated, waiter_confirmed: true }
            : o
        )
      );
      toast.success("Order confirmed");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to confirm order"));
      // The order may have moved on (e.g. no longer `received`) — resync.
      fetchOrders(true);
    } finally {
      setConfirmingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const handleRefresh = () => {
    fetchOrders(true);
    fetchAssignments();
  };

  return (
    <PageContainer>
      <PageHeader
        title="Waiter Dashboard"
        description="Confirm incoming orders and keep an eye on your tables"
        actions={
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Awaiting Confirmation"
          icon={BellRing}
          loading={loading}
          value={pendingOrders.length}
          hint={pendingOrders.length ? "Needs your attention" : "All caught up"}
        />
        <StatCard
          title="Ready to Serve"
          icon={UtensilsCrossed}
          loading={loading}
          value={readyOrders.length}
          hint="Prepared by the kitchen"
        />
        <StatCard
          title="My Tables"
          icon={Users}
          loading={tablesLoading}
          value={myTables.length}
          hint={
            myTables.length
              ? `${occupiedTables} occupied, ${myTables.length - occupiedTables} free`
              : "No tables assigned today"
          }
        />
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => fetchOrders()}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending confirmation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pending Orders
              {pendingOrders.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {pendingOrders.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Received orders awaiting your confirmation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading &&
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}

              {!loading && pendingOrders.length === 0 && (
                <div className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">
                  No orders awaiting confirmation
                </div>
              )}

              {!loading &&
                pendingOrders.map((order) => {
                  const isConfirming = confirmingIds.has(order.id);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-sm font-semibold text-ink">
                          {shortOrderId(order.id)}
                        </div>
                        <div className="truncate text-xs text-ink-muted">
                          {order.customer_name || "Guest"} •{" "}
                          {formatOrderType(order.order_type)}
                          {order.created_at &&
                            ` • ${formatTime(order.created_at)}`}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="text-right text-sm text-ink">
                          {formatPrice(order.total_price ?? 0)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                          disabled={isConfirming}
                          onClick={() => handleConfirm(order.id)}
                        >
                          <Check />
                          {isConfirming ? "Confirming…" : "Confirm"}
                        </Button>
                      </div>
                    </div>
                  );
                })}

              <Link
                to="/orders"
                className="block pt-1 text-center text-xs text-ink-muted hover:underline"
              >
                View all orders
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Assigned tables */}
        <Card>
          <CardHeader>
            <CardTitle>My Assigned Tables</CardTitle>
            <CardDescription>Tables under your care today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tablesLoading &&
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}

              {!tablesLoading && tablesError && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                  {tablesError}
                </div>
              )}

              {!tablesLoading && !tablesError && myTables.length === 0 && (
                <div className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">
                  You have no tables assigned today
                </div>
              )}

              {!tablesLoading &&
                myTables.map((table) => {
                  const activeOrders = orders.filter(
                    (o) =>
                      String(o.table) === String(table.id) &&
                      !["completed", "cancelled", "delivered"].includes(
                        o.status
                      )
                  ).length;
                  const occupied = table.status === "occupied";
                  return (
                    <div
                      key={table.id}
                      className="flex items-center justify-between rounded-2xl border border-line p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-base font-medium text-ink">
                          Table {table.table_number}
                        </div>
                        <Badge variant={occupied ? "destructive" : "secondary"}>
                          {occupied ? "Occupied" : "Free"}
                        </Badge>
                      </div>
                      <div className="text-sm text-ink-muted">
                        {activeOrders} active order
                        {activeOrders !== 1 ? "s" : ""}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
