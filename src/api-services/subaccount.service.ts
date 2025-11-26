import { bookiesAxiosInstance } from "./utils/baseUrl";
import { getConfig } from "./utils/reqConfig";

/* ============================================================
   TYPES
============================================================ */

// 🔹 GET /subaccount/
export interface SubaccountResponse {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  subaccount_code: string;
  account_name: string;
  settlement_bank: string;
  account_number: string;
  percentage_charge: string;
  is_active: boolean;
  is_verified: boolean;
  available_balance: string;
  created_at: string;
  updated_at: string;
}

// 🔹 POST /subaccount/create/
export interface CreateSubaccountRequest {
  account_number: string;
  bank_code: string;
  bank_name: string;
}

export interface CreateSubaccountResponse {
  account_number: string;
  bank_code: string;
  bank_name: string;
}

// 🔹 POST /subaccount/withdraw/
export interface WithdrawRequest {
  amount: string; // API returns string, keeping consistent
  bank_code: string;
  reason: string;
}

export interface WithdrawResponse {
  amount: string;
  bank_code: string;
  reason: string;
}

// 🔹 GET /subaccount/withdrawals/
export interface WithdrawalItem {
  id: string;
  subaccount: string;
  restaurant_name: string;
  amount: string;
  reference: string;
  status: string;
  transfer_code: string;
  transfer_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  initiated_at: string;
  processed_at: string;
  completed_at: string;
  failure_reason: string;
  notes: string;
}
export interface BankItem {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  available_for_direct_debit: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetBanksResponse {
  status: boolean;
  message: string;
  data: BankItem[];
}
export interface GetSubaccountResponse {
  status: boolean;
  message: string;
  data: SubaccountDetails;
}

export interface SubaccountDetails {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  subaccount_code: string;
  account_name: string;
  settlement_bank: string;
  account_number: string;
  percentage_charge: string; // still string from API
  is_active: boolean;
  is_verified: boolean;
  available_balance: string; // numeric string
  created_at: string;
  updated_at: string;
}

/* ============================================================
   SERVICE FUNCTIONS
============================================================ */

// 🔸 Fetch Subaccount Details
export const getSubaccount = async (
  token: string
): Promise<GetSubaccountResponse> => {
  const config = getConfig(`/subaccount/`, "GET", token);
  return bookiesAxiosInstance(config);
};

// 🔸 Get Subaccount Balance
export const getSubaccountBalance = async (token: string): Promise<any> => {
  const config = getConfig(`/subaccount/balance/`, "GET", token);
  return bookiesAxiosInstance(config);
};

// 🔸 Get Banks List
export const getSubaccountBanks = async (
  token: string
): Promise<GetBanksResponse> => {
  const config = getConfig(`/subaccount/banks/`, "GET", token);
  return bookiesAxiosInstance(config);
};

// 🔸 Create Subaccount
export const createSubaccount = async (
  token: string,
  data: CreateSubaccountRequest
): Promise<CreateSubaccountResponse> => {
  const config = getConfig(`/subaccount/create/`, "POST", token, data);
  return bookiesAxiosInstance(config);
};

// 🔸 Withdraw From Subaccount
export const withdrawFromSubaccount = async (
  token: string,
  data: WithdrawRequest
): Promise<WithdrawResponse> => {
  const config = getConfig(`/subaccount/withdraw/`, "POST", token, data);
  return bookiesAxiosInstance(config);
};

// 🔸 Get Withdrawal History
export const getSubaccountWithdrawals = async (
  token: string
): Promise<WithdrawalItem[]> => {
  const config = getConfig(`/subaccount/withdrawals/`, "GET", token);
  return bookiesAxiosInstance(config);
};
