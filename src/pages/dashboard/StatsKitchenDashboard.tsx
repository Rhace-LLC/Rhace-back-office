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
            className="bg-muted text-muted-foreground flex flex-col gap-6 rounded-xl border animate-pulse"
          >
            <div className="[&:last-child]:pb-6 p-4">
              <div className="text-2xl font-bold">--</div>
              <div className="text-sm">Loading...</div>
            </div>
          </div>
        ))}
      </div>
    );

  if (fetchSummaryError)
    return (
      <div className="col-span-3 bg-red-50 text-muted-foreground rounded-xl border border-red-100 p-6 flex flex-col items-center justify-center gap-3">
        <div className="text-red-500 text-[18px] font-medium tracking-tight">
          Unable to load summary data
        </div>
        <div className="text-red-500 tracking-tight">{fetchSummaryError}</div>
        <button
          onClick={fetchSummary}
          className="px-10 cursor-pointer py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
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
          <p className="text-xs text-muted-foreground">
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
          <p className="text-xs text-muted-foreground">
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
          <p className="text-xs text-muted-foreground">
            {stats.ordersCompleted.period}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


