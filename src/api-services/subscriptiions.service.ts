// subscriptionService.ts
import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";

/**
 * ============================
 * TYPES
 * ============================
 */

export interface SubscriptionDetails {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  plan: string;
  plan_name: string;
  code: string | null;
  status: "active" | "trial" | "expired"; // adjust based on your possible statuses
  current_price: string;
  staff_count_at_billing: number;
  start_date: string;
  next_billing_date: string;
  grace_period_start: string | null;
  grace_period_end: string | null;
  suspended_at: string | null;
  last_payment_date: string;
  failed_payment_attempts: number;
  is_active: boolean;
  days_until_billing: number;
  grace_period_days_remaining: number | null;
  created_at: string;
  updated_at: string;
}

/** POST /subscriptions/create/ */
export interface SubscriptionPreview {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_email: string;
  owner_email: string;
  owner_name: string;
  plan_id: string;
  plan_name: string;
  base_price: string;
  staff_count: number;
  staff_threshold: number;
  has_surcharge: boolean;
  surcharge_percentage: string;
  surcharge_amount: string;
  total_amount: string;
  amount_in_kobo: number;
  start_date: string;
  next_billing_date: string;
  billing_cycle: string;
  grace_period_days: number;
  status: string;
  message: string;
}

/** GET /subscriptions/notifications/ */
export interface SubscriptionNotification {
  id: string;
  subscription: string;
  restaurant_name: string;
  notification_type: "payment_due" | "renewal" | string;
  message: string;
  sent_to: string;
  sent_at: string;
  is_read: boolean;
}

/** POST /subscriptions/payment/initiate/ */
export interface InitiatePaymentRequest {
  callback_url: string;
}

export interface InitiatePaymentResponse {
  id: string;
  subscription: string;
  restaurant_name: string;
  amount: string;
  status: string;
  reference: string;
  paystack_reference: string;
  payment_method: string;
  paid_at: string;
  failure_reason: string;
  metadata: string;
  created_at: string;
}

export interface InitializeSubscriptionPaymentResponse {
  id: string;
  subscription: string | null;
  amount: string;
  status: "pending" | "success" | "failed"; // adjust if other statuses exist
  reference: string;
  paystack_reference: string | null;
  payment_method: string | null;
  paid_at: string | null;
  failure_reason: string | null;
  metadata: {
    authorization_url: string;
    access_code: string;
    restaurant_id: string;
    plan_id: string;
    staff_count: number;
    is_initial_subscription: boolean;
    owner_email: string;
    paystack_full_response: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  };
  created_at: string;
  authorization_url: string;
  access_code: string;
  amount_to_pay: number;
  owner_email: string;
  message: string;
}

/** POST /subscriptions/payment/verify/ */
export interface VerifyPaymentBody {
  reference: string;
}

export interface VerifyPaymentResponse extends SubscriptionDetails {}

/** GET /subscriptions/payments/ */
export interface PaymentHistory {
  id: string;
  subscription: string;
  restaurant_name: string;
  amount: string;
  status: string;
  reference: string;
  paystack_reference: string;
  payment_method: string;
  paid_at: string;
  failure_reason: string;
  metadata: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  base_price: string;
  staff_threshold: number;
  surcharge_percentage: string;
  grace_period_days: number;
  description: string;
  is_active: boolean;
  created_at: string;
}

export type GetSubscriptionPlansResponse = SubscriptionPlan[];

/** GET /subscriptions/status/ */
export interface SubscriptionStatus {
  is_active: boolean;
  status: string;
  current_price: string;
  next_billing_date: string;
  in_grace_period: boolean;
  days_until_billing: number;
  can_access: boolean;
  grace_period_days_remaining: number;
}

/**
 * ============================
 * SERVICES
 * ============================
 */

/** GET — Get subscription details */
export const getSubscriptionDetails = async (
  token?: string
): Promise<SubscriptionDetails> => {
  const config = getConfig("/subscriptions/", "GET", token);
  return bookiesAxiosInstance(config);
};

export const previewSubscription = async (
  token?: string
): Promise<SubscriptionPreview> => {
  const config = getConfig("/subscriptions/create/", "POST", token);
  return bookiesAxiosInstance(config);
};

/** GET — Get all subscription notifications */
export const getSubscriptionNotifications = async (
  token?: string
): Promise<SubscriptionNotification[]> => {
  const config = getConfig("/subscriptions/notifications/", "GET", token);
  return bookiesAxiosInstance(config);
};

/** POST — Mark a notification as read */
export const markNotificationAsRead = async (
  notification_id: string,
  token?: string
): Promise<SubscriptionNotification> => {
  const config = getConfig(
    `/subscriptions/notifications/${notification_id}/read/`,
    "POST",
    token
  );
  return bookiesAxiosInstance(config);
};

/** POST — Initiate payment */
export const initiateSubscriptionPayment = async (
  token?: string
): Promise<InitializeSubscriptionPaymentResponse> => {
  const config = getConfig("/subscriptions/payment/initiate/", "POST", token);
  return bookiesAxiosInstance(config);
};

/** POST — Verify payment & create subscription */
export const verifySubscriptionPayment = async (
  data: VerifyPaymentBody,
  token?: string
): Promise<VerifyPaymentResponse> => {
  const config = getConfig(
    "/subscriptions/payment/verify/",
    "POST",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

/** GET — Payment history */
export const getPaymentHistory = async (
  token?: string
): Promise<PaymentHistory[]> => {
  const config = getConfig("/subscriptions/payments/", "GET", token);
  return bookiesAxiosInstance(config);
};

/** GET — Subscription plans */
export const getSubscriptionPlans = async (
  token?: string
): Promise<GetSubscriptionPlansResponse> => {
  const config = getConfig("/subscriptions/plans/", "GET", token);
  return bookiesAxiosInstance(config);
};

/** POST — Initiate subscription renewal payment */
export const initiateRenewalPayment = async (
  token?: string
): Promise<InitializeSubscriptionPaymentResponse> => {
  const config = getConfig("/subscriptions/renewal/initiate/", "POST", token);
  return bookiesAxiosInstance(config);
};

/** GET — Subscription status */
export const getSubscriptionStatus = async (
  token?: string
): Promise<SubscriptionStatus> => {
  const config = getConfig("/subscriptions/status/", "GET", token);
  return bookiesAxiosInstance(config);
};
