import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdminDashboardData, AdminDashboardStats, KitchenDashboardData, KitchenDashboardStats, WaiterDashboardData, WaiterDashboardStats } from "@/types/dashboard.types";

// === Combined Redux Slice State ===
export interface DashboardState {
  adminDashboardData: AdminDashboardData;
  waiterDashboardData: WaiterDashboardData;
  kitchenDashboardData: KitchenDashboardData;

  adminStats: AdminDashboardStats;
  waiterStats: WaiterDashboardStats;
  kitchenStats: KitchenDashboardStats;
}



const initialState: DashboardState = {
  adminDashboardData: { revenueData: [], staffActivities: [] },
  waiterDashboardData: { tables: [], orders: [] },
  kitchenDashboardData: { orders: [] },
  adminStats: {
    activeOrders: { count: 0, change: 0 },
    todaysRevenue: { amount: 0, percentChange: 0 },
    tableOccupancy: { percentage: 0, occupied: 0, totalTables: 0 },
    staffActive: { count: 0, note: "" },
  },
  waiterStats: {
    myTables: { total: 0, occupied: 0, free: 0 },
    pendingOrders: { count: 0, note: "" },
    todaysTips: { amount: 0, percentChange: 0 },
  },
  kitchenStats: {
    ordersInQueue: { count: 0, urgent: 0 },
    averagePrepTime: { timeMinutes: 0, status: "" },
    ordersCompleted: { count: 0, period: "" },
  },
};



// === Slice ===
export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // ADMIN STATS
    updateStatsAdminDashboard(
      state,
      action: PayloadAction<AdminDashboardStats>
    ) {
      state.adminStats = action.payload;
    },

    // WAITER STATS
    updateStatsWaiterDashboard(
      state,
      action: PayloadAction<WaiterDashboardStats>
    ) {
      state.waiterStats = action.payload;
    },

    // KITCHEN STATS
    updateStatsKitchenDashboard(
      state,
      action: PayloadAction<KitchenDashboardStats>
    ) {
      state.kitchenStats = action.payload;
    },


    // Replace entire Admin Dashboard data
    updateAdminDashboardData(state, action: PayloadAction<AdminDashboardData>) {
      state.adminDashboardData = action.payload;
    },

    // Update only Revenue Data (chart)
    updateAdminRevenueData(state, action: PayloadAction<AdminDashboardData["revenueData"]>) {
      state.adminDashboardData.revenueData = action.payload;
    },

    // Update only Staff Activities (table)
    updateAdminStaffActivities(state, action: PayloadAction<AdminDashboardData["staffActivities"]>) {
      state.adminDashboardData.staffActivities = action.payload;
    },

    updateWaiterDashboardData(
      state,
      action: PayloadAction<WaiterDashboardData>
    ) {
      state.waiterDashboardData = action.payload;
    },
    updateKitchenDashboardData(
      state,
      action: PayloadAction<KitchenDashboardData>
    ) {
      state.kitchenDashboardData = action.payload;
    },
  },
});

// === Export Actions ===
export const {
  updateStatsAdminDashboard,
  updateStatsWaiterDashboard,
  updateStatsKitchenDashboard,
  updateAdminDashboardData,
  updateAdminRevenueData,
  updateAdminStaffActivities,
  updateWaiterDashboardData,
  updateKitchenDashboardData,
} = dashboardSlice.actions;

// === Export Reducer ===
export default dashboardSlice.reducer;