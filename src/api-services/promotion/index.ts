// src/api-services/promotion/index.ts
import { getConfig } from "../utils/reqConfig";
import { bookiesAxiosInstance } from "../utils/baseUrl";
import { logResponse } from "../utils/logResponse";
import type {
  ApplyPromotionsResponse,
  Promotion,
  PromotionListResponse,
  PromotionPatchPayload,
  PromotionPayload,
  TogglePromotionResponse,
} from "./type";

export * from "./type";

/** GET /menu/restaurant/{restaurant_id}/promotions/ */
export const listPromotions = async (
  restaurantId: string,
  token?: string
): Promise<PromotionListResponse> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/promotions/`,
    "GET",
    token
  );
  return logResponse<PromotionListResponse>(
    "promotion",
    `GET /menu/restaurant/${restaurantId}/promotions/`,
    bookiesAxiosInstance(config)
  );
};

/** GET /menu/restaurant/{restaurant_id}/promotions/{id}/ */
export const getPromotion = async (
  restaurantId: string,
  id: string,
  token?: string
): Promise<Promotion> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/promotions/${id}/`,
    "GET",
    token
  );
  return logResponse<Promotion>(
    "promotion",
    `GET /menu/restaurant/${restaurantId}/promotions/${id}/`,
    bookiesAxiosInstance(config)
  );
};

/** POST /menu/restaurant/{restaurant_id}/promotions/ */
export const createPromotion = async (
  restaurantId: string,
  data: PromotionPayload,
  token?: string
): Promise<Promotion> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/promotions/`,
    "POST",
    token,
    data
  );
  return logResponse<Promotion>(
    "promotion",
    `POST /menu/restaurant/${restaurantId}/promotions/`,
    bookiesAxiosInstance(config)
  );
};

/** PUT /menu/restaurant/{restaurant_id}/promotions/{id}/ */
export const updatePromotion = async (
  restaurantId: string,
  id: string,
  data: PromotionPayload,
  token?: string
): Promise<Promotion> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/promotions/${id}/`,
    "PUT",
    token,
    data
  );
  return logResponse<Promotion>(
    "promotion",
    `PUT /menu/restaurant/${restaurantId}/promotions/${id}/`,
    bookiesAxiosInstance(config)
  );
};

/** PATCH /menu/restaurant/{restaurant_id}/promotions/{id}/ */
export const patchPromotion = async (
  restaurantId: string,
  id: string,
  data: PromotionPatchPayload,
  token?: string
): Promise<Promotion> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/promotions/${id}/`,
    "PATCH",
    token,
    data
  );
  return logResponse<Promotion>(
    "promotion",
    `PATCH /menu/restaurant/${restaurantId}/promotions/${id}/`,
    bookiesAxiosInstance(config)
  );
};

/** DELETE /menu/restaurant/{restaurant_id}/promotions/{id}/ */
export const deletePromotion = async (
  restaurantId: string,
  id: string,
  token?: string
): Promise<void> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/promotions/${id}/`,
    "DELETE",
    token
  );
  return logResponse<void>(
    "promotion",
    `DELETE /menu/restaurant/${restaurantId}/promotions/${id}/`,
    bookiesAxiosInstance(config)
  );
};

/** POST /menu/restaurant/{restaurant_id}/promotions/{promotion_id}/toggle/ */
export const togglePromotion = async (
  restaurantId: string,
  promotionId: string,
  token?: string
): Promise<TogglePromotionResponse> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/promotions/${promotionId}/toggle/`,
    "POST",
    token
  );
  return logResponse<TogglePromotionResponse>(
    "promotion",
    `POST /menu/restaurant/${restaurantId}/promotions/${promotionId}/toggle/`,
    bookiesAxiosInstance(config)
  );
};

/** POST /menu/restaurant/{restaurant_id}/promotions/apply/ */
export const applyPromotions = async (
  restaurantId: string,
  token?: string
): Promise<ApplyPromotionsResponse> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/promotions/apply/`,
    "POST",
    token
  );
  return logResponse<ApplyPromotionsResponse>(
    "promotion",
    `POST /menu/restaurant/${restaurantId}/promotions/apply/`,
    bookiesAxiosInstance(config)
  );
};
