import type { Order } from "@/pages/orders/types/order";

// Shared order helpers (orders page, order dialog, role dashboards).

/**
 * Statuses in which a waiter can still confirm an order. Orders reach the
 * back office as `paid` (e.g. paid at the table via QR) or `received`; the
 * waiter confirms them before the kitchen starts preparing.
 */
export const CONFIRMABLE_STATUSES: readonly string[] = ["paid", "received"];

/** Is the order still at the stage where waiter confirmation applies? */
export const isAwaitingPreparation = (o: Pick<Order, "status">) =>
  CONFIRMABLE_STATUSES.includes(o.status);

/** Order the waiter hasn't confirmed yet. `waiter_confirmed` may be
 * undefined on older payloads — treat that as unconfirmed. */
export const needsWaiterConfirmation = (o: Order) =>
  isAwaitingPreparation(o) && !o.waiter_confirmed;

/** Order the waiter has confirmed — ready for the kitchen to start. */
export const isConfirmedForKitchen = (o: Order) =>
  isAwaitingPreparation(o) && !!o.waiter_confirmed;

export { parseErrorOr as getErrorMessage } from "@/api-services/utils/parseError";

export const formatOrderType = (type?: string) => {
  switch (type) {
    case "dine-in":
      return "Dine In";
    case "takeaway":
      return "Takeaway";
    case "delivery":
      return "Delivery";
    default:
      return type || "Order";
  }
};

export const formatTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/** "4m", "1h 12m" since the given ISO timestamp. */
export const formatElapsed = (iso?: string, now = Date.now()) => {
  if (!iso) return "—";
  const start = new Date(iso).getTime();
  if (isNaN(start)) return "—";
  const mins = Math.max(0, Math.floor((now - start) / 60000));
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

export const shortOrderId = (id: string | number) => `#${String(id).slice(-8)}`;
