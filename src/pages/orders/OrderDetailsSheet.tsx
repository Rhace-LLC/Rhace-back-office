// components/OrderDetailsSheet.tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Order } from "./types/order";
import { Staff } from "../../api-services/staffService";
import { Table } from "../../api-services/tableService";
import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Truck,
  ChefHat,
  Package,
  User,
  Table as TableIcon,
  AlertTriangle,
  Utensils,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Define OrderStatus with "paid" included
type OrderStatus =
  | "paid"
  | "received"
  | "preparing"
  | "ready"
  | "served"  // Added served status
  | "completed"
  | "cancelled"
  | "delivered";

// Define proper types for order items based on your data structure
interface MenuItem {
  id: string;
  restaurant: string;
  restaurant_name: string;
  name: string;
  category: {
    id: number;
    restaurant: string;
    restaurant_name: string;
    name: string;
    description: string | null;
    image: string | null;
    image_url: string | null;
    items_count: number;
    created_at: string;
    updated_at: string;
  };
  description: string;
  price: string;
  ingredients: Array<{
    inventory_item: number;
    quantity: number;
  }>;
  display_ingredients: string[];
  allergens: string[];
  image_url: string | null;
  prep_time: string;
  created: string;
  updated: string;
  available: boolean;
  is_special: boolean;
}

// Define the two possible item formats
interface OrderItemWithMenuItem {
  id: number;
  menu_item: MenuItem;
  quantity: number;
  price: string;
}

interface OrderItemSimple {
  id: number;
  menu_item_name: string;
  quantity: number;
  price: string;
}

type OrderItem = OrderItemWithMenuItem | OrderItemSimple;

interface OrderDetailsSheetProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onAssignTable: (orderId: string, tableId: string) => void;
  onAssignWaiter: (orderId: string, waiterId: string) => void;
  staff: Staff[];
  tables: Table[];
}

// Convert status to uppercase for display, but keep values lowercase
const statusColors: Record<OrderStatus, string> = {
  paid: "bg-green-100 text-green-800 border-green-200",
  received: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  served: "bg-indigo-100 text-indigo-800 border-indigo-200",  // Added served
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  delivered: "bg-purple-100 text-purple-800 border-purple-200",
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  paid: <CheckCircle className="h-4 w-4" />,
  received: <Package className="h-4 w-4" />,
  preparing: <ChefHat className="h-4 w-4" />,
  ready: <Clock className="h-4 w-4" />,
  served: <Utensils className="h-4 w-4" />,  // Added served icon
  completed: <CheckCircle className="h-4 w-4" />,
  cancelled: <Clock className="h-4 w-4" />,
  delivered: <Truck className="h-4 w-4" />,
};

const statusDescriptions: Record<OrderStatus, string> = {
  paid: "Order has been paid for and is ready for processing",
  received: "Order has been received and is waiting to be processed",
  preparing: "Kitchen is currently preparing the order",
  ready: "Order is ready for pickup or delivery",
  served: "Order has been served to the customer",  // Added served description
  completed: "Order has been completed successfully",
  cancelled: "Order has been cancelled",
  delivered: "Order has been delivered to customer",
};

// Show notification when an action is completed
const showActionNotification = (
  action: string,
  orderId: string,
  newStatus?: string
) => {
  let description = `Order #${orderId} has been updated successfully.`;

  if (newStatus) {
    description = `Order #${orderId} status changed to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase()}.`;

    // Special notifications for certain statuses
    switch (newStatus) {
      case "ready":
        description = `Order #${orderId} is now READY for serving!`;
        break;
      case "served":
        description = `Order #${orderId} has been SERVED to customer.`;
        break;
      case "delivered":
        description = `Order #${orderId} has been DELIVERED to customer.`;
        break;
      case "completed":
        description = `Order #${orderId} has been COMPLETED successfully.`;
        break;
      case "cancelled":
        description = `Order #${orderId} has been CANCELLED.`;
        break;
      case "paid":
        description = `Order #${orderId} has been marked as PAID.`;
        break;
      case "preparing":
        description = `Order #${orderId} is now being PREPARED.`;
        break;
    }
  }

  toast.success(`${action} Completed`, {
    description,
    icon: <Bell className="h-4 w-4" />,
    duration: 3000,
  });
};

