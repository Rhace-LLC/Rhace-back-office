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
    updateInventoryTotal: (state, action: PayloadAction<number>) => {
      state.data_total = action.payload;
    },
  },
});

export const {
  updateInventoryData,
  updateInventoryDataById,
  removeInventoryDataById,
  clearInventoryData,
  updateInventoryTotal,
} = inventorySlice.actions;

export default inventorySlice.reducer;
