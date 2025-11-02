import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
// ---------------- Types ----------------
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: StockStatus;
}

export const sampleInventoryItems: InventoryItem[] = [
  {
    id: "1",
    name: "Premium Rice (50kg)",
    category: "Food",
    quantity: 120,
    unit: "bags",
    status: "in_stock",
  },
  {
    id: "2",
    name: "Cooking Oil (5L)",
    category: "Food",
    quantity: 85,
    unit: "bottles",
    status: "in_stock",
  },
  {
    id: "3",
    name: "Toilet Tissue Roll",
    category: "Household",
    quantity: 250,
    unit: "packs",
    status: "in_stock",
  },
  {
    id: "4",
    name: "Detergent Powder (1kg)",
    category: "Cleaning",
    quantity: 60,
    unit: "bags",
    status: "low_stock",
  },
  {
    id: "5",
    name: "Cement (50kg)",
    category: "Building Materials",
    quantity: 15,
    unit: "bags",
    status: "low_stock",
  },
  {
    id: "6",
    name: "Paint (20L)",
    category: "Building Materials",
    quantity: 0,
    unit: "buckets",
    status: "out_of_stock",
  },
  {
    id: "7",
    name: "Sugar (25kg)",
    category: "Food",
    quantity: 90,
    unit: "bags",
    status: "in_stock",
  },
  {
    id: "8",
    name: "Floor Cleaner (1L)",
    category: "Cleaning",
    quantity: 200,
    unit: "bottles",
    status: "in_stock",
  },
  {
    id: "9",
    name: "Toothpaste (100ml)",
    category: "Personal Care",
    quantity: 50,
    unit: "boxes",
    status: "low_stock",
  },
  {
    id: "10",
    name: "Hand Sanitizer (500ml)",
    category: "Health & Safety",
    quantity: 0,
    unit: "bottles",
    status: "out_of_stock",
  },
];

interface InventoryState {
  data: Record<string, InventoryItem[]>; // paginated
}

const initialState: InventoryState = {
  data: { "1": sampleInventoryItems },
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
          (item) => item.id !== action.payload
        );
      });
    },
    clearInventoryData: (state) => {
      state.data = {};
    },
  },
});

export const {
  updateInventoryData,
  updateInventoryDataById,
  removeInventoryDataById,
  clearInventoryData,
} = inventorySlice.actions;

export default inventorySlice.reducer;
