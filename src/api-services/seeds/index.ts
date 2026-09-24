// src/api-services/seeds/index.ts
import { getConfig } from "../utils/reqConfig";
import { bookiesAxiosInstance } from "../utils/baseUrl";
import { logResponse } from "../utils/logResponse";
import type {
  SeedCategory,
  SeedCategoryListResponse,
  SeedCategoryPatchPayload,
  SeedCategoryPayload,
  SeedInventoryItem,
  SeedInventoryItemListResponse,
  SeedInventoryItemPatchPayload,
  SeedInventoryItemPayload,
  SeedMenuItem,
  SeedMenuItemListResponse,
  SeedMenuItemPatchPayload,
  SeedMenuItemPayload,
} from "./type";

export * from "./type";

/** GET /seeds/categories/ */
export const listSeedCategories = async (
  token?: string
): Promise<SeedCategoryListResponse> => {
  const config = getConfig("/seeds/categories/", "GET", token);
  return logResponse<SeedCategoryListResponse>(
    "seeds",
    "GET /seeds/categories/",
    bookiesAxiosInstance(config)
  );
};

/** POST /seeds/categories/ */
export const createSeedCategory = async (
  data: SeedCategoryPayload,
  token?: string
): Promise<SeedCategory> => {
  const config = getConfig("/seeds/categories/", "POST", token, data);
  return logResponse<SeedCategory>(
    "seeds",
    "POST /seeds/categories/",
    bookiesAxiosInstance(config)
  );
};

/** GET /seeds/categories/{id}/ */
export const getSeedCategory = async (
  id: number | string,
  token?: string
): Promise<SeedCategory> => {
  const config = getConfig(`/seeds/categories/${id}/`, "GET", token);
  return logResponse<SeedCategory>(
    "seeds",
    `GET /seeds/categories/${id}/`,
    bookiesAxiosInstance(config)
  );
};

/** PATCH /seeds/categories/{id}/ */
export const patchSeedCategory = async (
  id: number | string,
  data: SeedCategoryPatchPayload,
  token?: string
): Promise<SeedCategory> => {
  const config = getConfig(`/seeds/categories/${id}/`, "PATCH", token, data);
  return logResponse<SeedCategory>(
    "seeds",
    `PATCH /seeds/categories/${id}/`,
    bookiesAxiosInstance(config)
  );
};

/** DELETE /seeds/categories/{id}/ — returns 204 with no body. */
export const deleteSeedCategory = async (
  id: number | string,
  token?: string
): Promise<void> => {
  const config = getConfig(`/seeds/categories/${id}/`, "DELETE", token);
  return logResponse<void>(
    "seeds",
    `DELETE /seeds/categories/${id}/`,
    bookiesAxiosInstance(config)
  );
};

/** GET /seeds/inventory-items/ */
export const listSeedInventoryItems = async (
  token?: string
): Promise<SeedInventoryItemListResponse> => {
  const config = getConfig("/seeds/inventory-items/", "GET", token);
  return logResponse<SeedInventoryItemListResponse>(
    "seeds",
    "GET /seeds/inventory-items/",
    bookiesAxiosInstance(config)
  );
};

/** POST /seeds/inventory-items/ */
export const createSeedInventoryItem = async (
  data: SeedInventoryItemPayload,
  token?: string
): Promise<SeedInventoryItem> => {
  const config = getConfig("/seeds/inventory-items/", "POST", token, data);
  return logResponse<SeedInventoryItem>(
    "seeds",
    "POST /seeds/inventory-items/",
    bookiesAxiosInstance(config)
  );
};

/** GET /seeds/inventory-items/{id}/ */
export const getSeedInventoryItem = async (
  id: number | string,
  token?: string
): Promise<SeedInventoryItem> => {
  const config = getConfig(`/seeds/inventory-items/${id}/`, "GET", token);
  return logResponse<SeedInventoryItem>(
    "seeds",
    `GET /seeds/inventory-items/${id}/`,
    bookiesAxiosInstance(config)
  );
};

/** PATCH /seeds/inventory-items/{id}/ */
export const patchSeedInventoryItem = async (
  id: number | string,
  data: SeedInventoryItemPatchPayload,
  token?: string
): Promise<SeedInventoryItem> => {
  const config = getConfig(
    `/seeds/inventory-items/${id}/`,
    "PATCH",
    token,
    data
  );
  return logResponse<SeedInventoryItem>(
    "seeds",
    `PATCH /seeds/inventory-items/${id}/`,
    bookiesAxiosInstance(config)
  );
};

/** DELETE /seeds/inventory-items/{id}/ — returns 204 with no body. */
export const deleteSeedInventoryItem = async (
  id: number | string,
  token?: string
): Promise<void> => {
  const config = getConfig(`/seeds/inventory-items/${id}/`, "DELETE", token);
  return logResponse<void>(
    "seeds",
    `DELETE /seeds/inventory-items/${id}/`,
    bookiesAxiosInstance(config)
  );
};

/** GET /seeds/menu-items/ */
export const listSeedMenuItems = async (
  token?: string
): Promise<SeedMenuItemListResponse> => {
  const config = getConfig("/seeds/menu-items/", "GET", token);
  return logResponse<SeedMenuItemListResponse>(
    "seeds",
    "GET /seeds/menu-items/",
    bookiesAxiosInstance(config)
  );
};

/** POST /seeds/menu-items/ */
export const createSeedMenuItem = async (
  data: SeedMenuItemPayload,
  token?: string
): Promise<SeedMenuItem> => {
  const config = getConfig("/seeds/menu-items/", "POST", token, data);
  return logResponse<SeedMenuItem>(
    "seeds",
    "POST /seeds/menu-items/",
    bookiesAxiosInstance(config)
  );
};

/** GET /seeds/menu-items/{id}/ */
export const getSeedMenuItem = async (
  id: string,
  token?: string
): Promise<SeedMenuItem> => {
  const config = getConfig(`/seeds/menu-items/${id}/`, "GET", token);
  return logResponse<SeedMenuItem>(
    "seeds",
    `GET /seeds/menu-items/${id}/`,
    bookiesAxiosInstance(config)
  );
};

/** PATCH /seeds/menu-items/{id}/ */
export const patchSeedMenuItem = async (
  id: string,
  data: SeedMenuItemPatchPayload,
  token?: string
): Promise<SeedMenuItem> => {
  const config = getConfig(`/seeds/menu-items/${id}/`, "PATCH", token, data);
  return logResponse<SeedMenuItem>(
    "seeds",
    `PATCH /seeds/menu-items/${id}/`,
    bookiesAxiosInstance(config)
  );
};

/** DELETE /seeds/menu-items/{id}/ — returns 204 with no body. */
export const deleteSeedMenuItem = async (
  id: string,
  token?: string
): Promise<void> => {
  const config = getConfig(`/seeds/menu-items/${id}/`, "DELETE", token);
  return logResponse<void>(
    "seeds",
    `DELETE /seeds/menu-items/${id}/`,
    bookiesAxiosInstance(config)
  );
};
