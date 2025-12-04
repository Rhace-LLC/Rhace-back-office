// service.ts
import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";
import { InventoryResponse } from "./utils/types.service";
import { InventoryItem } from "@/store/inventory.slice";

/**
 * ==============================
 * INVENTORY ITEMS
 * ==============================
 */

/**
 * Get all inventory items (paginated)
 * @param params - Optional query parameters { page, page_size }
 * @param token - Optional authorization token
 */
const getInventoryItems = async (
  params?: { page?: number; page_size?: number },
  token?: string
): Promise<InventoryResponse> => {
  const config = getConfig(
    "/inventory/items/",
    "GET",
    token,
    undefined,
    params
  );
  return await bookiesAxiosInstance(config);
};

/**
 * Create a new inventory item
 * @param data - Data for the new item
 * {
 *   name: string,
 *   is_allergen: boolean,
 *   unit: string,
 *   threshold: number,
 *   restaurant: string (UUID)
 * }
 * @param token - Optional authorization token
 */
const createInventoryItem = async (
  data: {
    name: string;
    is_allergen: boolean;
    unit: string;
    threshold: number;
    restaurant: string;
  },
  token?: string
): Promise<InventoryItem> => {
  const config = getConfig("/inventory/items/create/", "POST", token, data);
  return await bookiesAxiosInstance(config);
};

/**
 * Delete an inventory item by ID
 * @param id - The ID (UUID) of the item to delete
 * @param token - Optional authorization token
 */
const deleteInventoryItem = async (id: string, token?: string) => {
  const config = getConfig(`/inventory/items/${id}/delete/`, "DELETE", token);
  return await bookiesAxiosInstance(config);
};

/**
 * ==============================
 * INVENTORY TRANSACTIONS
 * ==============================
 */

/**
 * Get inventory transactions (paginated)
 * @param params - Optional query parameters { page, page_size }
 * @param token - Optional authorization token
 */
const getInventoryTransactions = async (
  params?: { page?: number; page_size?: number },
  token?: string
): Promise<InventoryResponse> => {
  const config = getConfig(
    "/inventory/transactions/",
    "GET",
    token,
    undefined,
    params
  );
  return await bookiesAxiosInstance(config);
};

/**
 * Create a new inventory transaction
 * @param data - Data for the new transaction
 * {
 *   item: number,
 *   transaction_type: "wastage" | "purchase" | "adjustment" | "usage",
 *   reason: string,
 *   quantity: number,
 *   recorded_by: string
 * }
 * @param token - Optional authorization token
 */
const createInventoryTransaction = async (
  data: {
    item: number;
    transaction_type: string;
    reason: string;
    quantity: number;
    recorded_by: string;
  },
  token?: string
) => {
  const config = getConfig(
    "/inventory/transactions/create/",
    "POST",
    token,
    data
  );
  return await bookiesAxiosInstance(config);
};

/**
 * ==============================
 * EXPORTS
 * ==============================
 */

const updateInventoryItem = async (
  id: string,
  data: {
    name?: string;
    is_allergen?: boolean;
    unit?: string;
    threshold?: number;
    restaurant?: string;
  },
  token?: string
): Promise<InventoryItem> => {
  const config = getConfig(
    `/inventory/items/${id}/`, // matches PUT /inventory/items/{id}/
    "PUT",
    token,
    data
  );

  return await bookiesAxiosInstance(config);
};

export {
  getInventoryItems,
  createInventoryItem,
  deleteInventoryItem,
  getInventoryTransactions,
  createInventoryTransaction,
  updateInventoryItem,
};
