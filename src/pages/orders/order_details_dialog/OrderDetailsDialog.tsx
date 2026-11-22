import { isConfirmedForKitchen, needsWaiterConfirmation } from "@/utils/orderHelpers";
import { orderStatusClass } from "@/utils/orderStatus";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, CheckCircle, Clock, ChefHat, Package, Truck, Utensils, Check } from "lucide-react";

import { Order, OrderStatus } from "../types/order";
import { Staff } from "@/api-services/staffService";
import { Table } from "@/api-services/tableService";
import { useAuth } from "@/contexts/AuthContext";

import {
  OrderCustomerInfo,
  OrderItemsList,
  OrderSummaryCard,
  OrderAssignments,
  OrderStatusFooter,
  OrderItem,
} from "./snippets";

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: number, status: OrderStatus) => Promise<void>;
  onAssignTable: (orderId: number, tableId: string) => void;
  onAssignWaiter: (orderId: number, waiterId: string) => void;
  onWaiterConfirm?: (orderId: number) => Promise<void>;
  isConfirming?: boolean;
  staff: Staff[];
  tables: Table[];
}


const statusIcons: Record<OrderStatus, React.ReactNode> = {
  paid: <CheckCircle className="h-3.5 w-3.5" />,
  received: <Package className="h-3.5 w-3.5" />,
  preparing: <ChefHat className="h-3.5 w-3.5" />,
  ready: <Clock className="h-3.5 w-3.5" />,
  served: <Utensils className="h-3.5 w-3.5" />,
  completed: <CheckCircle className="h-3.5 w-3.5" />,
  cancelled: <Clock className="h-3.5 w-3.5" />,
  delivered: <Truck className="h-3.5 w-3.5" />,
};

