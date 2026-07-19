import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export const Unit = {
  kg: "kg",
  g: "g",
  lb: "lb",
  oz: "oz",
  L: "L",
  mL: "mL",
  box: "box",
  case: "case",
  bag: "bag",
  bunch: "bunch",
  piece: "piece",
  each: "each",
  dozen: "dozen",
  pack: "pack",
  bottle: "bottle",
  can: "can",
  jar: "jar",
  liter: "liter",
  gallon: "gallon",
  pint: "pint",
  quart: "quart",
} as const;

export type Unit = (typeof Unit)[keyof typeof Unit];

// ---------------- Types ----------------
export interface InventoryItem {
  id: number;
  name: string;
  is_allergen: boolean;
  quantity: number;
  unit: string;
  threshold: number;
  available: boolean;
  created: string; // ISO datetime string
  updated: string; // ISO datetime string
  restaurant: string;
}

interface InventoryState {
  data: Record<string, InventoryItem[]>; // paginated
  data_total: number;
}

const initialState: InventoryState = {
  data: {},
  data_total: 0,
};

// ---------------- Helper ----------------
function uniqueBy<T, K extends keyof T>(items: T[], key: K): T[] {
  const seen = new Set<T[K]>();
  return items.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

// ---------------- Slice ----------------
const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    updateInventoryData: (
      state,
      action: PayloadAction<{ key: string; data: InventoryItem[] }>
    ) => {
      const { key, data } = action.payload;
      state.data[key] = uniqueBy([...(state.data[key] || []), ...data], "id");
    },

    appendInventoryItem: (
      state,
      action: PayloadAction<{ key: string; item: InventoryItem }>
    ) => {
      const { key, item } = action.payload;
      state.data[key] = uniqueBy([...(state.data[key] || []), item], "id");
    },

    updateInventoryDataById: (state, action: PayloadAction<InventoryItem>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      });
    },

    removeInventoryDataById: (state, action: PayloadAction<string>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].filter(
          (item) => String(item.id) !== action.payload
        );
      });
    },

    clearInventoryData: (state) => {
      state.data = {};
    },

    updateInventoryTotal: (state, action: PayloadAction<number>) => {
      state.data_total = action.payload;
    },
  },
});

export const {
  updateInventoryData,
  appendInventoryItem,
  updateInventoryDataById,
  removeInventoryDataById,
  clearInventoryData,
  updateInventoryTotal,
} = inventorySlice.actions;

export default inventorySlice.reducer;
