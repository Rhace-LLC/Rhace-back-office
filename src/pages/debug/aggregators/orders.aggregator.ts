import {
  cancelOrder,
  cancelReservation,
  createOrder,
  createReservation,
  deleteReservation,
  getOrderQueue,
  getOrders,
  getReservation,
  getReservations,
  getWaitTime,
  patchReservation,
  updateReservation,
  updateReservationDetails,
} from "@/api-services/order.service";
import { getAllOrders } from "@/api-services/orderService";
import {
  createApiProbe,
  extractCreatedId,
  extractFirstId,
  requireTestId,
  testName,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

// Skipped on purpose: assignTable/updateOrderStatus/bulkUpdateStatus and
// assignTableToReservation/assignWaiter mutate real orders; confirmDelivery,
// bulkConfirmDelivery and sendDeliveryEmail need confirmation tokens or send
// real emails. Deletes/cancels only ever target the [API-TEST] records this
// card creates.

export const ordersAggregator: ServiceAggregatorDefinition = {
  id: "orders",
  name: "Orders & Reservations",
  serviceFile: "order.service.ts",
  description:
    "Order and reservation reads plus opt-in writes: creates an [API-TEST] reservation and order, touches them, then cancels them.",
  hasWriteProbes: true,
  getProbes: ({ token, restaurantId }) => {
    if (!token) return [];
    const ids: { reservationId?: string; orderId?: string } = {};
    const today = new Date().toISOString().slice(0, 10);

    const firstOrderId = async () => {
      const id = extractFirstId(await getOrders(token));
      if (!id) throw new Error("Skipped: no orders found");
      return id;
    };
    const firstReservationId = async () => {
      const id = extractFirstId(await getReservations(token));
      if (!id) throw new Error("Skipped: no reservations found");
      return id;
    };

    return [
      createApiProbe("orders-list", "Orders", "GET", "/orders/", () =>
        getOrders(token)
      ),
      createApiProbe(
        "orders-all",
        "All orders (alt client)",
        "GET",
        "/orders/",
        () => getAllOrders(token)
      ),
      createApiProbe(
        "orders-queue",
        "Order queue (first order)",
        "GET",
        "/orders/:id/queue/",
        async () => getOrderQueue(await firstOrderId(), token)
      ),
      createApiProbe(
        "orders-wait-time",
        "Order wait time (first order)",
        "GET",
        "/orders/orders/:id/wait-time/",
        async () => getWaitTime(await firstOrderId(), token)
      ),
      createApiProbe(
        "orders-reservations",
        "Reservations",
        "GET",
        "/orders/reservations/",
        () => getReservations(token)
      ),
      createApiProbe(
        "orders-reservation-detail",
        "Reservation detail (first)",
        "GET",
        "/orders/reservations/:id/",
        async () => getReservation(await firstReservationId(), token)
      ),
      createApiProbe(
        "orders-reservation-create",
        "Create reservation (test)",
        "POST",
        "/orders/reservations/create/",
        async () => {
          const created = await createReservation(
            {
              party_size: 1,
              date: today,
              time: "12:00:00",
              notes: testName("reservation"),
              ...(restaurantId ? { restaurant_id: restaurantId } : {}),
            },
            token
          );
          const id = extractCreatedId(created);
          if (!id) throw new Error("Create reservation returned no id");
          ids.reservationId = id;
          return created;
        },
        true
      ),
      createApiProbe(
        "orders-reservation-update",
        "Update test reservation",
        "PUT",
        "/orders/reservations/:id/",
        () =>
          updateReservation(
            requireTestId(ids.reservationId, "update test reservation"),
            { party_size: 2, notes: testName("reservation") },
            token
          ),
        true
      ),
      createApiProbe(
        "orders-reservation-patch",
        "Patch test reservation",
        "PATCH",
        "/orders/reservations/:id/",
        () =>
          patchReservation(
            requireTestId(ids.reservationId, "patch test reservation"),
            { party_size: 1 },
            token
          ),
        true
      ),
      createApiProbe(
        "orders-reservation-update-details",
        "Update test reservation details",
        "PATCH",
        "/orders/reservations/:id/update",
        () =>
          updateReservationDetails(
            requireTestId(ids.reservationId, "update test reservation"),
            { notes: testName("reservation") },
            "PATCH",
            token
          ),
        true
      ),
      createApiProbe(
        "orders-reservation-cancel",
        "Cancel test reservation (cleanup)",
        "PUT",
        "/orders/reservations/:id/cancel/",
        () =>
          cancelReservation(
            requireTestId(ids.reservationId, "cancel test reservation"),
            { reason: testName("cancel") },
            token
          ),
        true
      ),
      createApiProbe(
        "orders-reservation-delete",
        "Delete test reservation (cleanup)",
        "DELETE",
        "/orders/reservations/:id/",
        () =>
          deleteReservation(
            requireTestId(ids.reservationId, "delete test reservation"),
            token
          ),
        true
      ),
      createApiProbe(
        "orders-create",
        "Create order (test)",
        "POST",
        "/orders/create/",
        async () => {
          const created = await createOrder(
            {
              items: [],
              order_type: "dine-in",
              notes: testName("order"),
              ...(restaurantId ? { restaurant_id: restaurantId } : {}),
            },
            token
          );
          const id = extractCreatedId(created);
          if (!id) throw new Error("Create order returned no id");
          ids.orderId = id;
          return created;
        },
        true
      ),
      createApiProbe(
        "orders-cancel",
        "Cancel test order (cleanup)",
        "POST",
        "/orders/:id/cancel/",
        () =>
          cancelOrder(
            requireTestId(ids.orderId, "cancel test order"),
            { reason: testName("cancel") },
            token
          ),
        true
      ),
    ];
  },
};
