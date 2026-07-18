"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Users, Clock, DollarSign } from "lucide-react";
import { RootState } from "@/store/store";
import { updateStatsWaiterDashboard } from "@/store/dashboard.slice";
import formatPrice from "@/utils/formatPrice";

export function StatsWaiterDashboard() {
  const dispatch = useDispatch();
  const dashboardStore = useSelector(
    (state: RootState) => state.dashboard.waiterStats
  );

  const [fetchSummaryLoading, setFetchSummaryLoading] = useState(false);
  const [fetchSummaryError, setFetchSummaryError] = useState("");

  const fetchSummary = async () => {
    try {
      setFetchSummaryLoading(true);
      setFetchSummaryError("");

      await new Promise((resolve) => setTimeout(resolve, 2500));

      const dummyData = {
        myTables: { total: 4, occupied: 2, free: 2 },
        pendingOrders: { count: 3, note: "Needs attention" },
        todaysTips: { amount: 45.2, percentChange: 12 },
      };

      dispatch(updateStatsWaiterDashboard(dummyData));
    } catch {
      setFetchSummaryError("Failed to fetch waiter stats");
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
          <CardTitle className="text-sm">My Tables</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{stats.myTables.total}</div>
          <p className="text-muted-foreground text-xs">
            {stats.myTables.occupied} occupied, {stats.myTables.free} free
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Pending Orders</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{stats.pendingOrders.count}</div>
          <p className="text-muted-foreground text-xs">
            {stats.pendingOrders.note}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Today's Tips</CardTitle>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{formatPrice(stats.todaysTips.amount)}</div>
          <p className="text-muted-foreground text-xs">
            +{stats.todaysTips.percentChange}% from yesterday
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
