import React from "react";
import formatPrice from "@/utils/formatPrice";
import { Order } from "../../types/order";

interface OrderSummaryCardProps {
  order: Order;
  itemsCount: number;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ order, itemsCount }) => {
  const formattedDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <div className="rounded-xl border border-[#D9E0EA] bg-[#F8FAFD] p-4 space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
        Order Summary
      </h4>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[#6B7280] block">Type</span>
          <span className="font-semibold text-[#0B0D10] uppercase">{order.order_type || "N/A"}</span>
        </div>
        <div>
          <span className="text-[#6B7280] block">Created</span>
          <span className="font-medium text-[#0B0D10]">{formattedDate}</span>
        </div>
        <div>
          <span className="text-[#6B7280] block">Total Items</span>
          <span className="font-medium text-[#0B0D10]">{itemsCount} items</span>
        </div>
        <div>
          <span className="text-[#6B7280] block">Total Amount</span>
          <span className="text-sm font-bold text-[#146BE8]">
            {order?.total_price ? formatPrice(order.total_price) : formatPrice(0)}
          </span>
        </div>
      </div>
      {order.delay_reason && (
        <div className="mt-2 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] p-2.5 text-xs text-[#991B1B]">
          <span className="font-semibold block">Delay Reason:</span>
          {order.delay_reason}
        </div>
      )}
    </div>
  );
};