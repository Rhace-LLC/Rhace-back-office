"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, Users, ChefHat } from "lucide-react";
import { RootState } from "@/store/store";
import { updateStatsAdminDashboard } from "@/store/dashboard.slice";

export function StatsAdminDashboard() {
  const dispatch = useDispatch();
  const dashboardStore = useSelector(
    (state: RootState) => state.dashboard.adminStats
  );

  const [fetchSummaryLoading, setFetchSummaryLoading] = useState(false);
  const [fetchSummaryError, setFetchSummaryError] = useState("");

  const fetchSummary = async () => {
    try {
      setFetchSummaryLoading(true);
      setFetchSummaryError("");

      await new Promise((resolve) => setTimeout(resolve, 2500)); // simulate delay

      const dummyData = {
        activeOrders: { count: 24, change: 3 },
        todaysRevenue: { amount: 2847, percentChange: 8 },
        tableOccupancy: { percentage: 75, occupied: 12, totalTables: 16 },
        staffActive: { count: 8, note: "All shifts covered" },
      };

      dispatch(updateStatsAdminDashboard(dummyData));
    } catch (error: any) {
      setFetchSummaryError("Failed to fetch admin stats");
    } finally {
      setFetchSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (fetchSummaryLoading)
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
      <div className="col-span-4 bg-red-50 text-muted-foreground rounded-xl border border-red-100 p-6 flex flex-col items-center justify-center gap-3">
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Active Orders</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{stats.activeOrders.count}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.activeOrders.change} from last hour
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Today's Revenue</CardTitle>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">${stats.todaysRevenue.amount}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.todaysRevenue.percentChange}% from yesterday
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Table Occupancy</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{stats.tableOccupancy.percentage}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.tableOccupancy.occupied}/{stats.tableOccupancy.totalTables} tables
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Staff Active</CardTitle>
          <ChefHat className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{stats.staffActive.count}</div>
          <p className="text-xs text-muted-foreground">{stats.staffActive.note}</p>
        </CardContent>
      </Card>
    </div>
  );
}


