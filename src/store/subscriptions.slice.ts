// subscriptionSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  SubscriptionDetails,
  SubscriptionPreview,
  SubscriptionNotification,
  PaymentHistory,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/api-services/subscriptiions.service";

interface SubscriptionState {
  details: SubscriptionDetails | null;
  preview: SubscriptionPreview | null;
  notifications: SubscriptionNotification[];
  paymentHistory: PaymentHistory[];
  plans: SubscriptionPlan[];
  status: SubscriptionStatus | null;
}

const initialState: SubscriptionState = {
  details: null,
  preview: null,
  notifications: [],
  paymentHistory: [],
  plans: [],
  status: null,
};

export const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    /**
     * OVERALL RESET
     */
    resetSubscriptionState: () => initialState,

    /**
     * SUBSCRIPTION DETAILS
     */
    setSubscriptionDetails: (
      state,
      action: PayloadAction<SubscriptionDetails>
    ) => {
      state.details = action.payload;
    },

    // Update a single subscription field
    updateSubscriptionField: <K extends keyof SubscriptionDetails>(
      state: any,
      action: PayloadAction<{ key: K; value: SubscriptionDetails[K] }>
    ) => {
      if (state.details) {
        state.details[action.payload.key] = action.payload.value;
      }
    },

    // Update multiple details at once
    updateSubscriptionDetails: (
      state,
      action: PayloadAction<Partial<SubscriptionDetails>>
    ) => {
      if (state.details) {
        state.details = {
          ...state.details,
          ...action.payload,
        };
      }
    },

    /**
     * PREVIEW (POST /subscriptions/create/)
     */
    setSubscriptionPreview: (
      state,
      action: PayloadAction<SubscriptionPreview>
    ) => {
      state.preview = action.payload;
    },

    /**
     * NOTIFICATIONS
     */
    setSubscriptionNotifications: (
      state,
      action: PayloadAction<SubscriptionNotification[]>
    ) => {
      state.notifications = action.payload;
    },

    updateNotificationReadStatus: (
      state,
      action: PayloadAction<{ id: string; is_read: boolean }>
    ) => {
      const n = state.notifications.find((x) => x.id === action.payload.id);
      if (n) n.is_read = action.payload.is_read;
    },

    /**
     * PAYMENT HISTORY
     */
    setSubscriptionPaymentHistory: (
      state,
      action: PayloadAction<PaymentHistory[]>
    ) => {
      state.paymentHistory = action.payload;
    },

    /**
     * PLANS
     */
    setSubscriptionPlans: (
      state,
      action: PayloadAction<SubscriptionPlan[]>
    ) => {
      state.plans = action.payload;
    },

    /**
     * STATUS
     */
    setSubscriptionStatus: (
      state,
      action: PayloadAction<SubscriptionStatus>
    ) => {
      state.status = action.payload;
    },
  },
});

export const {
  resetSubscriptionState,
  setSubscriptionDetails,
  updateSubscriptionField,
  updateSubscriptionDetails,
  setSubscriptionPreview,
  setSubscriptionNotifications,
  updateNotificationReadStatus,
  setSubscriptionPaymentHistory,
  setSubscriptionPlans,
  setSubscriptionStatus,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
