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
    <div className="rounded-[20px] border border-line bg-inset p-4 space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
        Order Summary
      </h4>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-ink-muted block">Type</span>
          <span className="font-semibold text-ink uppercase">{order.order_type || "N/A"}</span>
        </div>
        <div>
          <span className="text-ink-muted block">Created</span>
          <span className="font-medium text-ink">{formattedDate}</span>
        </div>
        <div>
          <span className="text-ink-muted block">Total Items</span>
          <span className="font-medium text-ink">{itemsCount} items</span>
        </div>
        <div>
          <span className="text-ink-muted block">Total Amount</span>
          <span className="text-sm font-bold text-brand">
            {order?.total_price ? formatPrice(order.total_price) : formatPrice(0)}
          </span>
        </div>
      </div>
      {order.delay_reason && (
        <div className="mt-2 rounded-2xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-800">
          <span className="font-semibold block">Delay Reason:</span>
          {order.delay_reason}
        </div>
      )}
    </div>
  );
};