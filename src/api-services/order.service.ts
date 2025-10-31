// orders.service.ts

import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";

// -------------------- Orders --------------------

// GET /orders/
const getOrders = async (token?: string, params?: any) => {
  const config = getConfig("/orders/", "GET", token, undefined, params);
  return bookiesAxiosInstance(config);
};

// POST /orders/{order_id}/assign-table/
const assignTable = async (order_id: string, data: any, token?: string) => {
  const config = getConfig(`/orders/${order_id}/assign-table/`, "POST", token, data);
  return bookiesAxiosInstance(config);
};

// POST /orders/{order_id}/cancel/
const cancelOrder = async (order_id: string, data?: any, token?: string) => {
  const config = getConfig(`/orders/${order_id}/cancel/`, "POST", token, data);
  return bookiesAxiosInstance(config);
};

// GET /orders/{order_id}/queue/
const getOrderQueue = async (order_id: string, token?: string) => {
  const config = getConfig(`/orders/${order_id}/queue/`, "GET", token);
  return bookiesAxiosInstance(config);
};

// POST /orders/{order_id}/update-status/
const updateOrderStatus = async (order_id: string, data: any, token?: string) => {
  const config = getConfig(`/orders/${order_id}/update-status/`, "POST", token, data);
  return bookiesAxiosInstance(config);
};

// POST /orders/bulk-status-update/
const bulkUpdateStatus = async (data: any, token?: string) => {
  const config = getConfig("/orders/bulk-status-update/", "POST", token, data);
  return bookiesAxiosInstance(config);
};

// POST /orders/create/
const createOrder = async (data: any, token?: string) => {
  const config = getConfig("/orders/create/", "POST", token, data);
  return bookiesAxiosInstance(config);
};

// GET /orders/order/{order_id}/confirm-delivery/token={confirmation_token}
const getConfirmDelivery = async (
  order_id: string,
  confirmation_token: string,
  token?: string
) => {
  const config = getConfig(
    `/orders/order/${order_id}/confirm-delivery/token=${confirmation_token}`,
    "GET",
    token
  );
  return bookiesAxiosInstance(config);
};

// POST /orders/order/{order_id}/confirm-delivery/token={confirmation_token}
const confirmDelivery = async (
  order_id: string,
  confirmation_token: string,
  data?: any,
  token?: string
) => {
  const config = getConfig(
    `/orders/order/${order_id}/confirm-delivery/token=${confirmation_token}`,
    "POST",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

// GET /orders/orders/{order_id}/wait-time/
const getWaitTime = async (order_id: string, token?: string) => {
  const config = getConfig(`/orders/orders/${order_id}/wait-time/`, "GET", token);
  return bookiesAxiosInstance(config);
};

// POST /orders/orders/bulk-confirm-delivery/
const bulkConfirmDelivery = async (data: any, token?: string) => {
  const config = getConfig("/orders/orders/bulk-confirm-delivery/", "POST", token, data);
  return bookiesAxiosInstance(config);
};

// POST /orders/orders/send-delivery-email/
const sendDeliveryEmail = async (data: any, token?: string) => {
  const config = getConfig("/orders/orders/send-delivery-email/", "POST", token, data);
  return bookiesAxiosInstance(config);
};

// -------------------- Reservations --------------------

// GET /orders/reservations/
const getReservations = async (token?: string, params?: any): Promise<any> => {
  const config = getConfig("/orders/reservations/", "GET", token, undefined, params);
  return bookiesAxiosInstance(config);
};

// GET /orders/reservations/{id}/
const getReservation = async (id: string, token?: string) => {
  const config = getConfig(`/orders/reservations/${id}/`, "GET", token);
  return bookiesAxiosInstance(config);
};

// POST /orders/reservations/create/
const createReservation = async (data: any, token?: string) => {
  const config = getConfig("/orders/reservations/create/", "POST", token, data);
  return bookiesAxiosInstance(config);
};

// PUT /orders/reservations/{id}/
const updateReservation = async (id: string, data: any, token?: string) => {
  const config = getConfig(`/orders/reservations/${id}/`, "PUT", token, data);
  return bookiesAxiosInstance(config);
};

// PATCH /orders/reservations/{id}/
const patchReservation = async (id: string, data: any, token?: string) => {
  const config = getConfig(`/orders/reservations/${id}/`, "PATCH", token, data);
  return bookiesAxiosInstance(config);
};

// DELETE /orders/reservations/{id}/
const deleteReservation = async (id: string, token?: string) => {
  const config = getConfig(`/orders/reservations/${id}/`, "DELETE", token);
  return bookiesAxiosInstance(config);
};

// PUT /orders/reservations/{id}/cancel/
const cancelReservation = async (id: string, data?: any, token?: string) => {
  const config = getConfig(`/orders/reservations/${id}/cancel/`, "PUT", token, data);
  return bookiesAxiosInstance(config);
};

// PUT /orders/reservations/{id}/status-update/
const updateReservationStatus = async (id: string, data: any, token?: string) => {
  const config = getConfig(`/orders/reservations/${id}/status-update/`, "PUT", token, data);
  return bookiesAxiosInstance(config);
};

// PUT / PATCH /orders/reservations/{id}/update
const updateReservationDetails = async (
  id: string,
  data: any,
  method: "PUT" | "PATCH" = "PUT",
  token?: string
) => {
  const config = getConfig(`/orders/reservations/${id}/update`, method, token, data);
  return bookiesAxiosInstance(config);
};

// -------------------- Export All --------------------
export {
  getOrders,
  assignTable,
  cancelOrder,
  getOrderQueue,
  updateOrderStatus,
  bulkUpdateStatus,
  createOrder,
  getConfirmDelivery,
  confirmDelivery,
  getWaitTime,
  bulkConfirmDelivery,
  sendDeliveryEmail,
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  patchReservation,
  deleteReservation,
  cancelReservation,
  updateReservationStatus,
  updateReservationDetails,
};
