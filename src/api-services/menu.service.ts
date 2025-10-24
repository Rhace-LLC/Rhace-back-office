// menuService.ts

import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";
import { CategoryData } from "@/store/category.slice";
import { MenuDishData } from "@/store/menu.slice";

// ========== CATEGORIES =========
const getAllCategories = async (token: string): Promise<CategoryData[]> => {
  const config = getConfig("/menu/categories/", "GET", token);
  return bookiesAxiosInstance(config);
};

const getCategoryById = async (id: string, token: string) => {
  const config = getConfig(`/menu/categories/${id}/`, "GET", token);
  return bookiesAxiosInstance(config);
};

const createCategory = async (
  data: any,
  token: string
): Promise<CategoryData> => {
  const config = getConfig("/menu/categories/create/", "POST", token, data);
  return bookiesAxiosInstance(config);
};

const updateCategory = async (
  id: string,
  data: any,
  token: string
): Promise<CategoryData> => {
  const config = getConfig(`/menu/categories/${id}/`, "PUT", token, data);
  return bookiesAxiosInstance(config);
};

const patchCategory = async (id: string, data: any, token: string) => {
  const config = getConfig(`/menu/categories/${id}/`, "PATCH", token, data);
  return bookiesAxiosInstance(config);
};

const deleteCategory = async (id: string, token: string) => {
  const config = getConfig(`/menu/categories/${id}/`, "DELETE", token);
  return bookiesAxiosInstance(config);
};

// ========== MENU ITEMS ==========
export interface GetMenuParams {
  category?: number;
}

const getMenuItems = async (
  token: string,
  params: GetMenuParams
): Promise<MenuDishData[]> => {
  const config = getConfig("/menu/", "GET", token, undefined, params);
  return bookiesAxiosInstance(config);
};

const getMenuItemById = async (id: string, token: string) => {
  const config = getConfig(`/menu/items/${id}/`, "GET", token);
  return bookiesAxiosInstance(config);
};

const getMenuItemDetails = async (id: string, token: string) => {
  const config = getConfig(`/menu/items/${id}/details/`, "GET", token);
  return bookiesAxiosInstance(config);
};

const createMenuItem = async (data: any, token: string) => {
  const config = getConfig("/menu/items/create/", "POST", token, data);
  return bookiesAxiosInstance(config);
};

const updateMenuItem = async (id: string, data: any, token: string) => {
  const config = getConfig(`/menu/items/${id}/`, "PUT", token, data);
  return bookiesAxiosInstance(config);
};

const patchMenuItem = async (id: string, data: any, token: string) => {
  const config = getConfig(`/menu/items/${id}/`, "PATCH", token, data);
  return bookiesAxiosInstance(config);
};

const deleteMenuItem = async (id: string, token: string) => {
  const config = getConfig(`/menu/items/${id}/`, "DELETE", token);
  return bookiesAxiosInstance(config);
};

// ========== PRICING RULES ==========

const getPricingRules = async (token: string) => {
  const config = getConfig("/menu/pricing-rules/", "GET", token);
  return bookiesAxiosInstance(config);
};

const createPricingRule = async (data: any, token: string) => {
  const config = getConfig("/menu/pricing-rules/", "POST", token, data);
  return bookiesAxiosInstance(config);
};

const getPricingRuleById = async (id: string, token: string) => {
  const config = getConfig(`/menu/pricing-rules/${id}/`, "GET", token);
  return bookiesAxiosInstance(config);
};

const updatePricingRule = async (id: string, data: any, token: string) => {
  const config = getConfig(`/menu/pricing-rules/${id}/`, "PUT", token, data);
  return bookiesAxiosInstance(config);
};

const patchPricingRule = async (id: string, data: any, token: string) => {
  const config = getConfig(`/menu/pricing-rules/${id}/`, "PATCH", token, data);
  return bookiesAxiosInstance(config);
};

const deletePricingRule = async (id: string, token: string) => {
  const config = getConfig(`/menu/pricing-rules/${id}/`, "DELETE", token);
  return bookiesAxiosInstance(config);
};

const togglePricingRule = async (ruleId: string, token: string) => {
  const config = getConfig(
    `/menu/pricing-rules/${ruleId}/toggle/`,
    "POST",
    token
  );
  return bookiesAxiosInstance(config);
};

// ========== PRICING OPERATIONS ==========

const applyPricing = async (data: any, token: string) => {
  const config = getConfig("/menu/pricing/apply/", "POST", token, data);
  return bookiesAxiosInstance(config);
};

const getPricingMenuItems = async (token: string) => {
  const config = getConfig("/menu/pricing/menu-items/", "GET", token);
  return bookiesAxiosInstance(config);
};

const resetPricing = async (token: string) => {
  const config = getConfig("/menu/pricing/reset/", "POST", token);
  return bookiesAxiosInstance(config);
};

const updateBasePricing = async (data: any, token: string) => {
  const config = getConfig("/menu/pricing/update-base/", "POST", token, data);
  return bookiesAxiosInstance(config);
};

// ========== TABLES ==========

const getTables = async (token: string) => {
  const config = getConfig("/menu/tables/", "GET", token);
  return bookiesAxiosInstance(config);
};

const createTable = async (data: any, token: string) => {
  const config = getConfig("/menu/tables/", "POST", token, data);
  return bookiesAxiosInstance(config);
};

const deleteTable = async (id: string, token: string) => {
  const config = getConfig(`/menu/tables/${id}/delete/`, "DELETE", token);
  return bookiesAxiosInstance(config);
};

// ========== EXPORTS ==========

export {
  getMenuItems,
  getMenuItemById,
  getMenuItemDetails,
  createMenuItem,
  updateMenuItem,
  patchMenuItem,
  deleteMenuItem,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  patchCategory,
  deleteCategory,
  getPricingRules,
  createPricingRule,
  getPricingRuleById,
  updatePricingRule,
  patchPricingRule,
  deletePricingRule,
  togglePricingRule,
  applyPricing,
  getPricingMenuItems,
  resetPricing,
  updateBasePricing,
  getTables,
  createTable,
  deleteTable,
};
