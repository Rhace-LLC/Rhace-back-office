import React, { useState, useEffect, useCallback } from "react";
import {
  getAuditSummary,
  getStaffReports,
  getStaffActivity,
  AuditSummary,
  StaffReportItem,
  StaffActivityItem,
  ActionType,
} from "@/api-services/staffService";
import { getShiftLogs, ShiftLog } from "@/api-services/shift.service";
import { useAuth } from "@/contexts/AuthContext";
import { getAllStaff, StaffMember } from "@/api-services/auth.service";
import { RootState } from "@/store/store";

import { useDispatch, useSelector } from "react-redux";
import { flattenStaffByRole } from "./extras";
import { updateStaffData } from "@/store/staff.slice";
import { parseError } from "@/api-services/utils/parseError";

export const StaffIntelligenceAnalytics: React.FC = () => {
  const { token, restaurants } = useAuth();
  const currentRestaurant = restaurants[0];
  const restaurantId = currentRestaurant?.id || "";

  // State for metrics & list data
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [reports, setReports] = useState<StaffReportItem[]>([]);
  const [activities, setActivities] = useState<StaffActivityItem[]>([]);
  const [activityTotalCount, setActivityTotalCount] = useState<number>(0);
  const [shiftLogs, setShiftLogs] = useState<ShiftLog[]>([]);

  // UI & UX states
  const [activeTab, setActiveTab] = useState<"performance" | "audit" | "shifts">("performance");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Query Parameters state
  const [staffId, setStaffId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [actionType, setActionType] = useState<ActionType>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Fetch Summary data whenever restaurant ID or filters change
  const fetchSummaryData = useCallback(async () => {
    if (!restaurantId.trim()) {
      setSummary(null);
      return;
    }
    try {
      const response = await getAuditSummary({ restaurant_id: restaurantId }, token);
      setSummary(response);
    } catch (err: any) {
      console.error("Failed to fetch audit summary:", err);
    }
  }, [restaurantId, token]);

  // Fetch Reports data
  const fetchReportsData = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (restaurantId) params.restaurant_id = restaurantId;
      if (staffId) params.staff_id = staffId;
      if (role) params.role = role;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await getStaffReports(params, token);
      setReports(response || []);
    } catch (err: any) {
      console.error("Failed to fetch staff reports:", err);
      throw err;
    }
  }, [restaurantId, staffId, role, startDate, endDate, token]);

  // Fetch Activity Logs
  const fetchActivityData = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (restaurantId) params.restaurant_id = restaurantId;
      if (staffId) params.staff_id = staffId;
      if (actionType) params.action_type = actionType;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await getStaffActivity(params, token);
      setActivities(response?.results || []);
      setActivityTotalCount(response?.count || 0);
    } catch (err: any) {
      console.error("Failed to fetch staff activity logs:", err);
      throw err;
    }
  }, [restaurantId, staffId, actionType, startDate, endDate, token]);

  // Fetch Shift Logs
  const fetchShiftsData = useCallback(async () => {
    try {
      const response = await getShiftLogs(token);
      setShiftLogs(response || []);
    } catch (err: any) {
      console.error("Failed to fetch shift logs:", err);
      throw err;
    }
  }, [token]);

  // Main aggregator function to reload dataset
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchSummaryData(),
        fetchReportsData(),
        fetchActivityData(),
        fetchShiftsData(),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "An error occurred while retrieving staff intelligence data."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchSummaryData, fetchReportsData, fetchActivityData, fetchShiftsData]);

  const dispatch = useDispatch();
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // Re-fetch data on initial render and filter adjustments
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const dataStore = useSelector((state: RootState) => state.staff);
  const allData = dataStore.data;

  // ---------------- Derived Data ----------------
  const toShow = allData;

  // ---------------- API Call ----------------
  const fetchAllStaffs = async () => {
    try {
      setFetchLoading(true);
      setFetchError("");

      // ✅ Fetch from API
      const res = await getAllStaff(token);

      // ✅ Flatten staff_by_role into one array
      const allStaff = flattenStaffByRole(res.staff_by_role);

      // ✅ Update Redux store
      dispatch(updateStaffData(allStaff));
    } catch (error) {
      console.error(error);
      setFetchError(parseError(error) || "Failed to fetch Staffs.");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (!allData) fetchAllStaffs();
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans text-ink">
      <div className="mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[32px] md:text-[48px] font-semibold tracking-[-1.5px] leading-[1.04] text-ink">
              Staff Intelligence & Analytics
            </h1>
            <p className="mt-2 text-[14px] leading-[21px] text-ink-muted">
              Monitor staff performance reports, audit logs, and shift management in real-time.
            </p>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="bg-surface border border-line rounded-[20px] p-5 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            
            {/* Staff Dropdown */}
            <div>
              <label className="block text-[11px] font-medium leading-[15px] text-ink-secondary mb-1.5 uppercase tracking-wider">
                Staff
              </label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                disabled={fetchLoading}
                className="w-full h-[40px] px-3 bg-surface border border-line rounded-2xl text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-[#146BE8]/24 focus:border-brand transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">All Staff</option>
                {toShow?.map((staff: StaffMember) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-[11px] font-medium leading-[15px] text-ink-secondary mb-1.5 uppercase tracking-wider">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-[40px] px-3 bg-surface border border-line rounded-2xl text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-[#146BE8]/24 focus:border-brand transition-all cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="waiter">Waiter</option>
                <option value="owner">Owner</option>
                <option value="kitchen">Kitchen</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Action Type */}
            <div>
              <label className="block text-[11px] font-medium leading-[15px] text-ink-secondary mb-1.5 uppercase tracking-wider">
                Action Type
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as ActionType)}
                className="w-full h-[40px] px-3 bg-surface border border-line rounded-2xl text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-[#146BE8]/24 focus:border-brand transition-all cursor-pointer"
              >
                <option value="">All Actions</option>
                <option value="order_status_updated">Order Status Updated</option>
                <option value="order_served">Order Served</option>
                <option value="order_voided">Order Voided</option>
                <option value="staff_clocked_in">Staff Clocked In</option>
                <option value="staff_clocked_out">Staff Clocked Out</option>
                <option value="staff_role_changed">Staff Role Changed</option>
                <option value="refund_processed">Refund Processed</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-medium leading-[15px] text-ink-secondary mb-1.5 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-[40px] px-3 bg-surface border border-line rounded-2xl text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-[#146BE8]/24 focus:border-brand transition-all"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-medium leading-[15px] text-ink-secondary mb-1.5 uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-[40px] px-3 bg-surface border border-line rounded-2xl text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-[#146BE8]/24 focus:border-brand transition-all"
              />
            </div>

          </div>
        </div>

        {/* Audit Summary Section */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <div className="bg-surface border border-line rounded-[20px] p-5 shadow-sm">
              <span className="text-[12px] font-medium leading-[17px] text-ink-muted">Total Sales</span>
              <div className="text-[24px] font-semibold tracking-[-0.4px] text-ink mt-1">
                {summary.total_sales}
              </div>
            </div>

            <div className="bg-surface border border-line rounded-[20px] p-5 shadow-sm">
              <span className="text-[12px] font-medium leading-[17px] text-ink-muted">Total Orders</span>
              <div className="text-[24px] font-semibold tracking-[-0.4px] text-ink mt-1">
                {summary.total_orders}
              </div>
            </div>

            <div className="bg-surface border border-line rounded-[20px] p-5 shadow-sm">
              <span className="text-[12px] font-medium leading-[17px] text-ink-muted">Avg Order Value</span>
              <div className="text-[24px] font-semibold tracking-[-0.4px] text-ink mt-1">
                {summary.avg_order_value}
              </div>
            </div>

            <div className="bg-surface border border-line rounded-[20px] p-5 shadow-sm">
              <span className="text-[12px] font-medium leading-[17px] text-ink-muted">Voided Orders</span>
              <div className="text-[24px] font-semibold tracking-[-0.4px] text-destructive mt-1">
                {summary.voided_orders}
              </div>
            </div>

            <div className="bg-surface border border-line rounded-[20px] p-5 shadow-sm col-span-2 lg:col-span-1">
              <span className="text-[12px] font-medium leading-[17px] text-ink-muted">Avg Service Time</span>
              <div className="text-[24px] font-semibold tracking-[-0.4px] text-ink mt-1">
                {summary.avg_service_minutes} <span className="text-[14px] font-normal text-ink-muted">mins</span>
              </div>
            </div>

          </div>
        )}

        {/* Content Area */}
        <div className="bg-surface border border-line rounded-[20px] p-6 shadow-md space-y-6">
          
          {/* Tabs Control */}
          <div className="flex border-b border-line-subtle gap-6">
            
            <button
              onClick={() => setActiveTab("performance")}
              className={`pb-3 text-[14px] font-medium transition-all relative ${
                activeTab === "performance"
                  ? "text-brand"
                  : "text-ink-muted hover:text-ink-secondary"
              }`}
            >
              <span>Staff Performance Reports</span>
              <span className="ml-2 px-2 py-0.5 text-[12px] rounded-full bg-inset text-ink-secondary">
                {reports.length}
              </span>
              {activeTab === "performance" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`pb-3 text-[14px] font-medium transition-all relative ${
                activeTab === "audit"
                  ? "text-brand"
                  : "text-ink-muted hover:text-ink-secondary"
              }`}
            >
              <span>Audit Activities</span>
              <span className="ml-2 px-2 py-0.5 text-[12px] rounded-full bg-inset text-ink-secondary">
                {activityTotalCount}
              </span>
              {activeTab === "audit" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("shifts")}
              className={`pb-3 text-[14px] font-medium transition-all relative ${
                activeTab === "shifts"
                  ? "text-brand"
                  : "text-ink-muted hover:text-ink-secondary"
              }`}
            >
              <span>Shift Logs</span>
              <span className="ml-2 px-2 py-0.5 text-[12px] rounded-full bg-inset text-ink-secondary">
                {shiftLogs.length}
              </span>
              {activeTab === "shifts" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
              )}
            </button>

          </div>

          {/* Error & Loading Indicators */}
          {(error || fetchError) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-[14px] text-red-800">
              {error || fetchError}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-ink-muted text-[14px]">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand mb-3" />
              <p>Loading staff intelligence data...</p>
            </div>
          ) : (
            <div>
              {/* TAB 1: Staff Performance Reports */}
              {activeTab === "performance" && (
                <div className="overflow-x-auto rounded-2xl border border-line-subtle">
                  <table className="w-full text-left text-[14px] border-collapse">
                    <thead>
                      <tr className="bg-surface border-b border-line-subtle text-ink-muted font-medium">
                        <th className="p-3.5">Staff Name</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5">Restaurant</th>
                        <th className="p-3.5">Sales Volume</th>
                        <th className="p-3.5">Orders Handled</th>
                        <th className="p-3.5">Avg Prep Time</th>
                        <th className="p-3.5">Void Frequency</th>
                        <th className="p-3.5">Clocked Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-subtle">
                      {reports.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-ink-subtle">
                            No staff reports found.
                          </td>
                        </tr>
                      ) : (
                        reports.map((item, index) => (
                          <tr key={item.staff_id || index} className="hover:bg-surface/60 transition-colors">
                            <td className="p-3.5 font-medium text-ink">{item.staff_name}</td>
                            <td className="p-3.5 text-ink-secondary">{item.staff_role}</td>
                            <td className="p-3.5 text-ink-secondary">{item.restaurant_name}</td>
                            <td className="p-3.5 text-ink font-medium">{item.sales_volume}</td>
                            <td className="p-3.5 text-ink-secondary">{item.orders_handled}</td>
                            <td className="p-3.5 text-ink-secondary">{item.avg_prep_time_minutes} mins</td>
                            <td className="p-3.5 text-ink-secondary">{item.order_void_frequency}</td>
                            <td className="p-3.5 text-ink-secondary">{item.clocked_hours} hrs</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: Audit Activity Logs */}
              {activeTab === "audit" && (
                <div className="overflow-x-auto rounded-2xl border border-line-subtle">
                  <table className="w-full text-left text-[14px] border-collapse">
                    <thead>
                      <tr className="bg-surface border-b border-line-subtle text-ink-muted font-medium">
                        <th className="p-3.5">Date & Time</th>
                        <th className="p-3.5">Staff</th>
                        <th className="p-3.5">Action</th>
                        <th className="p-3.5">Order</th>
                        <th className="p-3.5">Table</th>
                        <th className="p-3.5">Target Staff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-subtle">
                      {activities.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-ink-subtle">
                            No audit activities recorded.
                          </td>
                        </tr>
                      ) : (
                        activities.map((act) => (
                          <tr key={act.id} className="hover:bg-surface/60 transition-colors">
                            <td className="p-3.5 text-ink-muted">
                              {new Date(act.created_at).toLocaleString()}
                            </td>
                            <td className="p-3.5 font-medium text-ink">{act.staff_name || act.staff}</td>
                            <td className="p-3.5">
                              <span className="inline-block px-2.5 py-1 text-[12px] font-medium rounded-full bg-sky-100 text-sky-700">
                                {act.action_type}
                              </span>
                            </td>
                            <td className="p-3.5 text-ink-secondary">{act.related_order || "-"}</td>
                            <td className="p-3.5 text-ink-secondary">{act.related_table || "-"}</td>
                            <td className="p-3.5 text-ink-secondary">{act.related_staff_name || act.related_staff || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: Shift Logs */}
              {activeTab === "shifts" && (
                <div className="overflow-x-auto rounded-2xl border border-line-subtle">
                  <table className="w-full text-left text-[14px] border-collapse">
                    <thead>
                      <tr className="bg-surface border-b border-line-subtle text-ink-muted font-medium">
                        <th className="p-3.5">Shift ID</th>
                        <th className="p-3.5">User</th>
                        <th className="p-3.5">Restaurant</th>
                        <th className="p-3.5">Clock In</th>
                        <th className="p-3.5">Clock Out</th>
                        <th className="p-3.5">Total Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-subtle">
                      {shiftLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-ink-subtle">
                            No shift logs available.
                          </td>
                        </tr>
                      ) : (
                        shiftLogs.map((shift) => (
                          <tr key={shift.id} className="hover:bg-surface/60 transition-colors">
                            <td className="p-3.5 text-ink-muted">#{shift.id}</td>
                            <td className="p-3.5 font-medium text-ink">{shift.user}</td>
                            <td className="p-3.5 text-ink-secondary">{shift.restaurant}</td>
                            <td className="p-3.5 text-ink-secondary">{new Date(shift.clock_in).toLocaleString()}</td>
                            <td className="p-3.5">
                              {shift.clock_out ? (
                                <span className="text-ink-secondary">
                                  {new Date(shift.clock_out).toLocaleString()}
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 text-[12px] font-medium rounded-full bg-green-100 text-green-700">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 font-medium text-ink">{shift.total_sales}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default StaffIntelligenceAnalytics;