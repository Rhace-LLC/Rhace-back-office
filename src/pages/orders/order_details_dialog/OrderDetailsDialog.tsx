import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, CheckCircle, Clock, ChefHat, Package, Truck, Utensils } from "lucide-react";

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
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
  onAssignTable: (orderId: string, tableId: string) => void;
  onAssignWaiter: (orderId: string, waiterId: string) => void;
  staff: Staff[];
  tables: Table[];
}

const statusBadgeStyles: Record<OrderStatus, string> = {
  paid: "bg-[#DCEEFF] text-[#146BE8] border-[#4DA3FF]",
  received: "bg-[#DCEEFF] text-[#146BE8] border-[#4DA3FF]",
  preparing: "bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]",
  ready: "bg-[#D1FAE5] text-[#059669] border-[#6EE7B7]",
  served: "bg-[#E0E7FF] text-[#4338CA] border-[#A5B4FC]",
  completed: "bg-[#F3F4F6] text-[#374151] border-[#D1D5DB]",
  cancelled: "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]",
  delivered: "bg-[#F3E8FF] text-[#7E22CE] border-[#D8B4FE]",
};

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

  // The shared Order type declares items as number[], but the API returns
  // item objects (same approach as the legacy sheet this replaces).
  const safeItems: OrderItem[] = Array.isArray(order.items)
    ? (order.items.filter(
        (item) => item !== null && typeof item === "object"
      ) as unknown as OrderItem[])
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
        if (isKitchen || isOwner) return ["preparing", "cancelled"];
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

  const handleStatusTransition = async (newStatus: OrderStatus) => {
    await onStatusChange(order.id, newStatus);
    toast.success(`Status updated to ${newStatus.toUpperCase()}`, {
      icon: <Bell className="h-4 w-4 text-[#146BE8]" />,
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
        <div className="space-y-5 font-[#Inter] text-[#0B0D10]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8EDF3]">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight">Order #{order.id}</h3>
            {isKitchen && <Badge className="bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]">Kitchen</Badge>}
            {isWaiter && <Badge className="bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]">Waiter</Badge>}
            {isOwner && <Badge className="bg-[#ECFDF5] text-[#047857] border-[#D1FAE5]">Owner</Badge>}
          </div>
          <Badge
            variant="outline"
            className={`${statusBadgeStyles[order.status as OrderStatus]} flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold capitalize`}
          >
            {statusIcons[order.status as OrderStatus]}
            {order.status}
          </Badge>
        </div>

        {/* Scrollable Content Body */}
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
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