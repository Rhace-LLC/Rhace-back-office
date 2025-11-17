import { Table } from "@/store/table.slice";

// === Shared Interfaces ===
export interface RevenueItem {
  name: string; // e.g., "Mon", "Tue", etc.
  revenue: number;
}

export interface Order {
  id: string;
  table: string;
  status: string; // e.g., "Preparing", "Completed", "Pending"
  time: string; // e.g., "15:30"
  total: number; // monetary value
}

export interface StaffActivity {
  staffName: string; // Full name of the staff member
  role: string; // e.g., "Waiter", "Kitchen", "Chef", etc.
  orders: number; // Number of orders handled or completed
  performance: "Excellent" | "Good" | "Average" | "Poor";
}

// === Admin Dashboard Stats ===
export interface AdminDashboardStats {
  activeOrders: {
    count: number;
    change: number; // positive or negative difference from last hour
  };
  todaysRevenue: {
    amount: number; // in dollars or your preferred currency
    percentChange: number; // compared to yesterday
  };
  tableOccupancy: {
    percentage: number; // 0–100
    occupied: number;
    totalTables: number;
  };
  staffActive: {
    count: number;
    note?: string; // e.g., "All shifts covered"
  };
}

// === Waiter Dashboard Stats ===
export interface WaiterDashboardStats {
  myTables: {
    total: number;
    occupied: number;
    free: number;
  };
  pendingOrders: {
    count: number;
    note?: string; // e.g., "Needs attention"
  };
  todaysTips: {
    amount: number; // monetary value (e.g., in USD)
    percentChange: number; // compared to yesterday
  };
}

// === Kitchen Dashboard Stats ===
export interface KitchenDashboardStats {
  ordersInQueue: {
    count: number;
    urgent: number;
  };
  averagePrepTime: {
    timeMinutes: number; // average preparation time in minutes
    status?: string; // e.g., "Within target"
  };
  ordersCompleted: {
    count: number;
    period: string; // e.g., "Today", "This week"
  };
}

// === Dashboard Data (Charts, Tables, Lists) ===
export interface AdminDashboardData {
  revenueData: RevenueItem[];
  staffActivities: StaffActivity[];
}

export interface WaiterDashboardData {
  tables: Table[];
  orders: Order[];
}

export interface KitchenDashboardData {
  orders: Order[];
}
