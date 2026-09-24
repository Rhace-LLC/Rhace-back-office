import {
  getPaymentHistory,
  getSubscriptionDetails,
  getSubscriptionNotifications,
  getSubscriptionPlans,
  getSubscriptionStatus,
  markNotificationAsRead,
} from "@/api-services/subscriptiions.service";
import {
  createApiProbe,
  extractFirstId,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

// Skipped on purpose: previewSubscription, initiateSubscriptionPayment,
// verifySubscriptionPayment, selectPayAsYouGoSubscription and
// initiateRenewalPayment all touch billing. Only marking a notification as
// read is exercised as a write.

export const subscriptionsAggregator: ServiceAggregatorDefinition = {
  id: "subscriptions",
  name: "Subscriptions",
  serviceFile: "subscriptiions.service.ts",
  description:
    "Subscription reads plus an opt-in write: marks the first notification as read.",
  hasWriteProbes: true,
  getProbes: ({ token }) => {
    if (!token) return [];
    return [
      createApiProbe(
        "subscriptions-details",
        "Subscription details",
        "GET",
        "/subscriptions/",
        () => getSubscriptionDetails(token)
      ),
      createApiProbe(
        "subscriptions-status",
        "Subscription status",
        "GET",
        "/subscriptions/status/",
        () => getSubscriptionStatus(token)
      ),
      createApiProbe(
        "subscriptions-plans",
        "Subscription plans",
        "GET",
        "/subscriptions/plans/",
        () => getSubscriptionPlans(token)
      ),
      createApiProbe(
        "subscriptions-payments",
        "Payment history",
        "GET",
        "/subscriptions/payments/",
        () => getPaymentHistory(token)
      ),
      createApiProbe(
        "subscriptions-notifications",
        "Notifications",
        "GET",
        "/subscriptions/notifications/",
        () => getSubscriptionNotifications(token)
      ),
      createApiProbe(
        "subscriptions-notification-read",
        "Mark first notification read",
        "POST",
        "/subscriptions/notifications/:id/read/",
        async () => {
          const id = extractFirstId(
            await getSubscriptionNotifications(token)
          );
          if (!id) throw new Error("Skipped: no notifications found");
          return markNotificationAsRead(id, token);
        },
        true
      ),
    ];
  },
};
