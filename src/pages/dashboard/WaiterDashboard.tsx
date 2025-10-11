"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { StatsWaiterDashboard } from "./StatsWaiterDashboard";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  WaiterDashboardData,
  Table as TableType,
  Order as OrderType,
} from "@/types/dashboard.types";
import { updateWaiterDashboardData } from "@/store/dashboard.slice";

export const WaiterDashboard = () => {
  const dispatch = useDispatch();
  const waiterDashboardData = useSelector(
    (state: RootState) => state.dashboard.waiterDashboardData
  ) as WaiterDashboardData;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Simulate fetch & dispatch to redux
  const simulateFetchWaiterData = async () => {
    try {
      setLoading(true);
      setError("");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const simulatedTables: TableType[] = [
        { id: 1, waiter: "Sarah Johnson", status: "Occupied", orders: 2 },
        { id: 2, waiter: "Mike Chen", status: "Free", orders: 0 },
        { id: 5, waiter: "Sarah Johnson", status: "Occupied", orders: 1 },
        { id: 8, waiter: "Alex Thompson", status: "Reserved", orders: 0 },
      ];

      const simulatedOrders: OrderType[] = [
        {
          id: "ORD-001",
          table: "Table 5",
          status: "Preparing",
          time: "15:30",
          total: 45.5,
        },
        {
          id: "ORD-002",
          table: "Table 2",
          status: "Pending",
          time: "15:25",
          total: 32.75,
        },
        {
          id: "ORD-003",
          table: "Table 8",
          status: "Served",
          time: "15:20",
          total: 67.25,
        },
        {
          id: "ORD-004",
          table: "Table 1",
          status: "Preparing",
          time: "15:15",
          total: 28.5,
        },
      ];

      const payload: WaiterDashboardData = {
        tables: simulatedTables,
        orders: simulatedOrders,
      };

      dispatch(updateWaiterDashboardData(payload));
    } catch (err) {
      setError("Failed to load waiter data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    simulateFetchWaiterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tables = waiterDashboardData?.tables ?? [];
  const orders = waiterDashboardData?.orders ?? [];

  return (
    <div className="mt-15 space-y-6 p-5 md:mt-0">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Waiter Dashboard</h1>
        <p className="text-muted-foreground">Manage your assigned tables and orders</p>
      </div>

      <StatsWaiterDashboard />

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full mb-2" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="col-span-1 bg-red-50 text-muted-foreground rounded-xl border border-red-100 p-6 flex flex-col items-center justify-center gap-3">
          <div className="text-red-500 text-[18px] font-medium tracking-tight">
            Unable to load waiter data
          </div>
          <div className="text-red-500 tracking-tight">{error}</div>
          <button
            onClick={simulateFetchWaiterData}
            className="px-10 cursor-pointer py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Assigned Tables */}
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Tables</CardTitle>
              <CardDescription>Tables currently under your care</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">Table {table.id}</div>
                      <Badge
                        variant={
                          table.status === "Occupied"
                            ? "destructive"
                            : table.status === "Free"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {table.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {table.orders} order{table.orders !== 1 ? "s" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>Orders requiring your attention</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders
                  .filter((o) => o.status !== "Served")
                  .slice(0, 3)
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <div className="text-sm">{order.id}</div>
                        <div className="text-muted-foreground text-xs">
                          {order.table} • {order.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">${order.total}</div>
                        <Badge
                          variant={order.status === "Pending" ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
