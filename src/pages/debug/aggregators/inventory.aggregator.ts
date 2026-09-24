import {
  createInventoryItem,
  createInventoryTransaction,
  deleteInventoryItem,
  getInventoryItems,
  getInventoryTransactions,
  updateInventoryItem,
} from "@/api-services/inventory.service";
import {
  createApiProbe,
  extractCreatedId,
  requireTestId,
  testName,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

export const inventoryAggregator: ServiceAggregatorDefinition = {
  id: "inventory",
  name: "Inventory",
  serviceFile: "inventory.service.ts",
  description:
    "Inventory reads plus opt-in writes: creates an [API-TEST] item, adjusts it, then deletes it.",
  hasWriteProbes: true,
  getProbes: ({ token, restaurantId, userId }) => {
    if (!token) return [];
    const ids: { itemId?: string } = {};

    return [
      createApiProbe(
        "inventory-items",
        "Inventory items",
        "GET",
        "/inventory/items/",
        () => getInventoryItems(undefined, token)
      ),
      createApiProbe(
        "inventory-transactions",
        "Inventory transactions",
        "GET",
        "/inventory/transactions/",
        () => getInventoryTransactions(undefined, token)
      ),
      createApiProbe(
        "inventory-item-create",
        "Create item (test)",
        "POST",
        "/inventory/items/create/",
        async () => {
          if (!restaurantId) {
            throw new Error("Skipped: no restaurant assigned to this account");
          }
          const created = await createInventoryItem(
            {
              name: testName("ingredient"),
              is_allergen: false,
              unit: "pcs",
              threshold: 1,
              restaurant: restaurantId,
            },
            token
          );
          const id = extractCreatedId(created);
          if (!id) throw new Error("Create item returned no id");
          ids.itemId = id;
          return created;
        },
        true
      ),
      createApiProbe(
        "inventory-item-update",
        "Update test item",
        "PUT",
        "/inventory/items/:id/",
        () =>
          updateInventoryItem(
            requireTestId(ids.itemId, "update test item"),
            { threshold: 2 },
            token
          ),
        true
      ),
      createApiProbe(
        "inventory-transaction-create",
        "Create adjustment (test)",
        "POST",
        "/inventory/transactions/create/",
        () =>
          createInventoryTransaction(
            {
              item: Number(requireTestId(ids.itemId, "adjust test item")),
              transaction_type: "adjustment",
              reason: testName("probe adjustment"),
              quantity: 1,
              recorded_by: userId ?? "api-test-probe",
            },
            token
          ),
        true
      ),
      createApiProbe(
        "inventory-item-delete",
        "Delete test item (cleanup)",
        "DELETE",
        "/inventory/items/:id/delete/",
        () =>
          deleteInventoryItem(
            requireTestId(ids.itemId, "delete test item"),
            token
          ),
        true
      ),
    ];
  },
};
