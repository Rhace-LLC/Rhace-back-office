// src/services/auth.service.ts

import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";
import { RegisterRestaurantResponse } from "./utils/types.service";
import { UserRole } from "@/contexts/AuthContext";

// ---------------------------
// 📘 Interfaces
// ---------------------------

// 🔹 Login
export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokens: {
    refresh: string;
    access: string;
  };
  role: UserRole;
  user: UserDataLogin;
  restaurants?: RestaurantDataLogin[];
  restaurant?: RestaurantDataLogin
}

export interface UserDataLogin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface RestaurantDataLogin {
  id: string;
  name: string;
  slug: string;
  access_url: string;
  is_active: boolean;
  has_subaccount: boolean;
  subaccount_verified: boolean;
  is_subscribed: boolean;
  subscription_status: string | null;
  subscription_plan: string | null;
  next_billing_date: string | null; // ISO date string from your backend
}

// 🔹 Logout
export interface LogoutRequestBody {
  refresh: string;
}

// 🔹 Request Password Reset
export interface RequestPasswordResetBody {
  email: string;
}

// 🔹 Verify Password Reset
export interface VerifyPasswordResetBody {
  email: string;
  otp: string;
}

// 🔹 Reset Password
export interface ResetPasswordBody {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

// 🔹 Register Employee
export interface RegisterEmployeeBody {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  confirm_password: string;
  role: UserRole;
  is_verified?: boolean;
  invitation_token?: string;
}

// 🔹 Register Restaurant
export interface RegisterRestaurantBody {
  restaurant_name: string;
  restaurant_email: string;
  restaurant_phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  description: string;
  cuisine_type: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_phone: string;
  password: string;
  confirm_password: string;
}

// 🔹 Verify Email OTP
export interface VerifyOtpBody {
  email: string;
  otp: string;
}

// 🔹 Resend Email OTP
export interface ResendOtpBody {
  email: string;
}

// 🔹 Invite Staff
export interface InviteStaffBody {
  email: string;
  role: string;
}

export interface GetAllStaffResponse {
  total_count: number;
  staff_by_role: {
    waiter: StaffRoleGroup;
    driver: StaffRoleGroup;
    kitchen: StaffRoleGroup;
    inventory_mgr: StaffRoleGroup;
    [key: string]: StaffRoleGroup; // allows flexibility for other future roles
  };
  restaurant: {
    id: string;
    name: string;
  };
}

export interface StaffRoleGroup {
  role_name: string;
  count: number;
  staff: StaffMember[];
}

export interface StaffMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  phone: string;
  is_active: boolean;
}

// ---------------------------
// 📘 Auth Service Functions
// ---------------------------

// 🔸 Login
const login = async (data: LoginRequestBody): Promise<LoginResponse> => {
  const config = getConfig(`/auth/login/`, "POST", undefined, data);
  return bookiesAxiosInstance(config);
};

// 🔸 Logout
const logout = async (data: LogoutRequestBody): Promise<any> => {
  const config = getConfig(`/auth/logout/`, "POST", undefined, data);
  return bookiesAxiosInstance(config);
};

// 🔸 Accept Invitation
const acceptInvite = async (invitationToken: string): Promise<any> => {
  const config = getConfig(
    `/auth/accept-invitation/${invitationToken}/`,
    "POST"
  );
  return bookiesAxiosInstance(config);
};

// 🔸 Get current authenticated user
const getMe = async (token: string): Promise<any> => {
  const config = getConfig(`/auth/me/`, "GET", token);
  return bookiesAxiosInstance(config);
};

// 🔸 Get all staff
const getAllStaff = async (token: string): Promise<any> => {
  const config = getConfig(`/auth/all-staff`, "GET", token);
  return bookiesAxiosInstance(config);
};

const toggleStaffAccountStatus = async (
  user_id: string | number,
  token: string
): Promise<StaffMember> => {
  const config = getConfig(
    `/auth/toggle-staff/${user_id}/`,
    "POST",
    token,
    undefined,
    undefined
  );
  return bookiesAxiosInstance(config);
};

// 🔸 Get restaurant by identifier
const getRestaurantByIdentifier = async (
  identifier: string,
  token?: string
): Promise<any> => {
  const config = getConfig(`/auth/restaurant/${identifier}/`, "GET", token);
  return bookiesAxiosInstance(config);
};

