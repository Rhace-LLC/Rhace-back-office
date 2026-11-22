/** One line of an order. NOTE: `price` is the LINE TOTAL (unit price ×
 * quantity), not the unit price — e.g. qty 2, price "800.00" on an ₦800 order. */
export interface OrderLineItem {
  id: number;
  menu_item_name: string;
  menu_item_id: string;
  quantity: number;
  price: string;
}

/** Shape returned by GET /orders/ (back-office API). */
export interface Order {
  id: number;
  customer: string; // UUID
  customer_name: string;
  customer_name_display?: string;
  customer_phone: string;
  restaurant_name?: string;
  paid_by?: string | null;
  paid_by_name?: string | null;
  group?: string | null;
  order_type: "dine-in" | "delivery" | "takeaway";
  table: string | null; // UUID
  table_number?: string | null;
  items: OrderLineItem[];
  total_price: string;
  status: OrderStatus;
  waiter: string | null; // UUID
  waiter_name?: string | null;
  waiter_confirmed?: boolean;
  address: string;
  driver: string | null; // UUID
  driver_name?: string | null;
  delay_reason: string | null;
  created_at: string;
  payment?: string;
  payment_reference?: string | null;
  estimated_wait_minutes?: number | null;
  ready_at?: string | null;
  paid_at?: string | null;
  is_paid?: boolean;
}

export type OrderStatus =
  | "paid"
  | "received"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled"
  | "delivered";

export interface CreateOrderData {
  customer: string;
  order_type: "dine-in" | "delivery" | "takeaway";
  table?: string;
  items: number[];
  total_price: string;
  status: OrderStatus;
  waiter?: string;
  customer_name: string;
  address?: string;
  customer_phone: string;
  driver?: string;
  delay_reason?: string;
}

export interface UpdateOrderData {
  customer?: string;
  order_type?: "dine-in" | "delivery" | "takeaway";
  table?: string;
  items?: number[];
  total_price?: string;
  status?: OrderStatus;
  waiter?: string;
  customer_name?: string;
  address?: string;
  customer_phone?: string;
  driver?: string;
  delay_reason?: string;
}

export interface AssignTableData {
  table_id: string;
  order_id: string;
}

export interface AssignWaiterData {
  order_id: string;
  waiter_id: string;
}

export interface AssignDriverData {
  order_id: string;
  driver_id: string;
}

export interface BulkStatusUpdateData {
  order_ids: number[];
  status: OrderStatus;
}
