// menuService.ts
import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";
import { CategoryData } from "@/store/category.slice";
import { MenuDishData } from "@/store/menu.slice";
import { Table } from "@/store/table.slice";

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
): Promise<MenuDishData[]> => {
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
) => {
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
) => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/items/${id}/`,
    "PUT",
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
) => {
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
};
