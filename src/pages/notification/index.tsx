// components/notifications/Notifications.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Clock,
  Users,
  UtensilsCrossed,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { LucideIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Notification,
  getAllNotifications,
  deleteNotification,
  clearAllNotifications,
  markNotificationsAsRead,
  getUnreadCount,
} from "../../api-services/notificationService";

// Define notification types to fix the circular reference
export type NotificationType = 
  | "new_order"
  | "table_assigned"
  | "low_inventory"
  | "order_ready"
  | "table_cleaning"
  | "shift_reminder"
  | "kitchen_delay"
  | "customer_request";

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "high" | "medium" | "low";
  icon: LucideIcon;
  color: string;
}

// Cache state interface
interface NotificationsCache {
  data: NotificationItem[];
  lastFetched: number;
  unreadCount: number;
}

// Map API notification types to UI types
const mapNotificationType = (apiType: string): NotificationType => {
  const typeMap: { [key: string]: NotificationType } = {
    order_created: "new_order",
    order_ready: "order_ready",
    table_assigned: "table_assigned",
    low_stock: "low_inventory",
    kitchen_delay: "kitchen_delay",
    shift_reminder: "shift_reminder",
    customer_request: "customer_request",
    table_cleaning: "table_cleaning",
  };
  return typeMap[apiType] || "new_order";
};

// Map API priority to UI priority
const mapPriority = (apiPriority: string): NotificationItem["priority"] => {
  const priorityMap: { [key: string]: NotificationItem["priority"] } = {
    low: "low",
    medium: "medium",
    high: "high",
  };
  return priorityMap[apiPriority] || "medium";
};

// Get icon and color based on notification type
const getNotificationIcon = (type: NotificationType): { icon: LucideIcon; color: string } => {
  switch (type) {
    case "new_order":
      return { icon: UtensilsCrossed, color: "text-blue-600" };
    case "table_assigned":
      return { icon: Users, color: "text-green-600" };
    case "low_inventory":
      return { icon: AlertTriangle, color: "text-red-600" };
    case "order_ready":
      return { icon: CheckCircle, color: "text-green-600" };
    case "table_cleaning":
      return { icon: Users, color: "text-yellow-600" };
    case "shift_reminder":
      return { icon: Clock, color: "text-gray-600" };
    case "kitchen_delay":
      return { icon: AlertTriangle, color: "text-red-600" };
    case "customer_request":
      return { icon: Bell, color: "text-blue-600" };
    default:
      return { icon: Bell, color: "text-gray-600" };
  }
};

const priorityColors = {
  high: "border-l-red-500",
  medium: "border-l-yellow-500",
  low: "border-l-green-500",
};

const priorityBadges = {
  high: { variant: "destructive" as const, text: "High" },
  medium: { variant: "secondary" as const, text: "Medium" },
  low: { variant: "outline" as const, text: "Low" },
};

// Cache configuration
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache
let notificationsCache: NotificationsCache | null = null;
let backgroundFetchInProgress = false;

