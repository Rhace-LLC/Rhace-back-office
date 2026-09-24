import {
  createSeedCategory,
  createSeedInventoryItem,
  createSeedMenuItem,
  deleteSeedCategory,
  deleteSeedInventoryItem,
  deleteSeedMenuItem,
  getSeedCategory,
  getSeedInventoryItem,
  getSeedMenuItem,
  listSeedCategories,
  listSeedInventoryItems,
  listSeedMenuItems,
  patchSeedCategory,
  patchSeedInventoryItem,
  patchSeedMenuItem,
} from "@/api-services/seeds";
import {
  createApiProbe,
  extractCreatedId,
  extractFirstId,
  requireTestId,
  testName,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

// Reads (category + inventory lists and first-record details) run with one
// click. Writes create [API-TEST] records, touch them, then delete them in
// reverse order (item -> inventory item -> category).

export const seedsAggregator: ServiceAggregatorDefinition = {
  id: "seeds",
  name: "Seeds",
  serviceFile: "seeds/index.ts",
  description:
    "Seed category, inventory, and menu item reads plus opt-in writes: creates [API-TEST] records, touches them, then deletes all three.",
  hasWriteProbes: true,
  getProbes: ({ token }) => {
    if (!token) return [];
    const ids: {
      categoryId?: string;
      inventoryId?: string;
      itemId?: string;
      itemName?: string;
      ingredientId?: string;
    } = {};

    return [
      createApiProbe(
        "seeds-categories",
        "Seed categories",
        "GET",
        "/seeds/categories/",
        () => listSeedCategories(token)
      ),
      createApiProbe(
        "seeds-category-detail-first",
        "Seed category detail (first)",
        "GET",
        "/seeds/categories/:id/",
        async () => {
          const id = extractFirstId(await listSeedCategories(token));
          if (!id) throw new Error("Skipped: no seed categories found");
          return getSeedCategory(id, token);
        }
      ),
      createApiProbe(
        "seeds-inventory-items",
        "Seed inventory items",
        "GET",
        "/seeds/inventory-items/",
        () => listSeedInventoryItems(token)
      ),
      createApiProbe(
        "seeds-inventory-item-detail-first",
        "Seed inventory detail (first)",
        "GET",
        "/seeds/inventory-items/:id/",
        async () => {
          const id = extractFirstId(await listSeedInventoryItems(token));
          if (!id) throw new Error("Skipped: no seed inventory items found");
          return getSeedInventoryItem(id, token);
        }
      ),
      createApiProbe(
        "seeds-items",
        "Seed menu items",
        "GET",
        "/seeds/menu-items/",
        () => listSeedMenuItems(token)
      ),
      createApiProbe(
        "seeds-item-detail-first",
        "Seed menu item detail (first)",
        "GET",
        "/seeds/menu-items/:id/",
        async () => {
          const existing = extractFirstId(await listSeedMenuItems(token));
          if (existing) return getSeedMenuItem(existing, token);

          // Self-seeding: the menu list is empty outside write runs, so spin
          // up a throwaway category + item, read the item, then tear both
          // down. Flagged as a write since setup/teardown mutate data.
          const category = await createSeedCategory(
            {
              name: testName("seed category"),
              description: "Temporary probe seed. Safe to delete.",
            },
            token
          );
          const categoryId = extractCreatedId(category);
          if (!categoryId) throw new Error("Skipped: could not seed a category");
          try {
            const ingredientId = extractFirstId(
              await listSeedInventoryItems(token)
            );
            if (!ingredientId) {
              throw new Error(
                "Skipped: no seed inventory items available for ingredients"
              );
            }
            const item = await createSeedMenuItem(
              {
                name: testName("seed dish"),
                category_id: Number(categoryId),
                description: "Temporary probe seed. Safe to delete.",
                price: "100",
                ingredients_data: [
                  { inventory_item: Number(ingredientId), quantity: 1 },
                ],
                prep_time: "00:10:00",
                available: false,
                is_special: false,
              },
              token
            );
            const itemId = extractCreatedId(item);
            if (!itemId) {
              throw new Error("Skipped: seed item creation returned no id");
            }
            try {
              return await getSeedMenuItem(itemId, token);
            } finally {
              try {
                await deleteSeedMenuItem(itemId, token);
              } catch {
                // Best-effort teardown; the detail result matters more.
              }
            }
          } finally {
            try {
              await deleteSeedCategory(categoryId, token);
            } catch {
              // Best-effort teardown; the detail result matters more.
            }
          }
        },
        true
      ),
      createApiProbe(
        "seeds-category-create",
        "Create seed category (test)",
        "POST",
        "/seeds/categories/",
        async () => {
          const created = await createSeedCategory(
            {
              name: testName("seed category"),
              description: "Automated API probe. Safe to delete.",
            },
            token
          );
          const id = extractCreatedId(created);
          if (!id) throw new Error("Create seed category returned no id");
          ids.categoryId = id;
          return created;
        },
        true
      ),
      createApiProbe(
        "seeds-category-detail",
        "Test seed category detail",
        "GET",
        "/seeds/categories/:id/",
        () =>
          getSeedCategory(
            requireTestId(ids.categoryId, "read test seed category"),
            token
          ),
        true
      ),
      createApiProbe(
        "seeds-category-patch",
        "Patch test seed category",
        "PATCH",
        "/seeds/categories/:id/",
        () =>
          patchSeedCategory(
            requireTestId(ids.categoryId, "patch test seed category"),
            { description: "Patched by automated API probe." },
            token
          ),
        true
      ),
      createApiProbe(
        "seeds-inventory-item-create",
        "Create seed inventory item (test)",
        "POST",
        "/seeds/inventory-items/",
        async () => {
          const itemName = testName("seed ingredient");
          try {
            const created = await createSeedInventoryItem(
              {
                name: itemName,
                unit: "pcs",
                threshold: 1,
                available: true,
              },
              token
            );
            const id = extractCreatedId(created);
            if (!id) throw new Error("Create seed inventory item returned no id");
            ids.inventoryId = id;
            return created;
          } catch (error) {
            // The endpoint intermittently 500s after committing the row, so a
            // failure can still leave the record behind. Best-effort cleanup
            // by our unique name before reporting the failure.
            try {
              const list = await listSeedInventoryItems(token);
              const orphanId = extractFirstId(
                list.filter((item) => item.name === itemName)
              );
              if (orphanId) await deleteSeedInventoryItem(orphanId, token);
            } catch {
              // Cleanup is best-effort; the original error matters more.
            }
            throw error;
          }
        },
        true
      ),
      createApiProbe(
        "seeds-inventory-item-detail",
        "Test seed inventory detail",
        "GET",
        "/seeds/inventory-items/:id/",
        () =>
          getSeedInventoryItem(
            requireTestId(ids.inventoryId, "read test seed inventory item"),
            token
          ),
        true
      ),
      createApiProbe(
        "seeds-inventory-item-patch",
        "Patch test seed inventory item",
        "PATCH",
        "/seeds/inventory-items/:id/",
        () =>
          patchSeedInventoryItem(
            requireTestId(ids.inventoryId, "patch test seed inventory item"),
            { threshold: 2 },
            token
          ),
        true
      ),
      createApiProbe(
        "seeds-item-create",
        "Create seed item (test)",
        "POST",
        "/seeds/menu-items/",
        async () => {
          const categoryId = requireTestId(
            ids.categoryId,
            "create test seed item"
          );
          // The backend treats an empty ingredients list as missing, so fall
          // back to the first existing inventory item when our test item
          // wasn't created (the inventory create endpoint 500s intermittently).
          let ingredientId = ids.inventoryId;
          if (!ingredientId) {
            ingredientId = extractFirstId(
              await listSeedInventoryItems(token)
            );
          }
          if (!ingredientId) {
            throw new Error(
              "Skipped: no seed inventory items available for ingredients"
            );
          }
          const itemName = testName("seed dish");
          const created = await createSeedMenuItem(
            {
              name: itemName,
              category_id: Number(categoryId),
              description: "Automated API probe. Safe to delete.",
              price: "100",
              ingredients_data: [
                {
                  inventory_item: Number(ingredientId),
                  quantity: 1,
                },
              ],
              prep_time: "00:10:00",
              available: false,
              is_special: false,
            },
            token
          );
          const id = extractCreatedId(created);
          if (!id) throw new Error("Create seed item returned no id");
          ids.itemId = id;
          ids.itemName = itemName;
          ids.ingredientId = String(ingredientId);
          return created;
        },
        true
      ),
      createApiProbe(
        "seeds-item-detail",
        "Test seed item detail",
        "GET",
        "/seeds/menu-items/:id/",
        () =>
          getSeedMenuItem(
            requireTestId(ids.itemId, "read test seed item"),
            token
          ),
        true
      ),
      createApiProbe(
        "seeds-item-patch",
        "Patch test seed item",
        "PATCH",
        "/seeds/menu-items/:id/",
        () =>
          // The seed PATCH endpoint behaves like a full update: it rejects
          // partial bodies, so the whole object is re-sent with a new
          // description.
          patchSeedMenuItem(
            requireTestId(ids.itemId, "patch test seed item"),
            {
              name: requireTestId(ids.itemName, "patch test seed item"),
              category_id: Number(
                requireTestId(ids.categoryId, "patch test seed item")
              ),
              price: "100",
              ingredients_data: [
                {
                  inventory_item: Number(
                    requireTestId(ids.ingredientId, "patch test seed item")
                  ),
                  quantity: 1,
                },
              ],
              description: "Patched by automated API probe.",
            },
            token
          ),
        true
      ),
      createApiProbe(
        "seeds-item-delete",
        "Delete test seed item (cleanup)",
        "DELETE",
        "/seeds/menu-items/:id/",
        () =>
          deleteSeedMenuItem(
            requireTestId(ids.itemId, "delete test seed item"),
            token
          ),
        true
      ),
      createApiProbe(
        "seeds-inventory-item-delete",
        "Delete test seed inventory item (cleanup)",
        "DELETE",
        "/seeds/inventory-items/:id/",
        () =>
          deleteSeedInventoryItem(
            requireTestId(ids.inventoryId, "delete test seed inventory item"),
            token
          ),
        true
      ),
      createApiProbe(
        "seeds-category-delete",
        "Delete test seed category (cleanup)",
        "DELETE",
        "/seeds/categories/:id/",
        () =>
          deleteSeedCategory(
            requireTestId(ids.categoryId, "delete test seed category"),
            token
          ),
        true
      ),
    ];
  },
};
