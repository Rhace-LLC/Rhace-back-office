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
