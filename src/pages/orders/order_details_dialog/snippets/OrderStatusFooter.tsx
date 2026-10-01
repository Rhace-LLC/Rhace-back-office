import React from "react";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "../../types/order";
import { ArrowRight, XCircle } from "lucide-react";

interface OrderStatusFooterProps {
  currentStatus: OrderStatus;
  availableOptions: OrderStatus[];
  isEditable: boolean;
  onStatusChange: (status: OrderStatus) => void;
  onClose: () => void;
}

const actionLabels: Record<string, string> = {
  preparing: "Start Preparing",
  ready: "Mark as Ready",
  served: "Mark as Served",
  delivered: "Mark as Delivered",
  completed: "Complete Order",
};

export const OrderStatusFooter: React.FC<OrderStatusFooterProps> = ({
  availableOptions,
  isEditable,
  onStatusChange,
  onClose,
}) => {
  const primaryNextStatus = availableOptions.find((s) => s !== "cancelled");
  const canCancel = availableOptions.includes("cancelled");

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2 pt-2 border-t border-line-subtle">
      {canCancel && isEditable ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStatusChange("cancelled")}
          className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 h-10 px-4 rounded-2xl text-xs font-medium"
        >
          <XCircle className="mr-1.5 h-4 w-4" />
          Cancel Order
        </Button>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="bg-inset hover:bg-inset-accent text-ink-secondary h-10 px-4 rounded-2xl text-xs font-medium"
        >
          Close
        </Button>

        {primaryNextStatus && isEditable && (
          <Button
            size="sm"
            onClick={() => onStatusChange(primaryNextStatus)}
            className="bg-primary hover:bg-brand-hover text-white h-10 px-5 rounded-2xl text-xs font-semibold shadow-button"
          >
            <span>{actionLabels[primaryNextStatus] || `Move to ${primaryNextStatus}`}</span>
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};