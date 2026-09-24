import React from "react";
import { Clock, Utensils, AlertTriangle } from "lucide-react";
import formatPrice from "@/utils/formatPrice";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  display_ingredients?: string[];
  allergens?: string[];
  image_url?: string | null;
  prep_time?: string;
}

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

export type { OrderItem };

interface OrderItemsListProps {
  items: OrderItem[];
}

export const OrderItemsList: React.FC<OrderItemsListProps> = ({ items }) => {
  const hasFullMenuItem = (item: OrderItem): item is OrderItemWithMenuItem => {
    return "menu_item" in item && item.menu_item !== null;
  };

  const hasSimpleItem = (item: OrderItem): item is OrderItemSimple => {
    return "menu_item_name" in item;
  };

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#D9E0EA] bg-[#F8FAFD] p-6 text-center text-sm text-[#6B7280]">
        No items in this order
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
        Items ({items.length})
      </h4>
      <div className="space-y-2">
        {items.map((item, index) => {
          if (hasSimpleItem(item)) {
            const subtotal = Number(item.price || "0") * item.quantity;
            return (
              <div
                key={item.id || index}
                className="flex items-center justify-between rounded-xl border border-[#D9E0EA] bg-[#FFFFFF] p-3 shadow-xs"
              >
                <div>
                  <p className="font-medium text-[#0B0D10]">{item.menu_item_name || "Unknown Item"}</p>
                  <p className="text-xs text-[#6B7280]">
                    Qty: {item.quantity} × {formatPrice(item.price || "0")}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#0B0D10]">{formatPrice(subtotal)}</p>
              </div>
            );
          }

          if (hasFullMenuItem(item)) {
            const menuItem = item.menu_item;
            const subtotal = Number(item.price || "0") * item.quantity;

            return (
              <div
                key={item.id || index}
                className="rounded-xl border border-[#D9E0EA] bg-[#FFFFFF] p-3.5 shadow-xs space-y-2.5"
              >
                <div className="flex gap-3 items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-[#0B0D10] text-sm">{menuItem?.name || "Unknown Item"}</h5>
                      <span className="font-semibold text-sm text-[#0B0D10]">{formatPrice(subtotal)}</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Quantity: {item.quantity} × {formatPrice(item.price || "0")}
                    </p>
                    {menuItem?.description && (
                      <p className="text-xs text-[#30343B] mt-1 line-clamp-2">{menuItem.description}</p>
                    )}
                  </div>
                  {menuItem?.image_url && (
                    <img
                      src={menuItem.image_url}
                      alt={menuItem.name}
                      className="h-14 w-14 rounded-lg object-cover border border-[#E8EDF3] shrink-0"
                    />
                  )}
                </div>

                {menuItem?.display_ingredients && menuItem.display_ingredients.length > 0 && (
                  <div className="flex items-start gap-1.5 text-xs text-[#30343B] pt-1">
                    <Utensils className="h-3.5 w-3.5 text-[#146BE8] mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {menuItem.display_ingredients.map((ing, i) => (
                        <span key={i} className="inline-block rounded-md bg-[#F8FAFD] px-2 py-0.5 text-[11px] border border-[#E8EDF3]">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {menuItem?.allergens && menuItem.allergens.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-[#B91C1C]">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[11px] font-medium">Allergens: {menuItem.allergens.join(", ")}</span>
                  </div>
                )}

                {menuItem?.prep_time && (
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7280] pt-1 border-t border-[#E8EDF3]">
                    <Clock className="h-3 w-3 text-[#9CA3AF]" />
                    <span>Prep time: {menuItem.prep_time}</span>
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};