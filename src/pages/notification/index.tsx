import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { LucideIcon } from "lucide-react";

export interface NotificationItem {
  id: number;
  type:
    | "new_order"
    | "table_assigned"
    | "low_inventory"
    | "order_ready"
    | "table_cleaning"
    | "shift_reminder"
    | "kitchen_delay"
    | "customer_request";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "high" | "medium" | "low";
  icon: LucideIcon;
  color: string;
}

const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    type: "new_order",
    title: "New Order Received",
    message: "Table 5 has placed a new order - ORD-001",
    timestamp: "2 minutes ago",
    read: false,
    priority: "high",
    icon: UtensilsCrossed,
    color: "text-blue-600",
  },
  {
    id: 2,
    type: "table_assigned",
    title: "Table Assignment",
    message: "You have been assigned to Table 8",
    timestamp: "5 minutes ago",
    read: false,
    priority: "medium",
    icon: Users,
    color: "text-green-600",
  },
  {
    id: 3,
    type: "low_inventory",
    title: "Low Inventory Alert",
    message: "Fish & Chips ingredients are running low",
    timestamp: "10 minutes ago",
    read: false,
    priority: "high",
    icon: AlertTriangle,
    color: "text-red-600",
  },
  {
    id: 4,
    type: "order_ready",
    title: "Order Ready",
    message: "Order ORD-002 for Table 2 is ready for serving",
    timestamp: "12 minutes ago",
    read: true,
    priority: "medium",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    id: 5,
    type: "table_cleaning",
    title: "Table Needs Cleaning",
    message: "Table 12 requires cleaning before next guests",
    timestamp: "15 minutes ago",
    read: false,
    priority: "medium",
    icon: Users,
    color: "text-yellow-600",
  },
  {
    id: 6,
    type: "shift_reminder",
    title: "Shift Ending Soon",
    message: "Your shift ends in 30 minutes",
    timestamp: "20 minutes ago",
    read: true,
    priority: "low",
    icon: Clock,
    color: "text-gray-600",
  },
  {
    id: 7,
    type: "kitchen_delay",
    title: "Kitchen Delay",
    message: "Order ORD-003 is experiencing a 10-minute delay",
    timestamp: "25 minutes ago",
    read: true,
    priority: "high",
    icon: AlertTriangle,
    color: "text-red-600",
  },
  {
    id: 8,
    type: "customer_request",
    title: "Customer Request",
    message: "Table 7 requested extra napkins",
    timestamp: "30 minutes ago",
    read: true,
    priority: "low",
    icon: Bell,
    color: "text-blue-600",
  },
];

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

export function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    toast.success("All notifications marked as read");
  };

  const clearNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    toast.success("Notification cleared");
  };

  const clearAllRead = () => {
    setNotifications((prev) => prev.filter((notif) => !notif.read));
    toast.success("All read notifications cleared");
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "high") return notif.priority === "high";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityCount = notifications.filter(
    (n) => n.priority === "high" && !n.read
  ).length;

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with restaurant activities and alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            <p className="text-muted-foreground text-xs">Received today</p>
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
            Swipe or click the X to clear individual notifications
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
                              className="h-8 w-8 p-0"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearNotification(notification.id)}
                            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
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
