"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsWaiterDashboard } from "./StatsWaiterDashboard";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import formatPrice from "@/utils/formatPrice";

// ---------------- Types ----------------
export type TableStatus = "Free" | "Occupied" | "Reserved";

export interface Table {
  id: string;
  waiter?: string;
  status: TableStatus;
  orders: number;
}

export type OrderStatus = "Pending" | "Preparing" | "Served";

export interface Order {
  id: string;
  table: string;
  status: OrderStatus;
  time: string;
  total: number;
}

export interface WaiterDashboardData {
  tables: Table[];
  orders: Order[];
}

// =============== Waiter Dashboard ===============
export const WaiterDashboard = () => {
  const waiterDashboardData = useSelector(
    (state: RootState) => state.dashboard.waiterDashboardData
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Simulate fetch & dispatch to redux
  const simulateFetchWaiterData = async () => {
    try {
      setLoading(true);
      setError("");

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      //dispatch(updateWaiterDashboardData(payload));
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium tracking-tight">
          Waiter Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your assigned tables and orders
        </p>
      </div>

      <StatsWaiterDashboard />

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="mb-2 h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="mb-2 h-12 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-muted-foreground col-span-1 flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50 p-6">
          <div className="text-[18px] font-medium tracking-tight text-red-500">
            Unable to load waiter data
          </div>
          <div className="tracking-tight text-red-500">{error}</div>
          <button
            onClick={simulateFetchWaiterData}
            className="cursor-pointer rounded-lg bg-red-500 px-10 py-2 text-white transition hover:bg-red-600"
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
              <CardDescription>
                Tables currently under your care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tables.map((table) => {
                  // Compute status based on is_available
                  const status = table.is_available ? "Free" : "Occupied";

                  // Compute orders count dynamically if you have orders data
                  const ordersCount = orders.filter(
                    (o) => o.table === table.table_number
                  ).length;

                  return (
                    <div
                      key={table.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg">
                          Table {table.table_number}
                        </div>
                        <Badge
                          variant={
                            status === "Occupied"
                              ? "destructive"
                              : status === "Free"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {ordersCount} order{ordersCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>
                  Orders requiring your attention
                </CardDescription>
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
                        <div className="text-sm">{formatPrice(order.total)}</div>
                        <Badge
                          variant={
                            order.status === "Pending" ? "secondary" : "default"
                          }
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
