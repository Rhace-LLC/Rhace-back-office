// api-services/orderService.ts
import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";
import { Order, UpdateOrderData } from "../pages/orders/types/order";

// ========== ORDER OPERATIONS ==========

// GET /orders/ - Get all orders
export interface GetOrdersParams {
  status?: string;
  waiter_confirmed?: boolean;
}

export const getAllOrders = async (
  token: string,
  params?: GetOrdersParams
): Promise<Order[]> => {
  const config = getConfig("/orders/", "GET", token, undefined, params);
  const response = await bookiesAxiosInstance(config);

  let ordersData = response.data;

  // If response.data is not an array but response itself might be
  if (!Array.isArray(ordersData) && Array.isArray(response)) {
    ordersData = response;
  }

  // If we still don't have an array, try to extract from nested properties
  if (!Array.isArray(ordersData)) {
    if (ordersData && Array.isArray(ordersData.results)) {
      ordersData = ordersData.results;
    } else if (ordersData && Array.isArray(ordersData.data)) {
      ordersData = ordersData.data;
    } else if (ordersData && Array.isArray(ordersData.orders)) {
      ordersData = ordersData.orders;
    }
  }

  if (Array.isArray(ordersData)) {
    return ordersData;
  }

  return [];
};

export const updateOrderStatus = async (
  orderId: string,
  data: UpdateOrderData,
  token: string
): Promise<Order> => {
  const config = getConfig(
    `/orders/${orderId}/update-status/`,
    "POST",
    token,
    data
  );
  const response = await bookiesAxiosInstance(config);
  return response.data;
};

// POST /orders/{order_id}/cancel/ - Cancel order
export const cancelOrder = async (
  orderId: string,
  data: UpdateOrderData,
  token: string
): Promise<Order> => {
  const config = getConfig(`/orders/${orderId}/cancel/`, "POST", token, data);
  const response = await bookiesAxiosInstance(config);
  return response.data;
};

// POST /orders/{order_id}/assign-table/ - Assign table to order
export const assignTableToOrder = async (
  orderId: string,
  tableId: string,
  token: string
) => {
  const config = getConfig(`/orders/${orderId}/assign-table/`, "POST", token, {
    table_id: tableId,
    order_id: orderId,
  });
  const response = await bookiesAxiosInstance(config);
  return response.data;
};

// POST /orders/{order_id}/waiter-confirm/ - Waiter confirms a received order.
// No request body. Backend auto-assigns the waiter if unassigned and keeps
// status as `received`. See ORDER_FLOW_FRONTEND.md.
export const waiterConfirmOrder = async (
  orderId: string,
  token: string
): Promise<Order> => {
  const config = getConfig(
    `/orders/${orderId}/waiter-confirm`,
    "POST",
    token
  );
  const response = await bookiesAxiosInstance(config);
  return response.data;
};

// POST /orders/assign-waiter/ - Assign waiter to order
export const assignWaiterToOrder = async (
  orderId: string,
  waiterId: string,
  token: string
) => {
  const config = getConfig("/orders/assign-waiter/", "POST", token, {
    order_id: orderId,
    waiter_id: waiterId,
  });
  const response = await bookiesAxiosInstance(config);
  return response.data;
};
