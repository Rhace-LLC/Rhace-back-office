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
    <div className="min-h-screen p-6 md:p-12 font-sans text-[#0B0D10]">
      <div className="mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[32px] md:text-[48px] font-semibold tracking-[-1.5px] leading-[1.04] text-[#0B0D10]">
              Staff Intelligence & Analytics
            </h1>
            <p className="mt-2 text-[14px] leading-[21px] text-[#6B7280]">
              Monitor staff performance reports, audit logs, and shift management in real-time.
            </p>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="bg-[#FFFFFF] border border-[#D9E0EA] rounded-[16px] p-5 shadow-[0_6px_18px_0_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            
            {/* Staff Dropdown */}
            <div>
              <label className="block text-[11px] font-medium leading-[15px] text-[#30343B] mb-1.5 uppercase tracking-wider">
                Staff
              </label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                disabled={fetchLoading}
                className="w-full h-[40px] px-3 bg-[#F8FAFD] border border-[#D9E0EA] rounded-[8px] text-[14px] text-[#0B0D10] focus:outline-none focus:ring-2 focus:ring-[#146BE8]/24 focus:border-[#146BE8] transition-all cursor-pointer disabled:opacity-50"
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
              <label className="block text-[11px] font-medium leading-[15px] text-[#30343B] mb-1.5 uppercase tracking-wider">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-[40px] px-3 bg-[#F8FAFD] border border-[#D9E0EA] rounded-[8px] text-[14px] text-[#0B0D10] focus:outline-none focus:ring-2 focus:ring-[#146BE8]/24 focus:border-[#146BE8] transition-all cursor-pointer"
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
              <label className="block text-[11px] font-medium leading-[15px] text-[#30343B] mb-1.5 uppercase tracking-wider">
                Action Type
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as ActionType)}
                className="w-full h-[40px] px-3 bg-[#F8FAFD] border border-[#D9E0EA] rounded-[8px] text-[14px] text-[#0B0D10] focus:outline-none focus:ring-2 focus:ring-[#146BE8]/24 focus:border-[#146BE8] transition-all cursor-pointer"
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
              <label className="block text-[11px] font-medium leading-[15px] text-[#30343B] mb-1.5 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-[40px] px-3 bg-[#F8FAFD] border border-[#D9E0EA] rounded-[8px] text-[14px] text-[#0B0D10] focus:outline-none focus:ring-2 focus:ring-[#146BE8]/24 focus:border-[#146BE8] transition-all"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-medium leading-[15px] text-[#30343B] mb-1.5 uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-[40px] px-3 bg-[#F8FAFD] border border-[#D9E0EA] rounded-[8px] text-[14px] text-[#0B0D10] focus:outline-none focus:ring-2 focus:ring-[#146BE8]/24 focus:border-[#146BE8] transition-all"
              />
            </div>

          </div>
        </div>

        {/* Audit Summary Section */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <div className="bg-[#F8FAFD] border border-[#D9E0EA] rounded-[16px] p-5 shadow-[0_2px_8px_0_rgba(15,23,42,0.06)]">
              <span className="text-[12px] font-medium leading-[17px] text-[#6B7280]">Total Sales</span>
              <div className="text-[24px] font-semibold tracking-[-0.4px] text-[#0B0D10] mt-1">
                {summary.total_sales}
              </div>
            </div>

            <div className="bg-[#F8FAFD] border border-[#D9E0EA] rounded-[16px] p-5 shadow-[0_2px_8px_0_rgba(15,23,42,0.06)]">
              <span className="text-[12px] font-medium leading-[17px] text-[#6B7280]">Total Orders</span>
              <div className="text-[24px] font-semibold tracking-[-0.4px] text-[#0B0D10] mt-1">
                {summary.total_orders}
              </div>
            </div>

            <div className="bg-[#F8FAFD] border border-[#D9E0EA] rounded-[16px] p-5 shadow-[0_2px_8px_0_rgba(15,23,42,0.06)]">
              <span className="text-[12px] font-medium leading-[17px] text-[#6B7280]">Avg Order Value</span>
              <div className="text-[24px] font-semibold tracking-[-0.4px] text-[#0B0D10] mt-1">
                {summary.avg_order_value}
              </div>
            </div>

            <div className="bg-[#F8FAFD] border border-[#D9E0EA] rounded-[16px] p-5 shadow-[0_2px_8px_0_rgba(15,23,42,0.06)]">
              <span className="text-[12px] font-medium leading-[17px] text-[#6B7280]">Voided Orders</span>
              <div className="text-[24px] font-semibold tracking-[-0.4px] text-[#DC2626] mt-1">
                {summary.voided_orders}
              </div>
            </div>

            <div className="bg-[#F8FAFD] border border-[#D9E0EA] rounded-[16px] p-5 shadow-[0_2px_8px_0_rgba(15,23,42,0.06)] col-span-2 lg:col-span-1">
              <span className="text-[12px] font-medium leading-[17px] text-[#6B7280]">Avg Service Time</span>
              <div className="text-[24px] font-semibold tracking-[-0.4px] text-[#0B0D10] mt-1">
                {summary.avg_service_minutes} <span className="text-[14px] font-normal text-[#6B7280]">mins</span>
              </div>
            </div>

          </div>
        )}

        {/* Content Area */}
        <div className="bg-[#FFFFFF] border border-[#D9E0EA] rounded-[16px] p-6 shadow-[0_6px_18px_0_rgba(15,23,42,0.08)] space-y-6">
          
          {/* Tabs Control */}
          <div className="flex border-b border-[#E8EDF3] gap-6">
            
            <button
              onClick={() => setActiveTab("performance")}
              className={`pb-3 text-[14px] font-medium transition-all relative ${
                activeTab === "performance"
                  ? "text-[#146BE8]"
                  : "text-[#6B7280] hover:text-[#30343B]"
              }`}
            >
              <span>Staff Performance Reports</span>
              <span className="ml-2 px-2 py-0.5 text-[12px] rounded-full bg-[#E7ECF2] text-[#30343B]">
                {reports.length}
              </span>
              {activeTab === "performance" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#146BE8] rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`pb-3 text-[14px] font-medium transition-all relative ${
                activeTab === "audit"
                  ? "text-[#146BE8]"
                  : "text-[#6B7280] hover:text-[#30343B]"
              }`}
            >
              <span>Audit Activities</span>
              <span className="ml-2 px-2 py-0.5 text-[12px] rounded-full bg-[#E7ECF2] text-[#30343B]">
                {activityTotalCount}
              </span>
              {activeTab === "audit" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#146BE8] rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("shifts")}
              className={`pb-3 text-[14px] font-medium transition-all relative ${
                activeTab === "shifts"
                  ? "text-[#146BE8]"
                  : "text-[#6B7280] hover:text-[#30343B]"
              }`}
            >
              <span>Shift Logs</span>
              <span className="ml-2 px-2 py-0.5 text-[12px] rounded-full bg-[#E7ECF2] text-[#30343B]">
                {shiftLogs.length}
              </span>
              {activeTab === "shifts" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#146BE8] rounded-t-full" />
              )}
            </button>

          </div>

          {/* Error & Loading Indicators */}
          {(error || fetchError) && (
            <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] text-[14px] text-[#991B1B]">
              {error || fetchError}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-[#6B7280] text-[14px]">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#146BE8] mb-3" />
              <p>Loading staff intelligence data...</p>
            </div>
          ) : (
            <div>
              {/* TAB 1: Staff Performance Reports */}
              {activeTab === "performance" && (
                <div className="overflow-x-auto rounded-[10px] border border-[#E8EDF3]">
                  <table className="w-full text-left text-[14px] border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFD] border-b border-[#E8EDF3] text-[#6B7280] font-medium">
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
                    <tbody className="divide-y divide-[#E8EDF3]">
                      {reports.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-[#9CA3AF]">
                            No staff reports found.
                          </td>
                        </tr>
                      ) : (
                        reports.map((item, index) => (
                          <tr key={item.staff_id || index} className="hover:bg-[#F8FAFD]/60 transition-colors">
                            <td className="p-3.5 font-medium text-[#0B0D10]">{item.staff_name}</td>
                            <td className="p-3.5 text-[#30343B]">{item.staff_role}</td>
                            <td className="p-3.5 text-[#30343B]">{item.restaurant_name}</td>
                            <td className="p-3.5 text-[#0B0D10] font-medium">{item.sales_volume}</td>
                            <td className="p-3.5 text-[#30343B]">{item.orders_handled}</td>
                            <td className="p-3.5 text-[#30343B]">{item.avg_prep_time_minutes} mins</td>
                            <td className="p-3.5 text-[#30343B]">{item.order_void_frequency}</td>
                            <td className="p-3.5 text-[#30343B]">{item.clocked_hours} hrs</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: Audit Activity Logs */}
              {activeTab === "audit" && (
                <div className="overflow-x-auto rounded-[10px] border border-[#E8EDF3]">
                  <table className="w-full text-left text-[14px] border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFD] border-b border-[#E8EDF3] text-[#6B7280] font-medium">
                        <th className="p-3.5">Date & Time</th>
                        <th className="p-3.5">Staff</th>
                        <th className="p-3.5">Action</th>
                        <th className="p-3.5">Order</th>
                        <th className="p-3.5">Table</th>
                        <th className="p-3.5">Target Staff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EDF3]">
                      {activities.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#9CA3AF]">
                            No audit activities recorded.
                          </td>
                        </tr>
                      ) : (
                        activities.map((act) => (
                          <tr key={act.id} className="hover:bg-[#F8FAFD]/60 transition-colors">
                            <td className="p-3.5 text-[#6B7280]">
                              {new Date(act.created_at).toLocaleString()}
                            </td>
                            <td className="p-3.5 font-medium text-[#0B0D10]">{act.staff_name || act.staff}</td>
                            <td className="p-3.5">
                              <span className="inline-block px-2.5 py-1 text-[12px] font-medium rounded-[6px] bg-[#E0F2FE] text-[#0369A1]">
                                {act.action_type}
                              </span>
                            </td>
                            <td className="p-3.5 text-[#30343B]">{act.related_order || "-"}</td>
                            <td className="p-3.5 text-[#30343B]">{act.related_table || "-"}</td>
                            <td className="p-3.5 text-[#30343B]">{act.related_staff_name || act.related_staff || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: Shift Logs */}
              {activeTab === "shifts" && (
                <div className="overflow-x-auto rounded-[10px] border border-[#E8EDF3]">
                  <table className="w-full text-left text-[14px] border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFD] border-b border-[#E8EDF3] text-[#6B7280] font-medium">
                        <th className="p-3.5">Shift ID</th>
                        <th className="p-3.5">User</th>
                        <th className="p-3.5">Restaurant</th>
                        <th className="p-3.5">Clock In</th>
                        <th className="p-3.5">Clock Out</th>
                        <th className="p-3.5">Total Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EDF3]">
                      {shiftLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#9CA3AF]">
                            No shift logs available.
                          </td>
                        </tr>
                      ) : (
                        shiftLogs.map((shift) => (
                          <tr key={shift.id} className="hover:bg-[#F8FAFD]/60 transition-colors">
                            <td className="p-3.5 text-[#6B7280]">#{shift.id}</td>
                            <td className="p-3.5 font-medium text-[#0B0D10]">{shift.user}</td>
                            <td className="p-3.5 text-[#30343B]">{shift.restaurant}</td>
                            <td className="p-3.5 text-[#30343B]">{new Date(shift.clock_in).toLocaleString()}</td>
                            <td className="p-3.5">
                              {shift.clock_out ? (
                                <span className="text-[#30343B]">
                                  {new Date(shift.clock_out).toLocaleString()}
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 text-[12px] font-medium rounded-full bg-[#DCFCE7] text-[#15803D]">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 font-medium text-[#0B0D10]">{shift.total_sales}</td>
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