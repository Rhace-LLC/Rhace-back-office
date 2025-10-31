// src/services/auth.service.ts

import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";
import { RegisterRestaurantResponse } from "./utils/types.service";

// ---------------------------
// 📘 Interfaces
// ---------------------------
export interface LoginResponse {
  tokens: {
    refresh: string;
    access: string;
  };
  role:
    | "admin"
    | "waiter"
    | "kitchen"
    | "inventory_mgr"
    | "driver"
    | "customer";
}

// Login request
export interface LoginRequestBody {
  email: string;
  password: string;
}

// Logout request
export interface LogoutRequestBody {
  refresh: string;
}

// ---------------------------
// 📘 Auth Service Functions
// ---------------------------

// Login
const login = async (data: LoginRequestBody): Promise<LoginResponse> => {
  const config = getConfig(`/auth/login/`, "POST", undefined, data);
  return bookiesAxiosInstance(config);
};

// Logout
const logout = async (data: LogoutRequestBody): Promise<any> => {
  const config = getConfig(`/auth/logout/`, "POST", undefined, data);
  return bookiesAxiosInstance(config);
};

// Get current authenticated user
const getMe = async (token: string): Promise<any> => {
  const config = getConfig(`/auth/me/`, "GET", token);
  return bookiesAxiosInstance(config);
};

// Request password reset
const requestPasswordReset = async (email: string): Promise<any> => {
  const config = getConfig(`/auth/password-reset/request/`, "POST", undefined, {
    email,
  });
  return bookiesAxiosInstance(config);
};
// Request password reset
const resendOtp = async (email: string): Promise<any> => {
  const config = getConfig(`/auth/resend/verify-email/otp/`, "POST", undefined, {
    email,
  });
  return bookiesAxiosInstance(config);
};
// Request password reset
const verifyOtp = async (data:any): Promise<any> => {
  const config = getConfig(`/auth/verify/email/`, "POST", undefined, data);
  return bookiesAxiosInstance(config);
};

// Verify password reset token
const verifyPasswordReset = async (data: Record<string, any>): Promise<any> => {
  const config = getConfig(
    `/auth/password-reset/verify/`,
    "POST",
    undefined,
    data
  );
  return bookiesAxiosInstance(config);
};

// Reset password
const resetPassword = async (data: Record<string, any>): Promise<any> => {
  const config = getConfig(
    `/auth/password-reset/reset/`,
    "POST",
    undefined,
    data
  );
  return bookiesAxiosInstance(config);
};

// Register
const registerEmployee = async (data: any): Promise<any> => {
  const config = getConfig(`/auth/register/`, "POST", undefined, data);
  return bookiesAxiosInstance(config);
};

// Register
const registerRestaurant = async (data: any): Promise<RegisterRestaurantResponse> => {
  const config = getConfig(
    `/auth/register-restaurant/`,
    "POST",
    undefined,
    data
  );
  return bookiesAxiosInstance(config);
};

// ---------------------------
// 📘 Export All
// ---------------------------
export {
  login,
  logout,
  getMe,
  requestPasswordReset,
  verifyPasswordReset,
  resetPassword,
  registerRestaurant,
  registerEmployee,
  verifyOtp,
  resendOtp
};
