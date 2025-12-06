"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState, ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  AlertCircle,
  Users,
  Coffee,
  CreditCard,
  Utensils,
  Target,
  Clock,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getDashboardData,
  getDashboardStats,
  DashboardData,
  DashboardStats,
} from "../../api-services/dashboardService";

// Empty data structure
const emptyData: DashboardData = {
  active_orders: {
    count: 0,
    change: 0,
    period: "No data available",
    trend: "stable",
  },
  todays_revenue: {
    amount: 0,
    change_percentage: 0,
    period: "No data available",
    yesterday_amount: 0,
    trend: "stable",
  },
  table_occupancy: { percentage: 0, occupied: 0, total: 0, available: 0 },
  staff_active: { count: 0, total_shifts: 0, coverage: "No data available" },
  weekly_revenue: [],
  staff_activity: [],
};

const emptyStats: DashboardStats = {
  peak_hours: [],
  average_order_value: 0,
  order_type_breakdown: [],
  wait_time_accuracy: {
    avg_accuracy: null,
  },
};

// ============== CACHE SETUP ==============
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

interface DashboardCache {
  data: DashboardData;
  stats: DashboardStats;
  lastFetched: number;
}

let dashboardCache: DashboardCache | null = null;

const isCacheValid = (): boolean => {
  if (!dashboardCache) return false;
  return Date.now() - dashboardCache.lastFetched < CACHE_DURATION;
};
// =========================================