export function Notifications() {
  const auth = useAuth();
  const token = auth?.token;
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<number[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [unreadCount, setUnreadCount] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Check if cache is valid
  const isCacheValid = (): boolean => {
    if (!notificationsCache) return false;
    return Date.now() - notificationsCache.lastFetched < CACHE_DURATION;
  };

  // Background refresh function
  const backgroundRefresh = async () => {
    if (!token || backgroundFetchInProgress) return;

    try {
      backgroundFetchInProgress = true;
      console.log("🔔 Notifications - Background refreshing...");
      
      const response = await getAllNotifications(token);
      const notificationsData = response.results || [];
      
      const mappedNotifications: NotificationItem[] = notificationsData.map((apiNotif: Notification) => {
        const type = mapNotificationType(apiNotif.notification_type);
        const { icon, color } = getNotificationIcon(type);
        
        return {
          id: apiNotif.id,
          type,
          title: apiNotif.title,
          message: apiNotif.message,
          timestamp: apiNotif.time_ago,
          read: apiNotif.is_read,
          priority: mapPriority(apiNotif.priority),
          icon,
          color,
        };
      });

      const newUnreadCount = mappedNotifications.filter(n => !n.read).length;

      // Update cache
      notificationsCache = {
        data: mappedNotifications,
        lastFetched: Date.now(),
        unreadCount: newUnreadCount
      };

      // Only update state if component is mounted and user might be viewing
      setNotifications(mappedNotifications);
      setUnreadCount(newUnreadCount);
      setLastUpdated(Date.now());
      
      console.log("🔔 Notifications - Background refresh completed");
    } catch (error) {
      console.error("🔔 Notifications - Background refresh failed:", error);
    } finally {
      backgroundFetchInProgress = false;
    }
  };

  // Main fetch function with cache - FIXED to prevent loading flash
  const fetchNotifications = async (forceRefresh = false) => {
    if (!token) {
      console.log("🔔 Notifications - No token available");
      setLoading(false);
      setInitialLoadComplete(true);
      return;
    }

    // IMMEDIATELY set cached data if available and not forcing refresh
    if (!forceRefresh && isCacheValid() && notificationsCache) {
      console.log("🔔 Notifications - Using cached data immediately");
      setNotifications(notificationsCache.data);
      setUnreadCount(notificationsCache.unreadCount);
      setLoading(false);
      setInitialLoadComplete(true);
      
      // Still refresh in background if cache is getting stale
      const cacheAge = Date.now() - notificationsCache.lastFetched;
      if (cacheAge > CACHE_DURATION / 2) { // Refresh if cache is older than half duration
        backgroundRefresh();
      }
      return;
    }

    // Only show loading if we don't have cached data
    if (!notificationsCache || forceRefresh) {
      setLoading(true);
    }

    try {
      console.log("🔔 Notifications - Fetching notifications...");
      
      const response = await getAllNotifications(token);
      const notificationsData = response.results || [];
      
      const mappedNotifications: NotificationItem[] = notificationsData.map((apiNotif: Notification) => {
        const type = mapNotificationType(apiNotif.notification_type);
        const { icon, color } = getNotificationIcon(type);
        
        return {
          id: apiNotif.id,
          type,
          title: apiNotif.title,
          message: apiNotif.message,
          timestamp: apiNotif.time_ago,
          read: apiNotif.is_read,
          priority: mapPriority(apiNotif.priority),
          icon,
          color,
        };
      });

      const newUnreadCount = mappedNotifications.filter(n => !n.read).length;

      // Update cache
      notificationsCache = {
        data: mappedNotifications,
        lastFetched: Date.now(),
        unreadCount: newUnreadCount
      };

      console.log("🔔 Notifications - Mapped notifications:", mappedNotifications);
      setNotifications(mappedNotifications);
      setUnreadCount(newUnreadCount);
      setLastUpdated(Date.now());
    } catch (error) {
      console.error("🔔 Notifications - Error fetching notifications:", error);
      
      // If we have cached data, use it even on error
      if (notificationsCache && !forceRefresh) {
        console.log("🔔 Notifications - Using cached data due to error");
        setNotifications(notificationsCache.data);
        setUnreadCount(notificationsCache.unreadCount);
      } else {
        toast.error("Failed to load notifications");
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoadComplete(true);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(true);
  };

  // Fetch unread count separately if needed
  const fetchUnreadCount = async () => {
    if (!token) return;
    
    try {
      const count = await getUnreadCount(token);
      console.log("🔔 Notifications - Unread count:", count);
    } catch (error) {
      console.error("🔔 Notifications - Error fetching unread count:", error);
    }
  };

  // Initial load and background refresh setup
  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchUnreadCount();

      // Set up background refresh every 30 seconds
      const backgroundInterval = setInterval(() => {
        backgroundRefresh();
      }, 30000);

      return () => {
        clearInterval(backgroundInterval);
      };
    } else {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  }, [token]);

  // Update local state when marking as read
  const markAsRead = async (id: number) => {
    if (!token) return;

    try {
      setProcessing(prev => [...prev, id]);
      console.log("🔔 Notifications - Marking as read:", id);
      
      await markNotificationsAsRead({ notification_ids: [id], mark_all: false }, token);
      
      // Update local state immediately
      const updatedNotifications = notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      );
      
      const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
      
      setNotifications(updatedNotifications);
      setUnreadCount(newUnreadCount);
      
      // Update cache
      if (notificationsCache) {
        notificationsCache.data = updatedNotifications;
        notificationsCache.unreadCount = newUnreadCount;
      }
      
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("🔔 Notifications - Error marking as read:", error);
      toast.error("Failed to mark notification as read");
    } finally {
      setProcessing(prev => prev.filter(pid => pid !== id));
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;

    try {
      console.log("🔔 Notifications - Marking all as read");
      
      await markNotificationsAsRead({ notification_ids: [], mark_all: true }, token);
      
      // Update local state immediately
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
      
      // Update cache
      if (notificationsCache) {
        notificationsCache.data = updatedNotifications;
        notificationsCache.unreadCount = 0;
      }
      
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("🔔 Notifications - Error marking all as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const clearNotification = async (id: number) => {
    if (!token) return;

    try {
      setProcessing(prev => [...prev, id]);
      console.log("🔔 Notifications - Deleting notification:", id);
      
      await deleteNotification(id, token);
      
      // Update local state immediately
      const updatedNotifications = notifications.filter(notif => notif.id !== id);
      const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
      
      setNotifications(updatedNotifications);
      setUnreadCount(newUnreadCount);
      
      // Update cache
      if (notificationsCache) {
        notificationsCache.data = updatedNotifications;
        notificationsCache.unreadCount = newUnreadCount;
      }
      
      toast.success("Notification cleared");
    } catch (error) {
      console.error("🔔 Notifications - Error deleting notification:", error);
      toast.error("Failed to clear notification");
    } finally {
      setProcessing(prev => prev.filter(pid => pid !== id));
    }
  };

  const clearAllRead = async () => {
    if (!token) return;

    try {
      console.log("🔔 Notifications - Clearing all read notifications");
      
      // Get all read notification IDs
      const readIds = notifications.filter(notif => notif.read).map(notif => notif.id);
      
      if (readIds.length === 0) {
        toast.info("No read notifications to clear");
        return;
      }

      // Delete each read notification
      const deletePromises = readIds.map(id => deleteNotification(id, token));
      await Promise.all(deletePromises);
      
      // Update local state immediately
      const updatedNotifications = notifications.filter(notif => !notif.read);
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      
      // Update cache
      if (notificationsCache) {
        notificationsCache.data = updatedNotifications;
        notificationsCache.unreadCount = updatedNotifications.filter(n => !n.read).length;
      }
      
      toast.success("All read notifications cleared");
    } catch (error) {
      console.error("🔔 Notifications - Error clearing read notifications:", error);
      toast.error("Failed to clear read notifications");
    }
  };

  // Clear ALL notifications (using the clear-all endpoint)
  const clearAllNotificationsHandler = async () => {
    if (!token) return;

    try {
      console.log("🔔 Notifications - Clearing ALL notifications");
      await clearAllNotifications(token);
      
      // Update local state immediately
      setNotifications([]);
      setUnreadCount(0);
      
      // Update cache
      notificationsCache = {
        data: [],
        lastFetched: Date.now(),
        unreadCount: 0
      };
      
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("🔔 Notifications - Error clearing all notifications:", error);
      toast.error("Failed to clear all notifications");
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "high") return notif.priority === "high";
    return true;
  });

  const highPriorityCount = notifications.filter(
    (n) => n.priority === "high" && !n.read
  ).length;

  // Show loading only on initial load when no cache exists
if (loading && !notificationsCache) {
      return (
      <div className="mt-15 flex items-center justify-center p-5 md:mt-0">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-15 space-y-6 p-5 md:mt-0">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with restaurant activities and alerts
            {notificationsCache && (
              <span className="text-xs text-gray-500 ml-2">
                • Updated {Math.round((Date.now() - lastUpdated) / 1000)}s ago
                {refreshing && " (refreshing...)"}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllRead}>
            Clear Read
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllNotificationsHandler}
            disabled={notifications.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Notifications</CardTitle>
            <Bell className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{notifications.length}</div>
            <p className="text-muted-foreground text-xs">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Unread</CardTitle>
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{unreadCount}</div>
            <p className="text-muted-foreground text-xs">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">High Priority</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{highPriorityCount}</div>
            <p className="text-muted-foreground text-xs">Urgent items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Today</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{notifications.length}</div>
            <p className="text-muted-foreground text-xs">Recent activity</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-[#2542e3]" : ""}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
          className={filter === "unread" ? "bg-[#2542e3]" : ""}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === "high" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("high")}
          className={filter === "high" ? "bg-[#2542e3]" : ""}
        >
          High Priority ({highPriorityCount})
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Click the checkmark to mark as read or X to clear notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="text-lg">No notifications</h3>
                <p className="text-muted-foreground">
                  {filter === "unread"
                    ? "All notifications have been read"
                    : filter === "high"
                      ? "No high priority notifications"
                      : "No notifications available"}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const IconComponent = notification.icon;
                const isProcessing = processing.includes(notification.id);
                
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 rounded-lg border border-l-4 p-4 transition-all ${priorityColors[notification.priority]} ${notification.read ? "bg-muted/20" : "bg-background border"} ${!notification.read ? "shadow-sm" : ""} `}
                  >
                    <div className={`mt-1 ${notification.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4
                              className={`text-sm ${!notification.read ? "font-medium" : ""}`}
                            >
                              {notification.title}
                            </h4>
                            <Badge
                              variant={
                                priorityBadges[notification.priority].variant
                              }
                              className="text-xs"
                            >
                              {priorityBadges[notification.priority].text}
                            </Badge>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            )}
                          </div>
                          <p
                            className={`text-sm ${notification.read ? "text-muted-foreground" : ""}`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {notification.timestamp}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              disabled={isProcessing}
                              className="h-8 w-8 p-0"
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearNotification(notification.id)}
                            disabled={isProcessing}
                            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}