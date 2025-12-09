// subAccountPayout.service.ts

import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";

// Base Subaccount
export interface SubAccount {
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

// Create Subaccount
export interface CreateSubAccountDTO {
  account_number: string;
  bank_code: string;
  bank_name: string;
}

export interface CreateSubAccountResponse {
  account_number: string;
  bank_code: string;
  bank_name: string;
}

// Withdraw
export interface WithdrawDTO {
  amount: string;
  bank_code: string;
  reason: string;
}

export interface WithdrawResponse {
  amount: string;
  bank_code: string;
  reason: string;
}

// Banks
export interface BankItem {
  name: string;
  code: string;
  [key: string]: any;
}

// Withdrawal record
export interface WithdrawalRecord {
  id: string;
  subaccount: string;
  restaurant_name: string;
  amount: string;
  reference: string;
  status: "pending" | "processing" | "completed" | "failed";
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
export interface TransactionHistoryResponse {
  status: boolean;
  message: string;
  data: TransactionData;
}

export interface TransactionData {
  transactions: Transaction[];
  restaurant: Restaurant;
  pagination: Pagination;
}

export interface Transaction {
  id: number;
  reference: string;
  amount: Amount;
  status: string;
  currency: string;
  transaction_date: string;
  paid_at: string;
  channel: string;
  customer: Customer;
  subaccount_share: Amount;
  fees: number;
  authorization: Authorization;
  metadata: Metadata;
}

export interface Amount {
  kobo: number;
  naira: number;
  formatted: string;
}

export interface Customer {
  email: string;
  customer_code: string;
}

export interface Authorization {
  card_type: string;
  bank: string;
  last4: string;
}

export interface Metadata {
  order_id: string;
  customer_id: string;
  restaurant_id: string;
  restaurant_name: string;
  order_type: string;
  subaccount_code: string;
  platform_charge: string;
  custom_fields: CustomField[];
  referrer: string;
}

export interface CustomField {
  display_name: string;
  variable_name: string;
  value: string;
}

export interface Restaurant {
  id: string;
  name: string;
  subaccount_code: string;
}

export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  page_count: number;
}

/**
 * =======================================
 * ============= SERVICE =================
 * =======================================
 */

const base = "/subaccount";

/** GET — Fetch subaccount details */
export const getSubAccount = async (token?: string): Promise<SubAccount> => {
  const config = getConfig(`${base}/`, "GET", token);
  return bookiesAxiosInstance(config);
};

/** GET — Fetch subaccount balance */
export const getSubAccountBalance = async (token?: string): Promise<any> => {
  const config = getConfig(`${base}/balance/`, "GET", token);
  return bookiesAxiosInstance(config);
};

/** GET — Fetch supported banks */
export const getSubAccountBanks = async (
  token?: string
): Promise<BankItem[]> => {
  const config = getConfig(`${base}/banks/`, "GET", token);
  return bookiesAxiosInstance(config);
};

/** POST — Create a subaccount */
export const createSubAccount = async (
  payload: CreateSubAccountDTO,
  token?: string
): Promise<CreateSubAccountResponse> => {
  const config = getConfig(`${base}/create/`, "POST", token, payload);
  return bookiesAxiosInstance(config);
};

/** POST — Create a subaccount */
export const updateSubAccount = async (
  payload: CreateSubAccountDTO,
  token?: string
): Promise<CreateSubAccountResponse> => {
  const config = getConfig(
    `/subaccount/subaccount/update/`,
    "PUT",
    token,
    payload
  );
  return bookiesAxiosInstance(config);
};

/** POST — Create a subaccount */
export const getTransactionHistory = async (
  token?: string,
  params?: any
): Promise<TransactionHistoryResponse> => {
  const config = getConfig(
    `/subaccount/transaction/histories/`,
    "GET",
    token,
    undefined,
    params
  );
  return bookiesAxiosInstance(config);
};

/** POST — Withdraw from subaccount */
export const withdrawFromSubAccount = async (
  payload: WithdrawDTO,
  token?: string
): Promise<WithdrawResponse> => {
  const config = getConfig(`${base}/withdraw/`, "POST", token, payload);
  return bookiesAxiosInstance(config);
};

/** GET — Fetch withdrawal history */
export const getSubAccountWithdrawals = async (
  token?: string
): Promise<WithdrawalRecord[]> => {
  const config = getConfig(`${base}/withdrawals/`, "GET", token);
  return bookiesAxiosInstance(config);
};
