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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock } from "lucide-react";
import { StatsKitchenDashboard } from "./StatsKitchenDashboard";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  KitchenDashboardData,
  Order as OrderType,
} from "@/types/dashboard.types";
import { updateKitchenDashboardData } from "@/store/dashboard.slice";

export const KitchenDashboard = () => {
  const dispatch = useDispatch();
  const kitchenDashboardData = useSelector(
    (state: RootState) => state.dashboard.kitchenDashboardData
  ) as KitchenDashboardData;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Simulate network fetch and dispatch
  const simulateFetchKitchenData = async () => {
    try {
      setLoading(true);
      setError("");

      await new Promise((resolve) => setTimeout(resolve, 2000));

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

      // Dispatch to redux slice
      dispatch(updateKitchenDashboardData({ orders: simulatedOrders }));
    } catch (err) {
      setError("Failed to load kitchen data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    simulateFetchKitchenData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orders = kitchenDashboardData?.orders ?? [];

  return (
    <div className="mt-15 space-y-6 p-5 md:mt-0">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Kitchen Dashboard</h1>
        <p className="text-muted-foreground">
          Manage incoming orders and preparation queue
        </p>
      </div>

      <StatsKitchenDashboard />

      {/* Loading / Error / Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full mb-2" />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <div className="col-span-1 bg-red-50 text-muted-foreground rounded-xl border border-red-100 p-6 flex flex-col items-center justify-center gap-3">
          <div className="text-red-500 text-[18px] font-medium tracking-tight">
            Unable to load kitchen data
          </div>
          <div className="text-red-500 tracking-tight">{error}</div>
          <button
            onClick={simulateFetchKitchenData}
            className="px-10 cursor-pointer py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Orders Queue</CardTitle>
            <CardDescription>Orders awaiting preparation with timer</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Time Elapsed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.table}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {/* Static elapsed for demo; replace with timer logic if needed */}
                        8m
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={order.status === "Pending" ? "destructive" : "default"}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Start
                        </Button>
                        <Button size="sm" className="bg-[#2542e3]">
                          Complete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
