// service.ts
import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";

/**
 * Delete an inventory item by ID
 * @param id - The ID of the item to delete
 * @param token - Optional authorization token
 */
const deleteInventoryItem = async (id: string, token?: string) => {
  const config = getConfig(`/inventory/items/${id}/delete/`, "DELETE", token);
  return await bookiesAxiosInstance(config);
};

/**
 * Create a new inventory item
 * @param data - Data for the new item
 * @param token - Optional authorization token
 */
const createInventoryItem = async (data: any, token?: string) => {
  const config = getConfig("/inventory/items/create/", "POST", token, data);
  return await bookiesAxiosInstance(config);
};

/**
 * Get inventory transactions
 * @param params - Optional query parameters
 * @param token - Optional authorization token
 */
const getInventoryTransactions = async (params?: any, token?: string) => {
  const config = getConfig("/inventory/transactions/", "GET", token, undefined, params);
  return await bookiesAxiosInstance(config);
};

/**
 * Create a new inventory transaction
 * @param data - Data for the transaction
 * @param token - Optional authorization token
 */
const createInventoryTransaction = async (data: any, token?: string) => {
  const config = getConfig("/inventory/transactions/create/", "POST", token, data);
  return await bookiesAxiosInstance(config);
};

// Export all functions
export {
  deleteInventoryItem,
  createInventoryItem,
  getInventoryTransactions,
  createInventoryTransaction,
};
