import {
  getAllNotifications,
  getUnreadCount,
  markNotificationsAsRead,
} from "@/api-services/notificationService";
import {
  createApiProbe,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

// Skipped on purpose: deleteNotification and clearAllNotifications destroy
// real notifications. Only marking fetched notifications as read is exercised.

export const notificationsAggregator: ServiceAggregatorDefinition = {
  id: "notifications",
  name: "Notifications",
  serviceFile: "notificationService.ts",
  description:
    "Notification reads plus an opt-in write: marks fetched notifications as read.",
  hasWriteProbes: true,
  getProbes: ({ token }) => {
    if (!token) return [];
    return [
      createApiProbe(
        "notifications-list",
        "All notifications",
        "GET",
        "/notifications/",
        () => getAllNotifications(token)
      ),
      createApiProbe(
        "notifications-unread",
        "Unread count",
        "GET",
        "/notifications/unread-count/",
        () => getUnreadCount(token)
      ),
      createApiProbe(
        "notifications-mark-read",
        "Mark fetched notifications read",
        "POST",
        "/notifications/mark-read/",
        async () => {
          const list = await getAllNotifications(token);
          const ids = list.results.slice(0, 5).map((item) => item.id);
          if (ids.length === 0) {
            throw new Error("Skipped: no notifications found");
          }
          return markNotificationsAsRead(
            { notification_ids: ids, mark_all: false },
            token
          );
        },
        true
      ),
    ];
  },
};
