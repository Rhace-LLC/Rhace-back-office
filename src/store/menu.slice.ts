import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CategoryData } from "./category.slice";

// ---------------- Helper ----------------
export function uniqueBy<T, K extends keyof T>(items: T[], key: K): T[] {
  const seen = new Set<T[K]>();
  return items.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

// ---------------- Types ----------------
export interface MenuDishData {
  id: string;
  name: string;
  category: CategoryData;
  description: string;
  price: string;
  ingredients: {
    inventory_item: number;
    quantity: number;
  }[];
  display_ingredients: string[];
  allergens: string[];
  image_url: string | null;
  prep_time: string;
  created: string;
  updated: string;
  availability: boolean;
}

export interface MenuDishSummary {
  total_type1: number;
  total_type2: number;
  total_type3: number;
}

interface MenuDishState {
  data: Record<string, MenuDishData[]>; // e.g., paginated or grouped by a key
  categoryData: CategoryData[];
  summary: MenuDishSummary;
  data_total: number;
}

// ---------------- Initial State ----------------
const initialState: MenuDishState = {
  data: {},
  categoryData: [],
  summary: {
    total_type1: 0,
    total_type2: 0,
    total_type3: 0,
  },
  data_total: 0,
};

// ---------------- Slice ----------------
const MenuDishSlice = createSlice({
  name: "MenuDish",
  initialState,
  reducers: {
    // Add or update data for a specific group/page
    updatMenuCategoryData: (state, action) => {
      state.categoryData = action.payload;
    },

    // ✅ Clear category data (reset to empty array)
    clearMenuCategoryData: (state) => {
      state.categoryData = [];
    },
    appendMenuDishToPage: (
      state,
      action: PayloadAction<{ key: string; item: MenuDishData }>
    ) => {
      const { key, item } = action.payload;
      const currentPageData = state.data[key] || [];

      // Prepend new item, ensuring no duplicates by ID
      const updatedData = [
        item,
        ...currentPageData.filter((d) => d.id !== item.id),
      ];
      state.data[key] = updatedData;
    },
    updateMenuDishData: (
      state,
      action: PayloadAction<{ key: string; data: MenuDishData[] }>
    ) => {
      const { key, data } = action.payload;
      state.data[key] = uniqueBy([...(state.data[key] || []), ...data], "id");
    },

    // Update a single item across all groups/pages
    updateMenuDishDataById: (state, action: PayloadAction<MenuDishData>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      });
    },

    // Remove item across all keys
    removeMenuDishDataById: (state, action: PayloadAction<number>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].filter(
          (item) => item.id !== String(action.payload)
        );
      });
    },

    // Update summary values
    updateMenuDishSummary: (state, action: PayloadAction<MenuDishSummary>) => {
      state.summary = action.payload;
    },

    // Update total count
    updateMenuDishTotal: (
      state,
      action: PayloadAction<{ data_total: number }>
    ) => {
      state.data_total = action.payload.data_total;
    },

    // Clear all data
    clearMenuDishData: (state) => {
      state.data = {};
      state.summary = {
        total_type1: 0,
        total_type2: 0,
        total_type3: 0,
      };
      state.data_total = 0;
    },
  },
});

// ---------------- Exports ----------------
export const {
  updatMenuCategoryData,
  clearMenuCategoryData,
  appendMenuDishToPage,
  updateMenuDishData,
  updateMenuDishDataById,
  removeMenuDishDataById,
  updateMenuDishSummary,
  updateMenuDishTotal,
  clearMenuDishData,
} = MenuDishSlice.actions;

export default MenuDishSlice.reducer;
