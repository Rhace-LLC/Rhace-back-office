import type { OrderStatus } from "@/pages/orders/types/order";

/**
 * Single source of truth for order-status chip colours (design tokens only).
 * Used by the orders table, the order details dialog and the role dashboards.
 *
 *   paid / ready  → success      received  → brand (info)
 *   preparing     → warning      served / delivered → neutral-strong
 *   completed     → neutral      cancelled → danger
 */
export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  paid: "bg-success-soft text-success border-success-line",
  received: "bg-inset-accent text-brand border-brand-accent",
  preparing: "bg-warning-soft text-warning border-warning-line",
  ready: "bg-success-soft text-success border-success-line",
  served: "bg-inset text-ink border-line-strong",
  delivered: "bg-inset text-ink border-line-strong",
  completed: "bg-inset text-ink-muted border-line",
  cancelled: "bg-danger-soft text-danger border-danger-line",
};

export const orderStatusClass = (status: string) =>
  ORDER_STATUS_STYLES[status as OrderStatus] ??
  "bg-inset text-ink-secondary border-line";
