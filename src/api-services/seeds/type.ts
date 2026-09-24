// src/api-services/seeds/type.ts

/** Category embedded in seed menu item responses. */
export interface SeedCategory {
  id: number;
  name: string;
  description: string;
  image: string | null;
  image_url: string | null;
  items_count: number;
  /** ISO timestamp. */
  created_at: string;
  /** ISO timestamp. */
  updated_at: string;
}

/** A seed menu item ingredient line. */
export interface SeedIngredient {
  inventory_item: number;
  quantity: number;
}

/** A seed menu item as returned by the API. */
export interface SeedMenuItem {
  id: string;
  name: string;
  category: SeedCategory;
  description: string;
  /** Serialized as a string by the API (e.g. "9370479"). */
  price: string;
  ingredients: SeedIngredient[];
  display_ingredients: string[];
  allergens: string[];
  image_url: string | null;
  /** e.g. "HH:MM:SS". */
  prep_time: string;
  /** ISO timestamp. */
  created: string;
  /** ISO timestamp. */
  updated: string;
  available: boolean;
  is_special: boolean;
}

/** Body for POST /seeds/categories/. */
export interface SeedCategoryPayload {
  name: string;
  description?: string;
  image?: string;
}

/** Body for PATCH /seeds/categories/{id}/. */
export type SeedCategoryPatchPayload = Partial<SeedCategoryPayload>;

/** GET /seeds/categories/ returns a list. */
export type SeedCategoryListResponse = SeedCategory[];

/** A seed inventory item as returned by the API. */
export interface SeedInventoryItem {
  id: number;
  name: string;
  is_allergen: boolean;
  quantity: number;
  unit: string;
  threshold: number;
  available: boolean;
  is_default: boolean;
  /** ISO timestamp. */
  created: string;
  /** ISO timestamp. */
  updated: string;
}

/** GET /seeds/inventory-items/ returns a list. */
export type SeedInventoryItemListResponse = SeedInventoryItem[];

/** Body for POST /seeds/inventory-items/. */
export interface SeedInventoryItemPayload {
  name: string;
  unit: string;
  threshold?: number;
  available?: boolean;
}

/** Body for PATCH /seeds/inventory-items/{id}/. */
export interface SeedInventoryItemPatchPayload {
  name?: string;
  is_allergen?: boolean;
  quantity?: number;
  unit?: string;
  threshold?: number;
  /** Not in the documented schema, but present on the model. */
  available?: boolean;
}

/** GET /seeds/menu-items/ returns a list. */
export type SeedMenuItemListResponse = SeedMenuItem[];

/** One ingredient line for a seed menu item create/patch. */
export interface SeedIngredientInput {
  inventory_item: number;
  quantity: number;
}

/** Body for POST /seeds/menu-items/. */
export interface SeedMenuItemPayload {
  name: string;
  category_id: number;
  description?: string;
  price?: string;
  /** The backend rejects a JSON string here — it must be a list. */
  ingredients_data?: SeedIngredientInput[];
  image?: string;
  prep_time?: string;
  available?: boolean;
  is_special?: boolean;
}

/** Body for PATCH /seeds/menu-items/{id}/. */
export type SeedMenuItemPatchPayload = Partial<SeedMenuItemPayload>;
