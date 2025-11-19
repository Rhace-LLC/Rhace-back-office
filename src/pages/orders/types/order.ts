export interface Order {
  id: string;
  customer: string; // UUID
  order_type: "dine-in" | "delivery" | "takeaway";
  table: string; // UUID
  items: number[];
  total_price: string;
  status: OrderStatus;
  waiter: string; // UUID
  customer_name: string;
  address: string;
  customer_phone: string;
  driver: string; // UUID
  delay_reason: string;
  restaurant: {
    id: string;
    name: string;
    slug: string;
    owner: string;
    owner_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    description: string;
    logo: string;
    cuisine_type: string;
    subscription_plan: string;
    is_active: boolean;
    trial_ends_at: string;
    subscription_ends_at: string;
    access_url: string;
    access_token_url: string;
    is_subscription_active: string;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
}

export enum OrderStatus {
  RECEIVED = "received",
  PREPARING = "preparing",
  READY = "ready",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  DELIVERED = "delivered"
}

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