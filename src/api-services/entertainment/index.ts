// src/api-services/entertainment/index.ts
import { getConfig } from "../utils/reqConfig";
import { bookiesAxiosInstance } from "../utils/baseUrl";
import { logResponse } from "../utils/logResponse";
import type {
  BuildYourDishPayload,
  BuildYourDishQuestionsResponse,
  BuildYourDishResult,
  DidYouKnowResponse,
} from "./type";

export * from "./type";

/** GET /entertainment/build-your-dish/ */
export const getBuildYourDish = async (
  token?: string
): Promise<BuildYourDishQuestionsResponse> => {
  const config = getConfig("/entertainment/build-your-dish/", "GET", token);
  return logResponse<BuildYourDishQuestionsResponse>(
    "entertainment",
    "GET /entertainment/build-your-dish/",
    bookiesAxiosInstance(config)
  );
};

/** GET /entertainment/did-you-know/ */
export const getDidYouKnow = async (
  token?: string
): Promise<DidYouKnowResponse> => {
  const config = getConfig("/entertainment/did-you-know/", "GET", token);
  return logResponse<DidYouKnowResponse>(
    "entertainment",
    "GET /entertainment/did-you-know/",
    bookiesAxiosInstance(config)
  );
};

/** POST /entertainment/restaurants/{restaurant_id}/build-your-dish/ */
export const createBuildYourDish = async (
  restaurantId: string,
  data: BuildYourDishPayload,
  token?: string
): Promise<BuildYourDishResult> => {
  const config = getConfig(
    `/entertainment/restaurants/${restaurantId}/build-your-dish/`,
    "POST",
    token,
    data
  );
  return logResponse<BuildYourDishResult>(
    "entertainment",
    `POST /entertainment/restaurants/${restaurantId}/build-your-dish/`,
    bookiesAxiosInstance(config)
  );
};
