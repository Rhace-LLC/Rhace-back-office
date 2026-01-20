// menuService.ts
import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";
import { CategoryData } from "@/store/category.slice";
import { Table } from "./tableService";
export interface GetMenuItemsResponse extends Array<MenuItem> {}

export interface MenuItem {
  id: string;
  restaurant: string;
  restaurant_name: string;
  name: string;
  category: MenuCategory;
  description: string;
  price: string;
  ingredients: MenuIngredient[];
  display_ingredients: string[];
  allergens: string[];
  image_url: string;
  prep_time: string; // "HH:MM:SS"
  created: string; // ISO timestamp
  updated: string; // ISO timestamp
  available: boolean;
  is_special: boolean;
}

export interface MenuCategory {
  id: number;
  restaurant: string;
  restaurant_name: string;
  name: string;
  description: string;
  image: string;
  image_url: string;
  items_count: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface MenuIngredient {
  inventory_item: number;
  quantity: number;
}

export interface GetTableAssignment {
  date: string; // ISO date string
  restaurant: string;
  total_assignments: number;
  assignments: Assignment[]; // reuse TableAssignment from previous interface
}

export interface TableAssignment {
  waiter_id: string;
  waiter_name: string;
  waiter_email: string;
  tables: string[];
  table_count: number;
  email_sent?: boolean; // optional since in some GET responses there may be no emails sent yet
}

export interface TableAssignData {
  id: string;
  table_number: string;
  max_party_size: number;
  status: string; // e.g. "free", "occupied"
}

export interface Waiter {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Assignment {
  id: string;
  waiter: Waiter;
  tables: TableAssignData[];
  table_count: number;
  notes: string;
  assigned_by: string;
  created_at: string; // ISO datetime string
}

// ========== CATEGORIES =========
const getAllCategories = async (
  restaurantId: string,
  token: string
): Promise<CategoryData[]> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/categories/`,
    "GET",
    token
  );
  return bookiesAxiosInstance(config);
};

const getCategoryById = async (
  restaurantId: string,
  id: string,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/categories/${id}/`,
    "GET",
    token
  );
  return bookiesAxiosInstance(config);
};

const createCategory = async (
  restaurantId: string,
  data: any,
  token: string
): Promise<CategoryData> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/categories/`,
    "POST",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const updateCategory = async (
  restaurantId: string,
  id: string,
  data: any,
  token: string
): Promise<CategoryData> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/categories/${id}/`,
    "PUT",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const patchCategory = async (
  restaurantId: string,
  id: string,
  data: any,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/categories/${id}/`,
    "PATCH",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const deleteCategory = async (
  restaurantId: string,
  id: string,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/categories/${id}/`,
    "DELETE",
    token
  );
  return bookiesAxiosInstance(config);
};

// ========== MENU ITEMS ==========
export interface GetMenuParams {
  category?: number;
}

const getMenuItems = async (
  restaurantId: string,
  token: string,
  params?: GetMenuParams
): Promise<GetMenuItemsResponse> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/menu-items/`,
    "GET",
    token,
    undefined,
    params
  );
  return bookiesAxiosInstance(config);
};

const getMenuItemById = async (
  restaurantId: string,
  id: string,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/items/${id}/`,
    "GET",
    token
  );
  return bookiesAxiosInstance(config);
};

const createMenuItem = async (
  restaurantId: string,
  data: any,
  token: string
): Promise<MenuItem> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/menu-items/`,
    "POST",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const updateMenuItem = async (
  restaurantId: string,
  id: string,
  data: any,
  token: string
): Promise<MenuItem> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/items/${id}/`,
    "PATCH",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const patchMenuItem = async (
  restaurantId: string,
  id: string,
  data: any,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/items/${id}/`,
    "PATCH",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const deleteMenuItem = async (
  restaurantId: string,
  id: string,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/items/${id}/`,
    "DELETE",
    token
  );
  return bookiesAxiosInstance(config);
};
// ---------------- Types ----------------
export interface ToggleMenuItemParams {
  restaurant_id: string;
  item_id: string;
}

// ---------------- Requests ----------------

/**
 * Toggle availability of a menu item
 */
export const toggleMenuItemAvailability = async (
  restaurantId: string,
  itemId: string,
  token: string
): Promise<MenuItem> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/items/${itemId}/toggle-availability/`,
    "POST",
    token
  );
  return bookiesAxiosInstance(config);
};

/**
 * Toggle special status of a menu item
 */
export const toggleMenuItemSpecial = async (
  restaurantId: string,
  itemId: string,
  token: string
): Promise<any> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/items/${itemId}/toggle-special/`,
    "POST",
    token
  );
  return bookiesAxiosInstance(config);
};