export const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange,
  onAssignTable,
  onAssignWaiter,
  onWaiterConfirm,
  isConfirming = false,
  staff,
  tables,
}) => {
  const { isWaiter, isOwner, isKitchen } = useAuth();
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedWaiter, setSelectedWaiter] = useState<string>("");

  useEffect(() => {
    if (order) {
      if (order.waiter) setSelectedWaiter(order.waiter);
      if (order.table) setSelectedTable(order.table);
    }
  }, [order]);

  if (!order) return null;

  const safeItems: OrderItem[] = Array.isArray(order.items)
    ? order.items.filter((item) => item !== null && typeof item === "object")
    : [];

  const waiters = staff.filter((s) => s.role === "waiter" && s.is_active);
  const availableTables = tables.filter((t) => t.is_available);

  const isDeliveryTakeaway = order.order_type === "delivery" || order.order_type === "takeaway";
  const isDineIn = order.order_type === "dine-in";
  const isEditable = order.status !== "completed" && order.status !== "cancelled";

  const getAvailableStatusOptions = (): OrderStatus[] => {
    const currentStatus = order.status as OrderStatus;

    switch (currentStatus) {
      case "paid":
      case "received":
        // A waiter must confirm the order before preparation begins.
        if (isKitchen || isOwner)
          return order.waiter_confirmed
            ? ["preparing", "cancelled"]
            : ["cancelled"];
        if (isWaiter) return ["cancelled"];
        return [];

      case "preparing":
        if (isKitchen || isOwner) return ["ready", "cancelled"];
        if (isWaiter) return ["cancelled"];
        return [];

      case "ready": {
        const readyOpts: OrderStatus[] = ["cancelled"];
        if (isWaiter || isOwner) {
          readyOpts.push(isDeliveryTakeaway ? "delivered" : "served");
        }
        return readyOpts;
      }

      case "served":
      case "delivered":
        return isWaiter || isOwner ? ["completed", "cancelled"] : [];

      default:
        return [];
    }
  };

  const availableStatusOptions = getAvailableStatusOptions();
  const assignedWaiter = staff.find((s) => s.id === order.waiter);
  const assignedTable = tables.find((t) => t.id === order.table);

  // Waiter confirmation is distinct from status: a `paid` or `received` order
  // can be unconfirmed or confirmed (see utils/orderHelpers).
  const needsConfirmation = needsWaiterConfirmation(order);
  const isConfirmed = isConfirmedForKitchen(order);

  const handleWaiterConfirmClick = async () => {
    if (!onWaiterConfirm || isConfirming) return;
    await onWaiterConfirm(order.id);
    toast.success("Order confirmed", {
      icon: <Check className="h-4 w-4 text-success" />,
    });
  };

  const handleStatusTransition = async (newStatus: OrderStatus) => {
    await onStatusChange(order.id, newStatus);
    toast.success(`Status updated to ${newStatus.toUpperCase()}`, {
      icon: <Bell className="h-4 w-4 text-brand" />,
    });
  };

  const handleAssignTableClick = () => {
    if (selectedTable) {
      onAssignTable(order.id, selectedTable);
      toast.success("Table assigned successfully");
    }
  };

  const handleAssignWaiterClick = () => {
    if (selectedWaiter) {
      onAssignWaiter(order.id, selectedWaiter);
      toast.success("Waiter assigned successfully");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => !open && onClose()}
    >
      <DialogContent className="max-w-[640px]">
        <div className="space-y-5 font-sans text-ink">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-line-subtle">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight">Order #{order.id}</h3>
            {isKitchen && <Badge className="bg-warning-soft text-warning border-warning-line">Kitchen</Badge>}
            {isWaiter && <Badge className="bg-inset-accent text-brand border-brand-accent">Waiter</Badge>}
            {isOwner && <Badge className="bg-success-soft text-success border-success-line">Owner</Badge>}
          </div>
          <Badge
            variant="outline"
            className={`${orderStatusClass(order.status)} flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold capitalize`}
          >
            {statusIcons[order.status as OrderStatus]}
            {order.status}
          </Badge>
        </div>

        {/* Scrollable Content Body */}
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {(needsConfirmation || isConfirmed) && (
            <div
              className={`flex items-center justify-between gap-3 rounded-3xl border p-3 text-sm ${
                isConfirmed
                  ? "border-success-line bg-success-soft"
                  : "border-warning-line bg-warning-soft"
              }`}
            >
              <div className="flex items-center gap-2">
                {isConfirmed ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <Clock className="h-4 w-4 text-warning-strong" />
                )}
                <div>
                  <div
                    className={`font-semibold ${
                      isConfirmed ? "text-success" : "text-warning"
                    }`}
                  >
                    {isConfirmed ? "Confirmed by waiter" : "Awaiting waiter confirmation"}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {isConfirmed
                      ? order.waiter_name
                        ? `Confirmed • ${order.waiter_name}`
                        : "Confirmed • status stays received until kitchen updates it"
                      : "Confirm to acknowledge this received order"}
                  </div>
                </div>
              </div>
              {needsConfirmation && (isWaiter || isOwner) && onWaiterConfirm && (
                <button
                  onClick={handleWaiterConfirmClick}
                  disabled={isConfirming}
                  className="flex h-9 items-center gap-1.5 rounded-2xl bg-success-strong px-4 text-xs font-semibold text-white hover:bg-success disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  {isConfirming ? "Confirming…" : "Confirm Order"}
                </button>
              )}
            </div>
          )}

          <OrderCustomerInfo order={order} />
          
          <OrderItemsList items={safeItems} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OrderSummaryCard order={order} itemsCount={safeItems.length} />
            <OrderAssignments
              isDineIn={isDineIn}
              isEditable={isEditable}
              canAssignWaiter={isKitchen || isOwner}
              canAssignTable={isOwner}
              assignedWaiter={assignedWaiter}
              assignedTable={assignedTable}
              waiterName={order.waiter_name ?? undefined}
              tableNumber={order.table ? order.table_number ?? undefined : undefined}
              waiters={waiters}
              availableTables={availableTables}
              selectedWaiter={selectedWaiter}
              setSelectedWaiter={setSelectedWaiter}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
              onAssignWaiter={handleAssignWaiterClick}
              onAssignTable={handleAssignTableClick}
            />
          </div>
        </div>
        </div>
        <DialogFooter>
          <OrderStatusFooter
            currentStatus={order.status as OrderStatus}
            availableOptions={availableStatusOptions}
            isEditable={isEditable}
            onStatusChange={handleStatusTransition}
            onClose={onClose}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};