export function OrderDetailsSheet({
  order,
  isOpen,
  onClose,
  onStatusChange,
  onAssignTable,
  onAssignWaiter,
  staff,
  tables,
}: OrderDetailsSheetProps) {
  const { isWaiter, isOwner, isKitchen } = useAuth();
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedWaiter, setSelectedWaiter] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

  // Filter staff to only show active waiters
  const waiters = staff.filter(
    (staffMember) =>
      staffMember.role === "waiter" && staffMember.is_active === true
  );

  // Filter tables to only show available ones (is_available: true)
  const availableTables = tables.filter((table) => table.is_available === true);

  // Check order type
  const isDeliveryTakeaway =
    order?.order_type === "delivery" || order?.order_type === "takeaway";
  const isDineIn = order?.order_type === "dine-in";

  // Safe item accessor that handles both formats
  const getSafeItems = (order: Order | null): OrderItem[] => {
    if (!order) return [];
    if (!Array.isArray(order.items)) return [];

    // Return all items as-is, the component will handle both formats
    return order.items.filter(
      (item) => item !== null && typeof item === "object"
    ) as OrderItem[];
  };

  // Helper function to check if item has full menu_item object
  const hasFullMenuItem = (item: OrderItem): item is OrderItemWithMenuItem => {
    return "menu_item" in item && item.menu_item !== null;
  };

  // Helper function to check if item has simple format
  const hasSimpleItem = (item: OrderItem): item is OrderItemSimple => {
    return "menu_item_name" in item;
  };

  // Initialize when order changes
  useEffect(() => {
    if (order) {
      console.log("Order status:", order.status);
      console.log("Available status options:", getAvailableStatusOptions());
      setSelectedStatus(order.status as OrderStatus);
      if (order.waiter) {
        setSelectedWaiter(order.waiter);
      }
      if (order.table) {
        setSelectedTable(order.table);
      }
    }
  }, [order]);

  if (!order) return null;

  // Safe data accessors
  const getItemsCount = () => getSafeItems(order).length;
  const getCustomerName = () => order?.customer_name || "N/A";
  const getCustomerPhone = () => order?.customer_phone || "N/A";
  const getTotalPrice = () =>
    order?.total_price ? parseFloat(order.total_price).toFixed(2) : "0.00";
  const getOrderType = () => order?.order_type || "unknown";
  const getCreatedAt = () => {
    if (!order?.created_at) return "N/A";
    return new Date(order.created_at).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get assigned waiter details
  const getAssignedWaiter = () => {
    if (!order.waiter) return null;
    return staff.find((s) => s.id === order.waiter);
  };

  // Get assigned table details
  const getAssignedTable = () => {
    if (!order.table) return null;
    const table = tables.find((t) => t.id === order.table);
    return table;
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    const currentStatus = order.status as OrderStatus;

    // Check if the transition is allowed based on user role
    let canChange = false;
    let errorMessage = "";

    if (isKitchen) {
      // Kitchen staff permissions
      if (
        (currentStatus === "paid" || currentStatus === "received") &&
        newStatus === "preparing"
      )
        canChange = true;
      if (currentStatus === "preparing" && newStatus === "ready")
        canChange = true;
      if (
        newStatus === "cancelled" &&
        (currentStatus === "paid" ||
          currentStatus === "received" ||
          currentStatus === "preparing")
      )
        canChange = true;

      if (!canChange) {
        errorMessage = `Kitchen staff can only change from "paid/received" to "preparing" or "preparing" to "ready" or cancel during preparation`;
      }
    }

    if (isWaiter) {
      // Waiter permissions
      if (currentStatus === "ready" && newStatus === "served" && !isDeliveryTakeaway) canChange = true;
      if (currentStatus === "served" && newStatus === "completed" && !isDeliveryTakeaway) canChange = true;
      if (currentStatus === "ready" && newStatus === "delivered" && isDeliveryTakeaway) canChange = true;
      if (currentStatus === "delivered" && newStatus === "completed" && isDeliveryTakeaway) canChange = true;
      if (newStatus === "cancelled") canChange = true; // Waiters can cancel any order

      if (!canChange) {
        if (isDeliveryTakeaway) {
          errorMessage = `Waiters can only change from "ready" to "delivered" or "delivered" to "completed" for delivery/takeaway orders`;
        } else {
          errorMessage = `Waiters can only change from "ready" to "served" or "served" to "completed" for dine-in orders`;
        }
      }
    }

    if (isOwner) {
      // Owners can do anything
      canChange = true;
    }

    if (!canChange) {
      toast.error("Access Denied", {
        description:
          errorMessage ||
          `You don't have permission to change status from ${currentStatus} to ${newStatus}`,
      });
      return;
    }

    setSelectedStatus(newStatus);
    onStatusChange(order.id, newStatus);

    // Show notification
    showActionNotification("Status update", order.id, newStatus);
  };

  const handleQuickStatusUpdate = () => {
    const availableStatusOptions = getAvailableStatusOptions();
    if (availableStatusOptions.length > 0) {
      const nextStatus = availableStatusOptions[0];
      setSelectedStatus(nextStatus);
      onStatusChange(order.id, nextStatus);

      // Show notification
      showActionNotification("Status update", order.id, nextStatus);
    }
  };

  const handleAssignTable = () => {
    // Only restaurant owners can assign tables
    if (!isOwner) {
      toast.error("Access Denied", {
        description: "Only restaurant owners can assign tables",
      });
      return;
    }

    if (selectedTable) {
      onAssignTable(order.id, selectedTable);
      setSelectedTable("");

      // Show notification
      showActionNotification("Table assigned", order.id);
    }
  };

  const handleAssignWaiter = () => {
    // Kitchen staff and owners can assign waiters
    if (!isKitchen && !isOwner) {
      toast.error("Access Denied", {
        description: "Only kitchen staff and owners can assign waiters",
      });
      return;
    }

    if (selectedWaiter) {
      onAssignWaiter(order.id, selectedWaiter);
      setSelectedWaiter("");

      // Show notification
      showActionNotification("Waiter assigned", order.id);
    }
  };

  const isEditable =
    order.status !== "completed" && order.status !== "cancelled";

  const getAvailableStatusOptions = (): OrderStatus[] => {
    const currentStatus = order.status as OrderStatus;

    switch (currentStatus) {
      case "paid":
        // Kitchen can change to preparing, anyone can cancel
        if (isKitchen || isOwner) return ["preparing", "cancelled"];
        if (isWaiter) return ["cancelled"];
        return [];

      case "received":
        // Kitchen can change to preparing, anyone can cancel
        if (isKitchen || isOwner) return ["preparing", "cancelled"];
        if (isWaiter) return ["cancelled"];
        return [];

      case "preparing":
        // Kitchen can change to ready or cancel
        if (isKitchen || isOwner) return ["ready", "cancelled"];
        if (isWaiter) return ["cancelled"];
        return [];

      case "ready":
        const readyOptions: OrderStatus[] = ["cancelled"];
        
        // Waiters/owners can mark as served (for dine-in) or delivered (for delivery/takeaway)
        if (isWaiter || isOwner) {
          if (isDeliveryTakeaway) {
            readyOptions.push("delivered");
          } else {
            // For dine-in orders: ready -> served -> completed
            readyOptions.push("served");
          }
        }

        // Kitchen can also cancel at this stage
        if (isKitchen) {
          if (!readyOptions.includes("cancelled")) {
            readyOptions.push("cancelled");
          }
        }

        return readyOptions;
      
      case "served":
        // Only for dine-in orders
        const servedOptions: OrderStatus[] = ["cancelled"];
        if (isWaiter || isOwner) servedOptions.push("completed");
        return servedOptions;
      
      case "delivered":
        // Only for delivery/takeaway orders
        const deliveredOptions: OrderStatus[] = ["cancelled"];
        if (isWaiter || isOwner) deliveredOptions.push("completed");
        return deliveredOptions;

      case "completed":
        return []; // No changes allowed after completion

      case "cancelled":
        return []; // No changes allowed after cancellation

      default:
        return [];
    }
  };

  const availableStatusOptions = getAvailableStatusOptions();
  const assignedWaiter = getAssignedWaiter();
  const assignedTable = getAssignedTable();

  // Get the display name for quick update button
  const getQuickUpdateLabel = () => {
    if (availableStatusOptions.length === 0) return "No Actions";
    const nextStatus = availableStatusOptions[0];
    switch (nextStatus) {
      case "preparing":
        return "Start Preparing";
      case "ready":
        return "Mark Ready";
      case "served":
        return "Mark as Served";
      case "delivered":
        return "Mark Delivered";
      case "completed":
        return "Complete Order";
      case "cancelled":
        return "Cancel Order";
      default:
        return "Update";
    }
  };

  // Helper function to format status for display
  const formatStatusForDisplay = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Get user role badge
  const getUserRoleBadge = () => {
    if (isKitchen)
      return (
        <Badge
          variant="secondary"
          className="ml-2 border-orange-200 bg-orange-100 text-orange-800"
        >
          Kitchen
        </Badge>
      );
    if (isWaiter)
      return (
        <Badge
          variant="secondary"
          className="ml-2 border-blue-200 bg-blue-100 text-blue-800"
        >
          Waiter
        </Badge>
      );
    if (isOwner)
      return (
        <Badge
          variant="secondary"
          className="ml-2 border-green-200 bg-green-100 text-green-800"
        >
          Owner
        </Badge>
      );
    return null;
  };

  // Render individual item based on its format
  const renderOrderItem = (item: OrderItem, index: number) => {
    // Handle the API response format (simple format)
    if (hasSimpleItem(item)) {
      return (
        <div
          key={item.id || index}
          className="bg-muted/30 rounded-lg border p-4"
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-foreground font-semibold">
                {item.menu_item_name || "Unknown Item"}
              </h4>
              <p className="text-muted-foreground text-sm">
                Quantity: {item.quantity} × ₦
                {parseFloat(item.price || "0").toFixed(2)}
              </p>
              <p className="mt-1 text-sm font-medium">
                Subtotal: ₦
                {(parseFloat(item.price || "0") * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Handle the expected format with menu_item object
    if (hasFullMenuItem(item)) {
      return (
        <div
          key={item.id || index}
          className="bg-muted/30 rounded-lg border p-4"
        >
          {/* Item Header */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-foreground font-semibold">
                {item.menu_item?.name || "Unknown Item"}
              </h4>
              <p className="text-muted-foreground text-sm">
                Quantity: {item.quantity} × ₦
                {parseFloat(item.price || "0").toFixed(2)}
              </p>
              <p className="mt-1 text-sm font-medium">
                Subtotal: ₦
                {(parseFloat(item.price || "0") * item.quantity).toFixed(2)}
              </p>
            </div>
            {item.menu_item?.image_url && (
              <img
                src={item.menu_item.image_url}
                alt={item.menu_item.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
          </div>

          {/* Description */}
          {item.menu_item?.description && (
            <div className="mb-3">
              <p className="text-muted-foreground text-sm">
                {item.menu_item.description}
              </p>
            </div>
          )}

          {/* Ingredients */}
          {item.menu_item?.display_ingredients &&
            item.menu_item.display_ingredients.length > 0 && (
              <div className="mb-3">
                <div className="mb-2 flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-green-600" />
                  <Label className="text-sm font-medium">Ingredients</Label>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.menu_item.display_ingredients.map(
                    (ingredient: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {ingredient}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Allergens */}
          {item.menu_item?.allergens && item.menu_item.allergens.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <Label className="text-sm font-medium text-amber-600">
                  Allergens
                </Label>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.menu_item.allergens.map(
                  (allergen: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-amber-200 bg-amber-50 text-xs text-amber-700"
                    >
                      {allergen}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}

          {/* Preparation Time */}
          {item.menu_item?.prep_time && (
            <div className="mt-3 border-t pt-3">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Clock className="h-3 w-3" />
                <span>Prep time: {item.menu_item.prep_time}</span>
            </div>
            </div>
          )}
        </div>
      );
    }

    // Fallback for unknown format
    return (
      <div key={index} className="bg-muted/30 rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">Unknown item format</p>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="flex-shrink-0 border-b pb-4">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <span>Order #{order.id}</span>
              {getUserRoleBadge()}
            </div>
            <Badge
              variant="secondary"
              className={`${statusColors[order.status as OrderStatus]} flex items-center gap-1 border font-medium`}
            >
              {statusIcons[order.status as OrderStatus]}
              {formatStatusForDisplay(order.status)}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable content area */}
        <div className="flex-1 space-y-6 overflow-y-auto py-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <div className="bg-primary h-5 w-1 rounded-full" />
              Customer Information
            </h3>
            <div className="bg-muted/30 grid grid-cols-1 gap-4 rounded-lg border p-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  Name
                </Label>
                <p className="text-base font-medium">{getCustomerName()}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  Phone
                </Label>
                <p className="text-base">{getCustomerPhone()}</p>
              </div>
              {order.address && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">
                    Address
                  </Label>
                  <p className="text-base">{order.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items with Ingredients & Allergens */}
          <div className="space-y-4">
            <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <div className="bg-primary h-5 w-1 rounded-full" />
              Order Items ({getItemsCount()})
            </h3>
            <div className="space-y-3">
              {getSafeItems(order).length === 0 ? (
                <div className="text-muted-foreground bg-muted/30 rounded-lg border p-4 text-center">
                  No items in this order
                </div>
              ) : (
                getSafeItems(order).map((item, index) =>
                  renderOrderItem(item, index)
                )
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <div className="bg-primary h-5 w-1 rounded-full" />
              Order Summary
            </h3>
            <div className="bg-muted/30 grid grid-cols-2 gap-4 rounded-lg border p-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  Order Type
                </Label>
                <Badge variant="secondary" className="w-fit">
                  {getOrderType().toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  Total Amount
                </Label>
                <p className="text-base font-medium">₦{getTotalPrice()}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  Items Count
                </Label>
                <p className="text-base">{getItemsCount()} items</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  Created
                </Label>
                <p className="text-base text-sm">{getCreatedAt()}</p>
              </div>

              {/* Current Assignments */}
              <div className="col-span-2 space-y-2 border-t pt-3">
                <Label className="text-muted-foreground text-sm font-medium">
                  Current Assignments
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {/* Waiter Assignment */}
                  <div className="bg-background flex items-center justify-between rounded border p-2">
                    <div className="flex items-center gap-2">
                      <User className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Waiter</p>
                        <p className="text-muted-foreground text-xs">
                          {assignedWaiter
                            ? `${assignedWaiter.full_name}`
                            : "Not assigned"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={assignedWaiter ? "default" : "outline"}
                      className="text-xs"
                    >
                      {assignedWaiter ? "Assigned" : "Pending"}
                    </Badge>
                  </div>

                  {/* Table Assignment - Only for dine-in */}
                  {isDineIn && (
                    <div className="bg-background flex items-center justify-between rounded border p-2">
                      <div className="flex items-center gap-2">
                        <TableIcon className="text-muted-foreground h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Table</p>
                          <p className="text-muted-foreground text-xs">
                            {assignedTable
                              ? `Table ${assignedTable.table_number} (${assignedTable.max_party_size} seats)`
                              : "Not assigned"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={assignedTable ? "default" : "outline"}
                        className="text-xs"
                      >
                        {assignedTable ? "Assigned" : "Pending"}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Waiter Assignment Section - Kitchen staff and owners can assign */}
          {(isKitchen || isOwner) && waiters.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                <div className="bg-primary h-5 w-1 rounded-full" />
                Waiter Assignment
              </h3>

              {/* Waiter Assignment */}
              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Assigned Waiter</span>
                  </div>
                  <Badge
                    variant={assignedWaiter ? "default" : "outline"}
                    className="font-normal"
                  >
                    {assignedWaiter ? "Assigned" : "Not assigned"}
                  </Badge>
                </div>

                {/* Current Waiter Info */}
                {assignedWaiter && (
                  <div className="bg-background mb-3 rounded border p-2">
                    <p className="text-sm font-medium">
                      {assignedWaiter.full_name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {assignedWaiter.phone} • {assignedWaiter.email}
                    </p>
                  </div>
                )}

                {/* Waiter Assignment Controls */}
                {isEditable && (
                  <div className="space-y-3 border-t pt-3">
                    <Label
                      htmlFor="waiter-select"
                      className="text-sm font-medium"
                    >
                      {assignedWaiter ? "Change Waiter" : "Assign Waiter"}
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedWaiter}
                        onValueChange={setSelectedWaiter}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select waiter" />
                        </SelectTrigger>
                        <SelectContent>
                          {waiters.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No waiters available
                            </SelectItem>
                          ) : (
                            waiters.map((waiter) => (
                              <SelectItem key={waiter.id} value={waiter.id}>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <div>
                                    <span>{waiter.full_name}</span>
                                    <p className="text-muted-foreground text-xs">
                                      {waiter.phone}
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAssignWaiter}
                        disabled={!selectedWaiter || waiters.length === 0}
                        className="whitespace-nowrap"
                      >
                        {assignedWaiter ? "Change" : "Assign"}
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {waiters.length} waiters available
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Table Assignment for Dine-in Orders - Only for restaurant owners */}
          {isDineIn && isOwner && (
            <div className="space-y-4">
              <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                <div className="bg-primary h-5 w-1 rounded-full" />
                Table Information
              </h3>

              {/* Table Assignment */}
              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TableIcon className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Assigned Table</span>
                  </div>
                  <Badge
                    variant={assignedTable ? "default" : "outline"}
                    className="font-normal"
                  >
                    {assignedTable ? "Assigned" : "Not assigned"}
                  </Badge>
                </div>

                {/* Current Table Info */}
                {assignedTable && (
                  <div className="bg-background mb-3 rounded border p-2">
                    <p className="text-sm font-medium">
                      Table {assignedTable.table_number}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {assignedTable.max_party_size} seats •{" "}
                      {assignedTable.is_available
                        ? "Available"
                        : "Not Available"}
                    </p>
                  </div>
                )}

                {/* Table Assignment Controls */}
                {isEditable && (
                  <div className="space-y-3 border-t pt-3">
                    <Label
                      htmlFor="table-select"
                      className="text-sm font-medium"
                    >
                      {assignedTable ? "Change Table" : "Assign Table"}
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedTable}
                        onValueChange={setSelectedTable}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select table" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTables.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No available tables
                            </SelectItem>
                          ) : (
                            availableTables.map((table) => (
                              <SelectItem key={table.id} value={table.id}>
                                <div className="flex items-center gap-2">
                                  <TableIcon className="h-4 w-4" />
                                  <div>
                                    <span>Table {table.table_number}</span>
                                    <p className="text-muted-foreground text-xs">
                                      {table.max_party_size} seats •{" "}
                                      {table.is_available
                                        ? "Available"
                                        : "Not Available"}
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAssignTable}
                        disabled={
                          !selectedTable || availableTables.length === 0
                        }
                        className="whitespace-nowrap"
                      >
                        {assignedTable ? "Change" : "Assign"}
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {availableTables.length} tables available
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Section */}
          <div className="space-y-4">
            <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <div className="bg-primary h-5 w-1 rounded-full" />
              Order Status
            </h3>

            {/* Current Status Display */}
            <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`rounded-full p-2 ${statusColors[order.status as OrderStatus]}`}
                  >
                    {statusIcons[order.status as OrderStatus]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current Status</p>
                    <p className="text-muted-foreground text-xs">
                      {statusDescriptions[order.status as OrderStatus]}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`${statusColors[order.status as OrderStatus]} border font-medium`}
                >
                  {formatStatusForDisplay(order.status)}
                </Badge>
              </div>

              {/* Status Update Section */}
              {isEditable && availableStatusOptions.length > 0 && (
                <div className="border-t pt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <Label
                      htmlFor="status-select"
                      className="text-sm font-medium"
                    >
                      Update Status
                    </Label>
                    <div className="flex items-center gap-2">
                      {isKitchen && (
                        <Badge
                          variant="outline"
                          className="border-orange-200 bg-orange-50 text-xs text-orange-700"
                        >
                          Kitchen Access
                        </Badge>
                      )}
                      {isWaiter && (
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-blue-50 text-xs text-blue-700"
                        >
                          Waiter Access
                        </Badge>
                      )}
                      {isOwner && (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-xs text-green-700"
                        >
                          Owner Access
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selectedStatus}
                      onValueChange={(value: OrderStatus) =>
                        handleStatusChange(value)
                      }
                      disabled={availableStatusOptions.length === 0}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatusOptions.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="flex items-center gap-2"
                          >
                            <div className="flex items-center gap-2">
                              {statusIcons[status]}
                              <span>{formatStatusForDisplay(status)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleQuickStatusUpdate}
                      variant="outline"
                      className="whitespace-nowrap"
                      disabled={availableStatusOptions.length === 0}
                    >
                      {getQuickUpdateLabel()}
                    </Button>
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Next available statuses:{" "}
                    {availableStatusOptions
                      .map((s) => formatStatusForDisplay(s))
                      .join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Delay Reason */}
          {order.delay_reason && (
            <div className="space-y-4">
              <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                <div className="bg-primary h-5 w-1 rounded-full" />
                Delay Information
              </h3>
              <div className="bg-muted/30 rounded-lg border p-4">
                <Label className="text-muted-foreground text-sm font-medium">
                  Delay Reason
                </Label>
                <p className="text-muted-foreground mt-1 text-sm">
                  {order.delay_reason}
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