/**
 * Get all special menu items for a restaurant
 */
export const getSpecialMenuItems = async (
  restaurantId: string,
  token: string
): Promise<GetMenuItemsResponse> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/items/special/`,
    "GET",
    token
  );
  return bookiesAxiosInstance(config);
};

// ========== PRICING RULES ==========
const getPricingRules = async (restaurantId: string, token: string) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/pricing-rules/`,
    "GET",
    token
  );
  return bookiesAxiosInstance(config);
};

const createPricingRule = async (
  restaurantId: string,
  data: any,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/pricing-rules/`,
    "POST",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const getPricingRuleById = async (
  restaurantId: string,
  id: string,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/pricing-rules/${id}/`,
    "GET",
    token
  );
  return bookiesAxiosInstance(config);
};

const updatePricingRule = async (
  restaurantId: string,
  id: string,
  data: any,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/pricing-rules/${id}/`,
    "PUT",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const patchPricingRule = async (
  restaurantId: string,
  id: string,
  data: any,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/pricing-rules/${id}/`,
    "PATCH",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const deletePricingRule = async (
  restaurantId: string,
  id: string,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/pricing-rules/${id}/`,
    "DELETE",
    token
  );
  return bookiesAxiosInstance(config);
};

const togglePricingRule = async (
  restaurantId: string,
  ruleId: string,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/pricing-rules/${ruleId}/toggle/`,
    "POST",
    token
  );
  return bookiesAxiosInstance(config);
};

// ========== PRICING OPERATIONS ==========
const applyPricing = async (restaurantId: string, data: any, token: string) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/pricing-rules/apply/`,
    "POST",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const getPricingMenuItems = async (restaurantId: string, token: string) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/pricing/items/`,
    "GET",
    token
  );
  return bookiesAxiosInstance(config);
};

const resetPricing = async (restaurantId: string, token: string) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/pricing/reset/`,
    "POST",
    token
  );
  return bookiesAxiosInstance(config);
};

const updateBasePricing = async (
  restaurantId: string,
  data: any,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/pricing/update-base/`,
    "POST",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

// ========== TABLES ==========
const getTables = async (
  restaurantId: string,
  params: any,
  token: string
): Promise<Table[]> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/tables/`,
    "GET",
    token,
    undefined,
    params
  );
  return bookiesAxiosInstance(config);
};

const createTable = async (restaurantId: string, data: any, token: string) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/tables/`,
    "POST",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const getTableById = async (
  restaurantId: string,
  id: string,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/tables/${id}/`,
    "GET",
    token
  );
  return bookiesAxiosInstance(config);
};

const updateTable = async (
  restaurantId: string,
  id: string,
  data: any,
  token: string
): Promise<Table> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/tables/${id}/`,
    "PUT",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const patchTable = async (
  restaurantId: string,
  id: string,
  data: any,
  token: string
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/tables/${id}/`,
    "PATCH",
    token,
    data
  );
  return bookiesAxiosInstance(config);
};

const deleteTable = async (restaurantId: string, id: string, token: string) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/tables/${id}/`,
    "DELETE",
    token
  );
  return bookiesAxiosInstance(config);
};

const getWaitersTableAssignments = async (
  data?: any,
  params?: Record<string, string>,
  token?: string
): Promise<GetTableAssignment> => {
  const config = getConfig(
    `/menu/table-assignments/`,
    "GET",
    token,
    data,
    params
  );
  return bookiesAxiosInstance(config);
};

const assignWaitersForTheDay = async (
  data?: any,
  params?: Record<string, string>,
  token?: string
) => {
  const config = getConfig(
    `/menu/assign-waiter-tables/`,
    "POST",
    token,
    data,
    params
  );
  return bookiesAxiosInstance(config);
};

// ========== EXPORTS ==========
export {
  // Categories
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  patchCategory,
  deleteCategory,

  // Menu Items
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  patchMenuItem,
  deleteMenuItem,

  // Pricing Rules
  getPricingRules,
  createPricingRule,
  getPricingRuleById,
  updatePricingRule,
  patchPricingRule,
  deletePricingRule,
  togglePricingRule,

  // Pricing Operations
  applyPricing,
  getPricingMenuItems,
  resetPricing,
  updateBasePricing,

  // Tables
  getTables,
  createTable,
  getTableById,
  updateTable,
  patchTable,
  deleteTable,
  getWaitersTableAssignments,
  assignWaitersForTheDay,
};
