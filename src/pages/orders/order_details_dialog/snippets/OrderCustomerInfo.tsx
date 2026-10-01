import React from "react";
import { User, Phone, MapPin } from "lucide-react";
import { Order } from "../../types/order";

interface OrderCustomerInfoProps {
  order: Order;
}

export const OrderCustomerInfo: React.FC<OrderCustomerInfoProps> = ({ order }) => {
  const customerName = order.customer_name || "N/A";
  const customerPhone = order.customer_phone || "N/A";

  return (
    <div className="rounded-[20px] border border-line bg-inset p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
        Customer Details
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-ink">
          <User className="h-4 w-4 text-brand" />
          <span className="font-medium">{customerName}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-secondary">
          <Phone className="h-4 w-4 text-ink-muted" />
          <span>{customerPhone}</span>
        </div>
        {order.address && (
          <div className="col-span-1 sm:col-span-2 flex items-start gap-2 text-ink-secondary">
            <MapPin className="h-4 w-4 text-ink-muted shrink-0 mt-0.5" />
            <span className="line-clamp-2">{order.address}</span>
          </div>
        )}
      </div>
    </div>
  );
};