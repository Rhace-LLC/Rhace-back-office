// profileService.ts
import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";

export interface OpeningHour {
  day: string;
  open_time: string;
  close_time: string;
}

export interface RestaurantProfile {
  id: string;
  name: string;
  slug: string;
  slogan: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  description: string | null;
  tags: string[] | null;
  cover_image: string | null;
  cover_image_url: string | null;
  opening_hours: OpeningHour[] | null;
  email: string;
  phone: string;
  logo: string | null;
  logo_url: string | null;
  is_open: boolean;
  avg_rating: number | null;
  rating_count: number;
}

/**
 * Get a specific restaurant profile by ID
 */
export const getRestaurantProfile = async (
  id: string,
  token?: string
): Promise<RestaurantProfile> => {
  const config = getConfig(`/restaurants/get/${id}`, "GET", token);
  return bookiesAxiosInstance(config);
};

/**
 * List all restaurant profiles
 */
export const listRestaurantProfiles = async (
  token?: string
): Promise<RestaurantProfile[]> => {
  const config = getConfig("/restaurants/list/", "GET", token);
  return bookiesAxiosInstance(config);
};

/**
 * Update a specific restaurant profile
 */
export const updateRestaurantProfile = async (
  id: string,
  data: FormData | Partial<RestaurantProfile>,
  token: string
): Promise<RestaurantProfile> => {
  const config = getConfig(`/restaurants/update/${id}`, "PUT", token, data);
  return bookiesAxiosInstance(config);
};

/**
 * Partial update of a restaurant profile
 */

export const patchRestaurantProfile = async (
  id: string,
  data: FormData,
  token: string
): Promise<RestaurantProfile> => {
  const config = getConfig(`/restaurants/update/${id}`, "PATCH", token, data);
  return bookiesAxiosInstance(config);
};
