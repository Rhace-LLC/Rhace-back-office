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

export interface DashboardStats {
  peak_hours: any[];
  average_order_value: number;
  order_type_breakdown: any[];
  wait_time_accuracy: {
    avg_accuracy: number | null;
  };
}

// GET /dashboard/dashboard/ - Get main dashboard data
export const getDashboardData = async (
  token: string
): Promise<DashboardData> => {
  try {
    console.log("🔍 Fetching dashboard data...");

    if (!token) {
      throw new Error("No token provided");
    }

    const config = getConfig("/dashboard/dashboard/", "GET", token);
    console.log("📡 Request URL:", config.url);

    const response = await bookiesAxiosInstance(config);

    console.log("✅ Dashboard API Response:", response);

    // Check if response exists
    if (!response) {
      console.warn("⚠️ No response received from dashboard API");
      throw new Error("No response received from dashboard API");
    }

    const responseData = response.data || response;
    console.log("📊 Response data:", responseData);

    // Return whatever data we get, even if empty
    return responseData;
  } catch (error: any) {
    console.error("❌ Dashboard API Error:", error.message);
    throw error;
  }
};

// GET /dashboard/dashboard/stats/ - Get dashboard stats
export const getDashboardStats = async (
  token: string
): Promise<DashboardStats> => {
  try {
    console.log("🔍 Fetching dashboard stats...");

    if (!token) {
      throw new Error("No token provided");
    }

    const config = getConfig("/dashboard/dashboard/stats/", "GET", token);
    console.log("📡 Stats Request URL:", config.url);

    const response = await bookiesAxiosInstance(config);

    console.log("✅ Stats API Response:", response);

    // Check if response exists
    if (!response) {
      console.warn("⚠️ No response received from stats API");
      throw new Error("No response received from stats API");
    }

    const responseData = response.data || response;
    console.log("📈 Response data:", responseData);

    // Return whatever data we get, even if empty
    return responseData;
  } catch (error: any) {
    console.error("❌ Dashboard stats API Error:", error.message);
    throw error;
  }
};
