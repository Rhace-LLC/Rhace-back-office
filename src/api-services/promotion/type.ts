// src/api-services/promotion/type.ts

/** Expanded menu item data for a promotion (empty in captured responses). */
export type PromotionMenuItemData = Record<string, unknown>;

/** A promotion as returned by the API. */
export interface Promotion {
  id: string;
  created_by_name: string;
  restaurant_name: string;
  /** Expanded menu items for this promotion. */
  menu_items_data: PromotionMenuItemData[];
  name: string;
  description: string;
  /** Discount percentage, serialized as a string by the API (e.g. "1.00"). */
  percentage: string;
  /** Date only, e.g. "2026-09-12". */
  start_date: string;
  end_date: string;
  /** Time only, e.g. "10:44:06". */
  end_time: string;
  applies_to_all: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  /** Restaurant UUID. */
  restaurant: string;
  /** Creating user UUID. */
  created_by: string;
  /** Menu item UUIDs the promotion applies to. */
  menu_items: string[];
}

/** Body for creating/updating a promotion. */
export interface PromotionPayload {
  name: string;
  description: string;
  percentage: string;
  start_date: string;
  end_date: string;
  end_time: string;
  applies_to_all: boolean;
  is_active: boolean;
  menu_items: string[];
}

/** Body for partially updating a promotion. */
export type PromotionPatchPayload = Partial<PromotionPayload>;

/**
 * Response of the list endpoint. Confirmed: returns an array (empty array
 * when the restaurant has no promotions).
 */
export type PromotionListResponse = Promotion[];

/** POST /menu/restaurant/{restaurant_id}/promotions/apply/ */
export interface ApplyPromotionsResponse {
  success: string;
  task_id: string;
}

/** POST /menu/restaurant/{restaurant_id}/promotions/{promotion_id}/toggle/ */
export interface TogglePromotionResponse {
  success: string;
  is_active: boolean;
}
