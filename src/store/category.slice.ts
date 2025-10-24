import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
export interface CategoryData {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface CategorySummary {
  total_type1: number;
  total_type2: number;
  total_type3: number;
}

interface CategoryState {
  data: Record<string, CategoryData[]>; // e.g., paginated or grouped by a key
  summary: CategorySummary;
  data_total: number;
}

// ---------------- Initial State ----------------
const initialState: CategoryState = {
  data: {},
  summary: {
    total_type1: 0,
    total_type2: 0,
    total_type3: 0,
  },
  data_total: 0,
};

// ---------------- Slice ----------------
const CategorySlice = createSlice({
  name: "Category",
  initialState,
  reducers: {
    // Add or update data for a specific group/page
    appendCategoryToPage: (
      state,
      action: PayloadAction<{ key: string; item: CategoryData }>
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
    updateCategoryData: (
      state,
      action: PayloadAction<{ key: string; data: CategoryData[] }>
    ) => {
      const { key, data } = action.payload;
      state.data[key] = uniqueBy([...(state.data[key] || []), ...data], "id");
    },

    // Update a single item across all groups/pages
    updateCategoryDataById: (state, action: PayloadAction<CategoryData>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      });
    },

    // Remove item across all keys
    removeCategoryDataById: (state, action: PayloadAction<number>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].filter(
          (item) => item.id !== action.payload
        );
      });
    },

    // Update summary values
    updateCategorySummary: (state, action: PayloadAction<CategorySummary>) => {
      state.summary = action.payload;
    },

    // Update total count
    updateCategoryTotal: (
      state,
      action: PayloadAction<{ data_total: number }>
    ) => {
      state.data_total = action.payload.data_total;
    },

    // Clear all data
    clearCategoryData: (state) => {
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
  appendCategoryToPage,
  updateCategoryData,
  updateCategoryDataById,
  removeCategoryDataById,
  updateCategorySummary,
  updateCategoryTotal,
  clearCategoryData,
} = CategorySlice.actions;

export default CategorySlice.reducer;
