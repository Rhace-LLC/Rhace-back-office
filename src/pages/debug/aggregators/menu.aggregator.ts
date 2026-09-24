import {
  createCategory,
  createMenuItem,
  createTable,
  deleteCategory,
  deleteMenuItem,
  deleteTable,
  getAllCategories,
  getCategoryById,
  getMenuItemById,
  getMenuItems,
  getPricingMenuItems,
  getPricingRules,
  getSpecialMenuItems,
  getTableById,
  getTables,
  getWaitersTableAssignments,
  patchCategory,
  patchMenuItem,
  patchTable,
  toggleMenuItemAvailability,
  toggleMenuItemSpecial,
} from "@/api-services/menu.service";
import {
  createApiProbe,
  extractCreatedId,
  extractFirstId,
  requireTestId,
  testName,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

// Skipped on purpose: pricing-rule writes and pricing apply/reset touch live
// prices, bulkUpload needs a file picker, and assignWaitersForTheDay assigns
// real tables and sends emails. Detail-update (PUT) variants are covered by
// their PATCH equivalents on the same endpoints.

export const menuAggregator: ServiceAggregatorDefinition = {
  id: "menu",
  name: "Menu",
  serviceFile: "menu.service.ts",
  description:
    "Menu reads plus opt-in writes: creates [API-TEST] categories, tables, and items, touches them, then deletes them.",
  requiresRestaurantId: true,
  hasWriteProbes: true,
  getProbes: ({ token, restaurantId }) => {
    if (!token || !restaurantId) return [];
    const base = `/menu/restaurant/${restaurantId}`;
    const ids: { categoryId?: string; tableId?: string; itemId?: string } = {};

    const firstCategoryId = async () => {
      const id = extractFirstId(
        await getAllCategories(restaurantId, token)
      );
      if (!id) throw new Error("Skipped: no categories found");
      return id;
    };
    const firstItemId = async () => {
      const id = extractFirstId(await getMenuItems(restaurantId, token));
      if (!id) throw new Error("Skipped: no menu items found");
      return id;
    };
    const firstTableId = async () => {
      const id = extractFirstId(
        await getTables(restaurantId, undefined, token)
      );
      if (!id) throw new Error("Skipped: no tables found");
      return id;
    };

    return [
      createApiProbe(
        "menu-categories",
        "Categories",
        "GET",
        `${base}/categories/`,
        () => getAllCategories(restaurantId, token)
      ),
      createApiProbe(
        "menu-category-detail",
        "Category detail (first)",
        "GET",
        `${base}/categories/:id/`,
        async () => getCategoryById(restaurantId, await firstCategoryId(), token)
      ),
      createApiProbe(
        "menu-items",
        "Menu items",
        "GET",
        `${base}/menu-items/`,
        () => getMenuItems(restaurantId, token)
      ),
      createApiProbe(
        "menu-item-detail",
        "Menu item detail (first)",
        "GET",
        `${base}/items/:id/`,
        async () => getMenuItemById(restaurantId, await firstItemId(), token)
      ),
      createApiProbe(
        "menu-specials",
        "Special items",
        "GET",
        `${base}/items/special/`,
        () => getSpecialMenuItems(restaurantId, token)
      ),
      createApiProbe(
        "menu-pricing-rules",
        "Pricing rules",
        "GET",
        `${base}/pricing-rules/`,
        () => getPricingRules(restaurantId, token)
      ),
      createApiProbe(
        "menu-pricing-items",
        "Pricing items",
        "GET",
        `${base}/pricing/items/`,
        () => getPricingMenuItems(restaurantId, token)
      ),
      createApiProbe(
        "menu-tables",
        "Tables",
        "GET",
        `${base}/tables/`,
        () => getTables(restaurantId, undefined, token)
      ),
      createApiProbe(
        "menu-table-detail",
        "Table detail (first)",
        "GET",
        `${base}/tables/:id/`,
        async () => getTableById(restaurantId, await firstTableId(), token)
      ),
      createApiProbe(
        "menu-table-assignments",
        "Table assignments",
        "GET",
        "/menu/table-assignments/",
        () => getWaitersTableAssignments(undefined, undefined, token)
      ),
      createApiProbe(
        "menu-category-create",
        "Create category (test)",
        "POST",
        `${base}/categories/`,
        async () => {
          const formData = new FormData();
          formData.append("name", testName("category"));
          formData.append(
            "description",
            "Automated API probe. Safe to delete."
          );
          const created = await createCategory(
            restaurantId,
            formData,
            token
          );
          const id = extractCreatedId(created);
          if (!id) throw new Error("Create category returned no id");
          ids.categoryId = id;
          return created;
        },
        true
      ),
      createApiProbe(
        "menu-category-patch",
        "Patch test category",
        "PATCH",
        `${base}/categories/:id/`,
        () =>
          patchCategory(
            restaurantId,
            requireTestId(ids.categoryId, "patch test category"),
            { description: "Patched by automated API probe." },
            token
          ),
        true
      ),
      createApiProbe(
        "menu-table-create",
        "Create table (test)",
        "POST",
        `${base}/tables/`,
        async () => {
          const created = await createTable(
            restaurantId,
            {
              table_number: `T-${String(Date.now()).slice(-6)}`,
              max_party_size: 2,
              is_available: true,
              restaurant: restaurantId,
            },
            token
          );
          const id = extractCreatedId(created);
          if (!id) throw new Error("Create table returned no id");
          ids.tableId = id;
          return created;
        },
        true
      ),
      createApiProbe(
        "menu-table-patch",
        "Patch test table",
        "PATCH",
        `${base}/tables/:id/`,
        () =>
          patchTable(
            restaurantId,
            requireTestId(ids.tableId, "patch test table"),
            { max_party_size: 4 },
            token
          ),
        true
      ),
      createApiProbe(
        "menu-item-create",
        "Create menu item (test)",
        "POST",
        `${base}/menu-items/`,
        async () => {
          const categoryId = requireTestId(
            ids.categoryId,
            "create test menu item"
          );
          const formData = new FormData();
          formData.append("name", testName("dish"));
          formData.append("price", "100");
          formData.append(
            "description",
            "Automated API probe. Safe to delete."
          );
          formData.append("category_id", categoryId);
          formData.append("prep_time", "00:10:00");
          formData.append("is_special", "false");
          formData.append("ingredients_data", "[]");
          const created = await createMenuItem(
            restaurantId,
            formData,
            token
          );
          const id = extractCreatedId(created);
          if (!id) throw new Error("Create menu item returned no id");
          ids.itemId = id;
          return created;
        },
        true
      ),
      createApiProbe(
        "menu-item-patch",
        "Patch test menu item",
        "PATCH",
        `${base}/items/:id/`,
        () =>
          patchMenuItem(
            restaurantId,
            requireTestId(ids.itemId, "patch test menu item"),
            { description: "Patched by automated API probe." },
            token
          ),
        true
      ),
      createApiProbe(
        "menu-item-toggle-availability",
        "Toggle test item availability",
        "POST",
        `${base}/items/:id/toggle-availability/`,
        () =>
          toggleMenuItemAvailability(
            restaurantId,
            requireTestId(ids.itemId, "toggle test item"),
            token
          ),
        true
      ),
      createApiProbe(
        "menu-item-toggle-special",
        "Toggle test item special",
        "POST",
        `${base}/items/:id/toggle-special/`,
        () =>
          toggleMenuItemSpecial(
            restaurantId,
            requireTestId(ids.itemId, "toggle test item"),
            token
          ),
        true
      ),
      createApiProbe(
        "menu-item-delete",
        "Delete test menu item (cleanup)",
        "DELETE",
        `${base}/items/:id/`,
        () =>
          deleteMenuItem(
            restaurantId,
            requireTestId(ids.itemId, "delete test menu item"),
            token
          ),
        true
      ),
      createApiProbe(
        "menu-table-delete",
        "Delete test table (cleanup)",
        "DELETE",
        `${base}/tables/:id/`,
        () =>
          deleteTable(
            restaurantId,
            requireTestId(ids.tableId, "delete test table"),
            token
          ),
        true
      ),
      createApiProbe(
        "menu-category-delete",
        "Delete test category (cleanup)",
        "DELETE",
        `${base}/categories/:id/`,
        () =>
          deleteCategory(
            restaurantId,
            requireTestId(ids.categoryId, "delete test category"),
            token
          ),
        true
      ),
    ];
  },
};