// Format Naira with k notation for large numbers
const formatNaira = (amount: number): string => {
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(1)}k`;
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format regular numbers with k notation
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

interface StatCard {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  period: string;
  icon: ReactElement;
  hasData: boolean;
}

interface OrderTypeData {
  name: string;
  value: number;
  count: number;
  [key: string]: any;
}

interface WeeklyRevenueData {
  day: string;
  date: string;
  revenue: number;
}

export const AdminDashboard = () => {
  const auth = useAuth();
  const token = auth?.token;

  // Initialize state from cache if available
  const [dashboardData, setDashboardData] = useState<DashboardData>(
    () => dashboardCache?.data ?? emptyData
  );
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(
    () => dashboardCache?.stats ?? emptyStats
  );
  const [loading, setLoading] = useState(() => !isCacheValid());
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(
    () => dashboardCache?.lastFetched ?? Date.now()
  );

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  // Check if data has any meaningful values
  const hasData = (data: unknown): boolean => {
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === "object") {
      // Check if any value is non-zero or non-empty
      return Object.values(data).some((val) => {
        if (typeof val === "number") return val !== 0;
        if (typeof val === "string")
          return val !== "" && val !== "No data available";
        if (Array.isArray(val)) return val.length > 0;
        return val !== null && val !== undefined;
      });
    }
    if (typeof data === "number") return data !== 0;
    return data !== "" && data !== null && data !== undefined;
  };

  // Format hour for display (convert 11.0 to "11:00 AM")
  const formatHour = (hour: number): string => {
    const hourInt = Math.floor(hour);
    const minutes = hour % 1 === 0 ? "00" : "30";
    const period = hourInt >= 12 ? "PM" : "AM";
    const displayHour = hourInt % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Transform order type breakdown for Pie chart - FIXED VERSION
  const getOrderTypeData = (): OrderTypeData[] => {
    if (
      !dashboardStats.order_type_breakdown ||
      dashboardStats.order_type_breakdown.length === 0
    ) {
      return [];
    }

    return dashboardStats.order_type_breakdown.map((item: any) => {
      // Safely get order type from various possible property names
      const orderType = 
        item.order_type || 
        item.type || 
        item.name || 
        item.category ||
        'Unknown';
      
      // Safely format the name - handle cases where orderType might not be a string
      let formattedName = 'Unknown';
      if (typeof orderType === 'string') {
        try {
          formattedName = orderType.charAt(0).toUpperCase() + 
                         orderType.slice(1).replace("-", " ").replace("_", " ");
        } catch (e) {
          console.error('Error formatting order type:', e);
          formattedName = orderType;
        }
      }
      
      // Safely get count from various possible property names
      const count = item.count || item.value || item.total || 0;
      
      return {
        name: formattedName,
        value: count,
        count: count,
        ...item // Include all original properties
      };
    });
  };

  // Generate empty weekly revenue data for chart
  const getWeeklyRevenueData = (): WeeklyRevenueData[] => {
    if (
      dashboardData.weekly_revenue &&
      dashboardData.weekly_revenue.length > 0
    ) {
      return dashboardData.weekly_revenue;
    }

    // Return empty data for each day of the week
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      day,
      date: "",
      revenue: 0,
    }));
  };

  // Background refresh (no loading state)
  const backgroundRefresh = async (): Promise<void> => {
    if (!token) return;

    try {

      const [dataResult, statsResult] = await Promise.allSettled([
        getDashboardData(token),
        getDashboardStats(token),
      ]);

      let newData = emptyData;
      let newStats = emptyStats;

      // Process dashboard data
      if (dataResult.status === "fulfilled" && dataResult.value) {
        newData = { ...emptyData, ...dataResult.value };
      }

      // Process stats data
      if (statsResult.status === "fulfilled" && statsResult.value) {
        newStats = { ...emptyStats, ...statsResult.value };
      }

      setDashboardData(newData);
      setDashboardStats(newStats);

      // Update cache
      dashboardCache = {
        data: newData,
        stats: newStats,
        lastFetched: Date.now(),
      };
      setLastUpdated(Date.now());

    } catch (err) {
      console.error("❌ Dashboard - Background refresh failed:", err);
    }
  };

  // Main fetch with cache support
  const fetchDashboardData = async (forceRefresh = false): Promise<void> => {
    if (!token) {
      setError("Please log in to view dashboard");
      setLoading(false);
      return;
    }

    // Use cache if valid and not forcing refresh
    if (!forceRefresh && isCacheValid() && dashboardCache) {
      setDashboardData(dashboardCache.data);
      setDashboardStats(dashboardCache.stats);
      setLoading(false);

      // Background refresh if cache is getting stale
      const cacheAge = Date.now() - dashboardCache.lastFetched;
      if (cacheAge > CACHE_DURATION / 2) {
        backgroundRefresh();
      }
      return;
    }

    // Only show loading if no cached data
    if (!dashboardCache) {
      setLoading(true);
    }

    try {
      setError("");

      const [dataResult, statsResult] = await Promise.allSettled([
        getDashboardData(token),
        getDashboardStats(token),
      ]);

      let newData = emptyData;
      let newStats = emptyStats;
      let hasError = false;

      // Process dashboard data with proper error handling
      if (dataResult.status === "fulfilled" && dataResult.value) {
        newData = { ...emptyData, ...dataResult.value };
      } else {
        hasError = true;
      }

      // Process stats data with proper error handling
      if (statsResult.status === "fulfilled" && statsResult.value) {
        newStats = { ...emptyStats, ...statsResult.value };
      } else {
        hasError = true;
      }

      setDashboardData(newData);
      setDashboardStats(newStats);

      // Update cache
      dashboardCache = {
        data: newData,
        stats: newStats,
        lastFetched: Date.now(),
      };
      setLastUpdated(Date.now());

      if (hasError) {
        setError("Failed to load some dashboard data");
      }
    } catch (err: unknown) {
      console.error("Error in fetch process:", err);
      setError("Failed to load dashboard data");

      // Use cached data on error if available
      if (dashboardCache && !forceRefresh) {
        setDashboardData(dashboardCache.data);
        setDashboardStats(dashboardCache.stats);
      } else {
        setDashboardData(emptyData);
        setDashboardStats(emptyStats);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchDashboardData(true);
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Background refresh interval
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(backgroundRefresh, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Custom tooltip for bar chart
  const renderBarTooltip = (props: any) => {
    const { active, payload, label } = props as any;
    if (active && payload && payload.length) {
      return (
        <div className="rounded border border-gray-300 bg-white p-3 shadow-sm">
          <p className="font-medium">{`Day: ${label}`}</p>
          <p className="text-blue-600">
            {`Revenue: ₦${payload && payload[0] && payload[0].value ? payload[0].value.toLocaleString() : 0}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const renderPieTooltip = (props: any) => {
    const { active, payload } = props as any;
    if (active && payload && payload.length) {
      return (
        <div className="rounded border border-gray-300 bg-white p-3 shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-blue-600">{`${payload[0].value} orders`}</p>
        </div>
      );
    }
    return null;
  };

  // Stats cards data - Updated to match actual API response
  const stats: StatCard[] = [
    {
      title: "Active Orders",
      value: formatCount(dashboardData.active_orders?.count || 0),
      change: dashboardData.active_orders?.change || 0,
      trend: dashboardData.active_orders?.trend || "stable",
      period: dashboardData.active_orders?.period || "No data",
      icon: <Coffee className="text-muted-foreground h-4 w-4" />,
      hasData:
        hasData(dashboardData.active_orders?.count) &&
        dashboardData.active_orders.count > 0,
    },
    {
      title: "Today's Revenue",
      value: formatNaira(dashboardData.todays_revenue?.amount || 0),
      change: dashboardData.todays_revenue?.change_percentage || 0,
      trend: dashboardData.todays_revenue?.trend || "stable",
      period: dashboardData.todays_revenue?.period || "No data",
      icon: <CreditCard className="text-muted-foreground h-4 w-4" />,
      hasData:
        hasData(dashboardData.todays_revenue?.amount) &&
        dashboardData.todays_revenue.amount > 0,
    },
    {
      title: "Table Occupancy",
      value: `${dashboardData.table_occupancy?.percentage || 0}%`,
      change: 0,
      trend: "stable",
      period: `${dashboardData.table_occupancy?.occupied || 0}/${dashboardData.table_occupancy?.total || 0} tables`,
      icon: <Utensils className="text-muted-foreground h-4 w-4" />,
      hasData:
        hasData(dashboardData.table_occupancy?.percentage) &&
        dashboardData.table_occupancy.percentage > 0,
    },
    {
      title: "Active Staff",
      value: formatCount(dashboardData.staff_active?.count || 0),
      change: 0,
      trend: "stable",
      period: dashboardData.staff_active?.coverage || "No data",
      icon: <Users className="text-muted-foreground h-4 w-4" />,
      hasData:
        hasData(dashboardData.staff_active?.count) &&
        dashboardData.staff_active.count > 0,
    },
    {
      title: "Avg Order Value",
      value: formatNaira(dashboardStats.average_order_value || 0),
      change: 0,
      trend: "stable",
      period: "per order",
      icon: <Target className="text-muted-foreground h-4 w-4" />,
      hasData:
        hasData(dashboardStats.average_order_value) &&
        dashboardStats.average_order_value > 0,
    },
    {
      title: "Total Orders Today",
      value: formatCount(
        getOrderTypeData().reduce(
          (total, type) => total + (type.count || 0),
          0
        ) || 0
      ),
      change: 0,
      trend: "stable",
      period: "all order types",
      icon: <BarChart3 className="text-muted-foreground h-4 w-4" />,
      hasData:
        hasData(dashboardStats.order_type_breakdown) &&
        dashboardStats.order_type_breakdown.length > 0,
    },
  ];

  // Calculate total orders from order type breakdown
  const totalOrders = getOrderTypeData().reduce(
    (total, type) => total + (type.count || 0),
    0
  );

  if (loading && !dashboardCache) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-1 h-7 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="mb-2 h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight"> Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Restaurant overview and performance metrics
            {dashboardCache && (
              <span className="ml-2 text-xs text-gray-500">
                • Updated {Math.round((Date.now() - lastUpdated) / 1000)}s ago
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-blue-400"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

    

      {/* Error Message */}
      {error && (
        <div className="rounded border border-red-400 bg-red-100 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`transition-shadow duration-200 hover:shadow-lg ${!stat.hasData ? "opacity-75" : ""}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${!stat.hasData ? "text-gray-500" : ""}`}
              >
                {stat.value}
              </div>
              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                {!stat.hasData ? (
                  <Minus className="h-3 w-3 text-gray-400" />
                ) : (
                  getTrendIcon(stat.trend)
                )}
                <span className={!stat.hasData ? "text-gray-500" : ""}>
                  {stat.hasData && stat.change !== 0 && (
                    <span
                      className={
                        stat.trend === "up"
                          ? "text-green-600"
                          : stat.trend === "down"
                            ? "text-red-600"
                            : "text-gray-600"
                      }
                    >
                      {stat.change > 0 ? "+" : ""}
                      {stat.change}%
                    </span>
                  )}{" "}
                  {!stat.hasData ? "No data" : stat.period}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Revenue</CardTitle>
          <CardDescription>
            {hasData(dashboardData.weekly_revenue)
              ? `Revenue performance over the last 7 days • Total: ${formatNaira(
                  dashboardData.weekly_revenue.reduce(
                    (sum, day) => sum + (day.revenue || 0),
                    0
                  )
                )}`
              : "No revenue data available for the past 7 days"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getWeeklyRevenueData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(value) => `₦${value}`} />
              <Tooltip content={renderBarTooltip} />
              <Bar
                dataKey="revenue"
                fill={
                  hasData(dashboardData.weekly_revenue) ? "#2563eb" : "#9ca3af"
                }
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          {!hasData(dashboardData.weekly_revenue) && (
            <div className="mt-2 text-center text-sm text-gray-500">
              No revenue data recorded this week
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Types & Peak Hours Side by Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Types */}
        <Card>
          <CardHeader>
            <CardTitle>Order Types</CardTitle>
            <CardDescription>
              {hasData(dashboardStats.order_type_breakdown)
                ? `Breakdown of ${formatCount(totalOrders)} total orders`
                : "No order type data available"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasData(dashboardStats.order_type_breakdown) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getOrderTypeData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: any) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {getOrderTypeData().map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][
                              index % 4
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={renderPieTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <Target className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No order type data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>
              {hasData(dashboardStats.peak_hours)
                ? "Busiest hours based on order volume"
                : "No peak hour data available"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasData(dashboardStats.peak_hours) ? (
              <div className="space-y-3">
                {dashboardStats.peak_hours.map((hour: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="font-medium">{formatHour(hour.hour)}</span>
                    <Badge variant="secondary">
                      {formatCount(hour.order_count || hour.count || 0)} orders
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No peak hour data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              {hasData(dashboardStats.average_order_value) ||
              hasData(dashboardStats.wait_time_accuracy?.avg_accuracy)
                ? "Key operational indicators"
                : "No performance data available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasData(dashboardStats.average_order_value) ||
            hasData(dashboardStats.wait_time_accuracy?.avg_accuracy) ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      Average Order Value
                    </span>
                  </div>
                  <span className="font-bold">
                    {formatNaira(dashboardStats.average_order_value || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">
                      Wait Time Accuracy
                    </span>
                  </div>
                  <span className="font-bold">
                    {dashboardStats.wait_time_accuracy?.avg_accuracy
                      ? `${dashboardStats.wait_time_accuracy.avg_accuracy}%`
                      : "0%"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Staff Coverage</span>
                  </div>
                  <span className="font-bold">
                    {dashboardData.staff_active?.coverage ||
                      "0/0 shifts covered"}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <Target className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No performance data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table Status */}
        <Card>
          <CardHeader>
            <CardTitle>Table Status</CardTitle>
            <CardDescription>
              {hasData(dashboardData.table_occupancy?.total) &&
              dashboardData.table_occupancy.total > 0
                ? "Current restaurant capacity"
                : "No table data available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasData(dashboardData.table_occupancy?.total) &&
            dashboardData.table_occupancy.total > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Occupancy Rate</span>
                  <Badge
                    variant={
                      dashboardData.table_occupancy.percentage >= 80
                        ? "default"
                        : "secondary"
                    }
                  >
                    {dashboardData.table_occupancy.percentage}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Occupied Tables</span>
                  <span className="font-semibold">
                    {dashboardData.table_occupancy.occupied} /{" "}
                    {dashboardData.table_occupancy.total}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Available Tables</span>
                  <Badge
                    variant={
                      dashboardData.table_occupancy.available > 0
                        ? "default"
                        : "destructive"
                    }
                  >
                    {dashboardData.table_occupancy.available} available
                  </Badge>
                </div>

                {/* Occupancy Visualization */}
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Capacity</span>
                    <span>
                      {dashboardData.table_occupancy.occupied}/
                      {dashboardData.table_occupancy.total}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: `${dashboardData.table_occupancy.percentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <Utensils className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No table data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staff Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Activity</CardTitle>
          <CardDescription>
            {hasData(dashboardData.staff_activity)
              ? "Team performance summary"
              : "No staff activity data available"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasData(dashboardData.staff_activity) ? (
            <div className="space-y-3">
              {dashboardData.staff_activity.map((staff, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{staff.staff_name}</p>
                    <p className="text-muted-foreground text-sm capitalize">
                      {staff.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCount(staff.orders)} orders
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Rating: {staff.performance}/5
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No staff activity data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};