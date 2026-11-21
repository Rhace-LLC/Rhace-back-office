import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BellRing, ChefHat, Clock, CookingPot, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { getAllOrders, updateOrderStatus } from "@/api-services/orderService";
import type { Order, OrderStatus } from "@/pages/orders/types/order";
import { StatCard } from "./StatCard";
import {
  formatElapsed,
  formatOrderType,
  getErrorMessage,
  isConfirmedForKitchen,
  needsWaiterConfirmation,
  shortOrderId,
} from "@/utils/orderHelpers";

const REFRESH_INTERVAL_MS = 30_000;

export const KitchenDashboard = () => {
  const { token } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  // Re-render every minute so elapsed timers stay current.
  const [now, setNow] = useState(Date.now());

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
    const poll = window.setInterval(() => fetchOrders(true), REFRESH_INTERVAL_MS);
    const tick = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, [fetchOrders]);

  // Oldest first — the kitchen works the queue in order.
  const queue = useMemo(
    () =>
      orders
        .filter((o) => isConfirmedForKitchen(o) || o.status === "preparing")
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
    [orders]
  );
  const toStart = queue.filter((o) => o.status === "received").length;
  const preparing = queue.filter((o) => o.status === "preparing").length;
  const ready = orders.filter((o) => o.status === "ready").length;
  const awaitingWaiter = orders.filter(needsWaiterConfirmation).length;

  const moveTo = async (orderId: string, status: OrderStatus) => {
    if (!token || updatingIds.has(orderId)) return;
    setUpdatingIds((prev) => new Set(prev).add(orderId));
    try {
      await updateOrderStatus(orderId, { status }, token);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      toast.success(
        status === "preparing" ? "Preparation started" : "Marked as ready"
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update order"));
      fetchOrders(true);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Kitchen Dashboard"
        description="Confirmed orders waiting to be prepared"
        actions={
          <Button
            variant="outline"
            onClick={() => fetchOrders(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="To Start"
          icon={ChefHat}
          loading={loading}
          value={toStart}
          hint="Confirmed by a waiter"
        />
        <StatCard
          title="Preparing"
          icon={CookingPot}
          loading={loading}
          value={preparing}
          hint="In progress"
        />
        <StatCard
          title="Ready for Pickup"
          icon={Clock}
          loading={loading}
          value={ready}
          hint="Waiting for a waiter"
        />
        <StatCard
          title="Awaiting Waiter"
          icon={BellRing}
          loading={loading}
          value={awaitingWaiter}
          hint="Not yet confirmed"
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

      <Card>
        <CardHeader>
          <CardTitle>Orders Queue</CardTitle>
          <CardDescription>Oldest orders first</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="mb-2 h-12 w-full" />
            ))
          ) : queue.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">
              No orders in the queue
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Waiting</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((order) => {
                  const busy = updatingIds.has(order.id);
                  const isPreparing = order.status === "preparing";
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-semibold">
                        {shortOrderId(order.id)}
                      </TableCell>
                      <TableCell>{formatOrderType(order.order_type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-ink-secondary">
                          <Clock className="h-4 w-4" />
                          {formatElapsed(order.created_at, now)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isPreparing ? "default" : "secondary"}>
                          {isPreparing ? "Preparing" : "To start"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isPreparing ? (
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() => moveTo(order.id, "ready")}
                          >
                            {busy ? "Updating…" : "Mark Ready"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => moveTo(order.id, "preparing")}
                          >
                            {busy ? "Updating…" : "Start"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};
