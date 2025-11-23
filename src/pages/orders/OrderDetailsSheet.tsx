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
import { Order, OrderStatus } from "./types/order";
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
} from "lucide-react";

interface OrderDetailsSheetProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onCancelOrder: (orderId: string) => void;
  onAssignTable: (orderId: string, tableId: string) => void;
  onAssignWaiter: (orderId: string, waiterId: string) => void;
  staff: Staff[];
  tables: Table[];
}

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.RECEIVED]: "bg-blue-100 text-blue-800 border-blue-200",
  [OrderStatus.PREPARING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [OrderStatus.READY]: "bg-green-100 text-green-800 border-green-200",
  [OrderStatus.COMPLETED]: "bg-gray-100 text-gray-800 border-gray-200",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
  [OrderStatus.DELIVERED]: "bg-purple-100 text-purple-800 border-purple-200",
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  [OrderStatus.RECEIVED]: <Package className="h-4 w-4" />,
  [OrderStatus.PREPARING]: <ChefHat className="h-4 w-4" />,
  [OrderStatus.READY]: <Clock className="h-4 w-4" />,
  [OrderStatus.COMPLETED]: <CheckCircle className="h-4 w-4" />,
  [OrderStatus.CANCELLED]: <Clock className="h-4 w-4" />,
  [OrderStatus.DELIVERED]: <Truck className="h-4 w-4" />,
};

const statusDescriptions: Record<OrderStatus, string> = {
  [OrderStatus.RECEIVED]:
    "Order has been received and is waiting to be processed",
  [OrderStatus.PREPARING]: "Kitchen is currently preparing the order",
  [OrderStatus.READY]: "Order is ready for pickup or delivery",
  [OrderStatus.COMPLETED]: "Order has been completed successfully",
  [OrderStatus.CANCELLED]: "Order has been cancelled",
  [OrderStatus.DELIVERED]: "Order has been delivered to customer",
};

