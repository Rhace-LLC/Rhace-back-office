// api-services/staffService.ts
import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";

export interface Staff {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  phone: string;
  is_active: boolean;
}

// api-services/staffService.ts
export const getAllStaff = async (token: string): Promise<Staff[]> => {
  const config = getConfig("/auth/all-staff", "GET", token);
  const response = await bookiesAxiosInstance(config);

  let staffData = response.data;

  // If response.data is undefined but response has data, use response
  if (!staffData && response) {
    staffData = response;
  }

  // Handle the nested staff structure from your API response
  if (staffData && staffData.staff_by_role) {
    // Extract all staff from all roles and flatten into one array
    const allStaff: Staff[] = [];

    Object.values(staffData.staff_by_role).forEach((roleGroup: any) => {
      if (roleGroup.staff && Array.isArray(roleGroup.staff)) {
        allStaff.push(...roleGroup.staff);
      }
    });

    return allStaff;
  }

  // If it's already an array, return it
  if (Array.isArray(staffData)) {
    return staffData;
  }

  console.warn("⚠️ No staff array found, returning empty array");
  return [];
};

// Get only active waiters
export const getActiveWaiters = async (token: string): Promise<Staff[]> => {
  const allStaff = await getAllStaff(token);

  const activeWaiters = allStaff.filter(
    (staff) => staff.role === "waiter" && staff.is_active
  );

  return activeWaiters;
};

// Get staff by role
export const getStaffByRole = async (
  token: string,
  role: string
): Promise<Staff[]> => {
  const allStaff = await getAllStaff(token);
  return allStaff.filter((staff) => staff.role === role && staff.is_active);
};

// --- AUDIT & STAFF REPORT TYPES ---

export interface StaffReportItem {
  staff_id: string;
  staff_name: string;
  staff_role: string;
  restaurant_id: string;
  restaurant_name: string;
  sales_volume: string;
  orders_handled: number;
  table_turnover_rate: string;
  avg_prep_time_minutes: string;
  avg_ready_wait_minutes: string;
  order_void_frequency: string;
  avg_service_time_minutes: string;
  clocked_hours: number;
  attendance_days: number;
}

export interface StaffReportParams {
  restaurant_id?: string;
  staff_id?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  [key: string]: string | undefined;
}

export type ActionType =
  | "order_status_updated"
  | "order_served"
  | "order_voided"
  | "staff_clocked_in"
  | "staff_clocked_out"
  | "staff_role_changed"
  | "refund_processed"
  | string;

export interface StaffActivityItem {
  id: number;
  restaurant: string;
  staff: string;
  staff_name: string;
  action_type: ActionType;
  related_order: string | null;
  related_table: string | null;
  related_staff: string | null;
  related_staff_name: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface StaffActivityResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StaffActivityItem[];
}

export interface StaffActivityParams {
  restaurant_id?: string;
  staff_id?: string;
  action_type?: ActionType;
  start_date?: string;
  end_date?: string;
  [key: string]: string | undefined;
}

export interface AuditSummary {
  total_sales: string;
  total_orders: number;
  avg_order_value: string;
  voided_orders: number;
  avg_service_minutes: string;
}

export interface AuditSummaryParams {
  restaurant_id: string;
  [key: string]: string | undefined;
}

// --- AUDIT & STAFF REPORT REQUESTS ---

/**
 * GET /audit/reports/
 * Retrieves staff performance report summaries filtered by restaurant, staff, role, and date range.
 */
const getStaffReports = async (
  params?: StaffReportParams,
  token?: string
): Promise<StaffReportItem[]> => {
  const config = getConfig("/audit/reports/", "GET", token, undefined, params);
  return bookiesAxiosInstance.request(config);
};

/**
 * GET /audit/activity/
 * Retrieves paginated audit logs of staff activities filtered by restaurant, staff, action type, and date range.
 */
const getStaffActivity = async (
  params?: StaffActivityParams,
  token?: string
): Promise<StaffActivityResponse> => {
  const config = getConfig("/audit/activity/", "GET", token, undefined, params);
  return bookiesAxiosInstance.request(config);
};

/**
 * GET /audit/summary/
 * Retrieves overall sales, order, void, and service metrics summary for a specific restaurant.
 */
const getAuditSummary = async (
  params: AuditSummaryParams,
  token?: string
): Promise<AuditSummary> => {
  const config = getConfig("/audit/summary/", "GET", token, undefined, params);
  return bookiesAxiosInstance.request(config);
};

export {
  getStaffReports,
  getStaffActivity,
  getAuditSummary,
};