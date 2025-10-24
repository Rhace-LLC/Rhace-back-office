"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ChefHat, Clock, DollarSign } from "lucide-react";
import { RootState } from "@/store/store";
import { updateStatsKitchenDashboard } from "@/store/dashboard.slice";

export function StatsKitchenDashboard() {
  const dispatch = useDispatch();
  const dashboardStore = useSelector(
    (state: RootState) => state.dashboard.kitchenStats
  );

  const [fetchSummaryLoading, setFetchSummaryLoading] = useState(false);
  const [fetchSummaryError, setFetchSummaryError] = useState("");

  const fetchSummary = async () => {
    try {
      setFetchSummaryLoading(true);
      setFetchSummaryError("");

      await new Promise((resolve) => setTimeout(resolve, 2500));

      const dummyData = {
        ordersInQueue: { count: 7, urgent: 2 },
        averagePrepTime: { timeMinutes: 12, status: "Within target" },
        ordersCompleted: { count: 24, period: "Today" },
      };

      dispatch(updateStatsKitchenDashboard(dummyData));
    } catch {
      setFetchSummaryError("Failed to fetch kitchen stats");
    } finally {
      setFetchSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (fetchSummaryLoading)
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted text-muted-foreground flex animate-pulse flex-col gap-6 rounded-xl border"
          >
            <div className="p-4 [&:last-child]:pb-6">
              <div className="text-2xl font-bold">--</div>
              <div className="text-sm">Loading...</div>
            </div>
          </div>
        ))}
      </div>
    );

  if (fetchSummaryError)
    return (
      <div className="text-muted-foreground col-span-3 flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50 p-6">
        <div className="text-[18px] font-medium tracking-tight text-red-500">
          Unable to load summary data
        </div>
        <div className="tracking-tight text-red-500">{fetchSummaryError}</div>
        <button
          onClick={fetchSummary}
          className="cursor-pointer rounded-lg bg-red-500 px-10 py-2 text-white transition hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );

  const stats = dashboardStore;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Orders in Queue</CardTitle>
          <ChefHat className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{stats.ordersInQueue.count}</div>
          <p className="text-muted-foreground text-xs">
            {stats.ordersInQueue.urgent} urgent
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Avg Prep Time</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{stats.averagePrepTime.timeMinutes}m</div>
          <p className="text-muted-foreground text-xs">
            {stats.averagePrepTime.status}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Orders Completed</CardTitle>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{stats.ordersCompleted.count}</div>
          <p className="text-muted-foreground text-xs">
            {stats.ordersCompleted.period}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
