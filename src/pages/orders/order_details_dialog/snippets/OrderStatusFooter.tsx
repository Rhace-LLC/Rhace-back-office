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
    <div className="flex w-full flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8EDF3]">
      {canCancel && isEditable ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStatusChange("cancelled")}
          className="border-[#FCA5A5] text-[#B91C1C] hover:bg-[#FEF2F2] hover:text-[#991B1B] h-10 px-4 rounded-[7px] text-xs font-medium"
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
          className="bg-[#E8EDF3] hover:bg-[#D9E0EA] text-[#30343B] h-10 px-4 rounded-[7px] text-xs font-medium"
        >
          Close
        </Button>

        {primaryNextStatus && isEditable && (
          <Button
            size="sm"
            onClick={() => onStatusChange(primaryNextStatus)}
            className="bg-[#146BE8] hover:bg-[#0F5FD4] text-white h-10 px-5 rounded-[7px] text-xs font-semibold shadow-xs"
          >
            <span>{actionLabels[primaryNextStatus] || `Move to ${primaryNextStatus}`}</span>
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};