export function OrderDetailsSheet({
  order,
  isOpen,
  onClose,
  onStatusChange,
  onCancelOrder,
  onAssignTable,
  onAssignWaiter,
  staff,
  tables,
}: OrderDetailsSheetProps) {
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedWaiter, setSelectedWaiter] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

  // Initialize when order changes
  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
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
  const getItemsCount = () => order?.items?.length || 0;
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
    return tables.find((t) => t.id === order.table);
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    setSelectedStatus(newStatus);
    onStatusChange(order.id, newStatus);
  };

  const handleQuickStatusUpdate = () => {
    const availableStatusOptions = nextStatusOptions[order.status] || [];
    if (availableStatusOptions.length > 0) {
      const nextStatus = availableStatusOptions[0];
      setSelectedStatus(nextStatus);
      onStatusChange(order.id, nextStatus);
    }
  };

  const handleCancel = () => {
    onCancelOrder(order.id);
  };

  const handleAssignTable = () => {
    if (selectedTable) {
      onAssignTable(order.id, selectedTable);
      setSelectedTable("");
    }
  };

  const handleAssignWaiter = () => {
    if (selectedWaiter) {
      onAssignWaiter(order.id, selectedWaiter);
      setSelectedWaiter("");
    }
  };

  const isEditable =
    order.status !== OrderStatus.COMPLETED &&
    order.status !== OrderStatus.CANCELLED &&
    order.status !== OrderStatus.DELIVERED;

  const nextStatusOptions = {
    [OrderStatus.RECEIVED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
    [OrderStatus.READY]: [
      OrderStatus.COMPLETED,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  const availableStatusOptions = nextStatusOptions[order.status] || [];
  const isDineInOrder = order.order_type === "dine-in";
  const assignedWaiter = getAssignedWaiter();
  const assignedTable = getAssignedTable();

  // Get the display name for quick update button
  const getQuickUpdateLabel = () => {
    if (availableStatusOptions.length === 0) return "No Actions";
    const nextStatus = availableStatusOptions[0];
    switch (nextStatus) {
      case OrderStatus.PREPARING:
        return "Start Preparing";
      case OrderStatus.READY:
        return "Mark Ready";
      case OrderStatus.COMPLETED:
        return "Complete Order";
      case OrderStatus.DELIVERED:
        return "Mark Delivered";
      case OrderStatus.CANCELLED:
        return "Cancel Order";
      default:
        return "Update";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="flex-shrink-0 border-b pb-4">
          <SheetTitle className="flex items-center justify-between">
            <span>Order #{order.id}</span>
            <Badge
              variant="secondary"
              className={`${statusColors[order.status]} flex items-center gap-1 border font-medium`}
            >
              {statusIcons[order.status]}
              {order.status.toUpperCase()}
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
                <label className="text-muted-foreground text-sm font-medium">
                  Name
                </label>
                <p className="text-base font-medium">{getCustomerName()}</p>
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm font-medium">
                  Phone
                </label>
                <p className="text-base">{getCustomerPhone()}</p>
              </div>
              {order.address && (
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Address
                  </label>
                  <p className="text-base">{order.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <div className="bg-primary h-5 w-1 rounded-full" />
              Order Details
            </h3>
            <div className="bg-muted/30 grid grid-cols-2 gap-4 rounded-lg border p-4">
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm font-medium">
                  Order Type
                </label>
                <Badge variant="secondary" className="w-fit">
                  {getOrderType().toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm font-medium">
                  Total Amount
                </label>
                <p className="text-base font-medium">${getTotalPrice()}</p>
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm font-medium">
                  Items Count
                </label>
                <p className="text-base">{getItemsCount()} items</p>
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm font-medium">
                  Created
                </label>
                <p className="text-sm">{getCreatedAt()}</p>
              </div>

              {/* Current Assignments */}
              <div className="col-span-2 space-y-2 border-t pt-3">
                <label className="text-muted-foreground text-sm font-medium">
                  Current Assignments
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {/* Waiter Assignment */}
                  <div className="bg-background flex items-center justify-between rounded border p-2">
                    <div className="flex items-center gap-2">
                      <User className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Waiter</p>
                        <p className="text-muted-foreground text-xs">
                          {assignedWaiter
                            ? `${assignedWaiter.full_name || `${assignedWaiter.first_name} ${assignedWaiter.last_name}`}`
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
                  {isDineInOrder && (
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

          {/* Staff Assignment Section */}
          <div className="space-y-4">
            <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <div className="bg-primary h-5 w-1 rounded-full" />
              Staff Assignment
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
                    {assignedWaiter.full_name ||
                      `${assignedWaiter.first_name} ${assignedWaiter.last_name}`}
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
                        {staff.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No waiters available
                          </SelectItem>
                        ) : (
                          staff.map((waiter) => (
                            <SelectItem key={waiter.id} value={waiter.id}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <div>
                                  <span>
                                    {waiter.full_name ||
                                      `${waiter.first_name} ${waiter.last_name}`}
                                  </span>
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
                      disabled={!selectedWaiter || staff.length === 0}
                      className="whitespace-nowrap"
                    >
                      {assignedWaiter ? "Change" : "Assign"}
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {staff.length} waiters available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Table Assignment for Dine-in Orders */}
          {isDineInOrder && (
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
                      {assignedTable.status || "Available"}
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
                          {tables.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No available tables
                            </SelectItem>
                          ) : (
                            tables.map((table) => (
                              <SelectItem key={table.id} value={table.id}>
                                <div className="flex items-center gap-2">
                                  <TableIcon className="h-4 w-4" />
                                  <div>
                                    <span>Table {table.table_number}</span>
                                    <p className="text-muted-foreground text-xs">
                                      {table.max_party_size} seats •{" "}
                                      {table.status || "Available"}
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
                        disabled={!selectedTable || tables.length === 0}
                        className="whitespace-nowrap"
                      >
                        {assignedTable ? "Change" : "Assign"}
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {tables.length} tables available
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
                    className={`rounded-full p-2 ${statusColors[order.status]}`}
                  >
                    {statusIcons[order.status]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current Status</p>
                    <p className="text-muted-foreground text-xs">
                      {statusDescriptions[order.status]}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`${statusColors[order.status]} border font-medium`}
                >
                  {order.status.toUpperCase()}
                </Badge>
              </div>

              {/* Status Update Section */}
              {isEditable && availableStatusOptions.length > 0 && (
                <div className="border-t pt-3">
                  <Label
                    htmlFor="status-select"
                    className="mb-2 block text-sm font-medium"
                  >
                    Update Status
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedStatus}
                      onValueChange={(value: OrderStatus) =>
                        handleStatusChange(value)
                      }
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
                              <span>{status.toUpperCase()}</span>
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
                      .map((s) => s.toUpperCase())
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
                <label className="text-muted-foreground text-sm font-medium">
                  Delay Reason
                </label>
                <p className="text-muted-foreground mt-1 text-sm">
                  {order.delay_reason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Fixed actions at the bottom */}
        {isEditable && (
          <div className="flex flex-shrink-0 gap-2 border-t pt-4">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleCancel}
            >
              Cancel Order
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