// 🔸 Invite staff to restaurant
const inviteStaff = async (
  restaurantId: string,
  data: InviteStaffBody,
  token?: string
): Promise<any> => {
  const config = getConfig(
    `/auth/restaurant/${restaurantId}/invite-staff/`,
    "POST",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

// 🔸 Toggle staff
const toggleStaff = async (token: string): Promise<any> => {
  const config = getConfig(`/auth/toggle-staff`, "POST", token);
  return bookiesAxiosInstance(config);
};

// 🔸 Request password reset
const requestPasswordReset = async (email: string): Promise<any> => {
  const config = getConfig(`/auth/password-reset/request/`, "POST", undefined, {
    email,
  });
  return bookiesAxiosInstance(config);
};

// 🔸 Verify password reset
const verifyPasswordReset = async (
  data: VerifyPasswordResetBody
): Promise<any> => {
  const config = getConfig(
    `/auth/password-reset/verify/`,
    "POST",
    undefined,
    data
  );
  return bookiesAxiosInstance(config);
};

// 🔸 Reset password
const resetPassword = async (data: ResetPasswordBody): Promise<any> => {
  const config = getConfig(
    `/auth/password-reset/reset/`,
    "POST",
    undefined,
    data
  );
  return bookiesAxiosInstance(config);
};

// 🔸 Register employee
const registerEmployee = async (data: RegisterEmployeeBody): Promise<any> => {
  const config = getConfig(`/auth/register/`, "POST", undefined, data);
  return bookiesAxiosInstance(config);
};

// 🔸 Register restaurant
const registerRestaurant = async (
  data: RegisterRestaurantBody
): Promise<RegisterRestaurantResponse> => {
  const config = getConfig(
    `/auth/register-restaurant/`,
    "POST",
    undefined,
    data
  );
  return bookiesAxiosInstance(config);
};

// 🔸 Resend OTP
const resendOtp = async (data: ResendOtpBody): Promise<any> => {
  const config = getConfig(
    `/auth/resend/verify-email/otp/`,
    "POST",
    undefined,
    data
  );
  return bookiesAxiosInstance(config);
};

// 🔸 Verify email OTP
const verifyOtp = async (data: VerifyOtpBody): Promise<any> => {
  const config = getConfig(`/auth/verify/email/`, "POST", undefined, data);
  return bookiesAxiosInstance(config);
};

// ---------------------------
// 📘 Export All
// ---------------------------

// ----- Profile Response -----
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  role: "admin" | "customer" | "restaurant"; // adjust if needed
  restaurant: string | null;
  restaurant_name: string | null;
  is_verified: boolean;
  is_active: boolean;
}

// ----- Update Profile Body (PUT / PATCH) -----
export interface UpdateProfileBody {
  first_name?: string;
  last_name?: string;
  phone?: string;
  restaurant?: string | null;
}

// ----- Change Password Body -----
export interface ChangePasswordBody {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * ============================
 * Service Functions
 * ============================
 */

// 🔹 GET /auth/profile/
export const getProfile = async (token: string): Promise<UserProfile> => {
  const config = getConfig(`/auth/profile/`, "GET", token);
  return bookiesAxiosInstance(config);
};

// 🔹 PUT /auth/profile/
export const updateProfile = async (
  token: string,
  data: UpdateProfileBody
): Promise<{ message: string; data: UserProfile }> => {
  const config = getConfig(`/auth/profile/`, "PUT", token, data);
  return bookiesAxiosInstance(config);
};

// 🔹 PATCH /auth/profile/
export const patchProfile = async (
  token: string,
  data: UpdateProfileBody
): Promise<UserProfile> => {
  const config = getConfig(`/auth/profile/`, "PATCH", token, data);
  return bookiesAxiosInstance(config);
};

// 🔹 PUT /auth/profile/change-password/
export const changePassword = async (
  token: string,
  data: ChangePasswordBody
): Promise<any> => {
  const config = getConfig(
    `/auth/profile/change-password/`,
    "PUT",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

// 🔹 PATCH /auth/profile/change-password/
export const patchPassword = async (
  token: string,
  data: ChangePasswordBody
): Promise<any> => {
  const config = getConfig(
    `/auth/profile/change-password/`,
    "PATCH",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

export {
  login,
  logout,
  getMe,
  getAllStaff,
  getRestaurantByIdentifier,
  inviteStaff,
  toggleStaff,
  requestPasswordReset,
  verifyPasswordReset,
  resetPassword,
  registerRestaurant,
  registerEmployee,
  verifyOtp,
  resendOtp,
  acceptInvite,
  toggleStaffAccountStatus,
};
