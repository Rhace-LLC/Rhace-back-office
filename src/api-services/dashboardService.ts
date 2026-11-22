import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";

export interface DashboardData {
  active_orders: {
    count: number;
    change: number;
    period: string;
    trend: "up" | "down" | "stable";
  };
  todays_revenue: {
    amount: number;
    change_percentage: number;
    period: string;
    yesterday_amount: number;
    trend: "up" | "down" | "stable";
  };
  table_occupancy: {
    percentage: number;
    occupied: number;
    total: number;
    available: number;
  };
  staff_active: {
    count: number;
    total_shifts: number;
    coverage: string;
  };
  weekly_revenue: Array<{
    day: string;
    date: string;
    revenue: number;
  }>;
  staff_activity: Array<{
    staff_name: string;
    role: string;
    orders: number;
    performance: number;
  }>;
}

/** Peak-hour entry. The backend has used both `order_count` and `count`. */
export interface PeakHour {
  hour: number;
  order_count?: number;
  count?: number;
}

/** Order-type breakdown entry. Field names have varied across backend versions. */
export interface OrderTypeBreakdownItem {
  order_type?: string;
  type?: string;
  name?: string;
  category?: string;
  count?: number;
  value?: number;
  total?: number;
}

export interface DashboardStats {
  peak_hours: PeakHour[];
  average_order_value: number;
  order_type_breakdown: OrderTypeBreakdownItem[];
  wait_time_accuracy: {
    avg_accuracy: number | null;
  };
}

// GET /dashboard/dashboard/ - Get main dashboard data
export const getDashboardData = async (
  token: string
): Promise<DashboardData> => {
  if (!token) {
    throw new Error("No token provided");
  }

  const config = getConfig("/dashboard/dashboard/", "GET", token);
  const response = await bookiesAxiosInstance(config);

  if (!response) {
    throw new Error("No response received from dashboard API");
  }

  const responseData = response.data || response;
  return responseData;
};

// GET /dashboard/dashboard/stats/ - Get dashboard stats
export const getDashboardStats = async (
  token: string
): Promise<DashboardStats> => {
  if (!token) {
    throw new Error("No token provided");
  }

  const config = getConfig("/dashboard/dashboard/stats/", "GET", token);
  const response = await bookiesAxiosInstance(config);

  if (!response) {
    throw new Error("No response received from stats API");
  }

  const responseData = response.data || response;
  return responseData;
};
