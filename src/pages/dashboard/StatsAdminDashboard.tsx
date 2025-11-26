import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Coffee,
  CreditCard,
  Utensils,
  Clock,
  Target,
} from "lucide-react";
import {
  DashboardData,
  DashboardStats,
} from "../../api-services/dashboardService";

interface StatsAdminDashboardProps {
  dashboardData: DashboardData;
  dashboardStats: DashboardStats;
}

const getTrendIcon = (trend: "up" | "down" | "stable") => {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    default:
      return <Minus className="h-4 w-4 text-gray-600" />;
  }
};

// Format Naira currency
const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function StatsAdminDashboard({
  dashboardData,
  dashboardStats,
}: StatsAdminDashboardProps) {
  const { active_orders, todays_revenue, table_occupancy, staff_active } =
    dashboardData;
  const { average_order_value, wait_time_accuracy } = dashboardStats;

  const stats = [
    {
      title: "Active Orders",
      value: active_orders.count,
      change: active_orders.change,
      trend: active_orders.trend,
      period: active_orders.period,
      icon: <Coffee className="text-muted-foreground h-4 w-4" />,
      color: "text-blue-600",
    },
    {
      title: "Today's Revenue",
      value: formatNaira(todays_revenue.amount),
      change: todays_revenue.change_percentage,
      trend: todays_revenue.trend,
      period: todays_revenue.period,
      icon: <CreditCard className="text-muted-foreground h-4 w-4" />,
      color: "text-green-600",
    },
    {
      title: "Table Occupancy",
      value: `${table_occupancy.percentage}%`,
      change: 0,
      trend: "stable" as const,
      period: `${table_occupancy.occupied}/${table_occupancy.total} tables`,
      icon: <Utensils className="text-muted-foreground h-4 w-4" />,
      color: "text-purple-600",
    },
    {
      title: "Active Staff",
      value: staff_active.count,
      change: 0,
      trend: "stable" as const,
      period: staff_active.coverage,
      icon: <Users className="text-muted-foreground h-4 w-4" />,
      color: "text-orange-600",
    },
    {
      title: "Avg Order Value",
      value: formatNaira(average_order_value),
      change: 0,
      trend: "stable" as const,
      period: "per order",
      icon: <Target className="text-muted-foreground h-4 w-4" />,
      color: "text-red-600",
    },
    {
      title: "Wait Time Accuracy",
      value: wait_time_accuracy.avg_accuracy
        ? `${wait_time_accuracy.avg_accuracy}%`
        : "N/A",
      change: 0,
      trend: "stable" as const,
      period: "average accuracy",
      icon: <Clock className="text-muted-foreground h-4 w-4" />,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="transition-shadow duration-200 hover:shadow-lg"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              {getTrendIcon(stat.trend)}
              <span>
                {stat.change !== 0 && (
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
                {stat.period}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
