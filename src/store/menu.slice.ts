import { MenuItem } from "@/api-services/menu.service";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// ---------------- Types ----------------
interface MenuItemsState {
  data: Record<string, MenuItem[]>; // paginated or keyed storage
  data_total: number;
}

const initialState: MenuItemsState = {
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
const menuItemsSlice = createSlice({
  name: "menuItems",
  initialState,
  reducers: {
    updateMenuItemsData: (
      state,
      action: PayloadAction<{ key: string; data: MenuItem[] }>
    ) => {
      const { key, data } = action.payload;
      state.data[key] = uniqueBy([...(state.data[key] || []), ...data], "id");
    },

    updateMenuItemById: (state, action: PayloadAction<MenuItem>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      });
    },
    appendMenuItemToPage: (
      state,
      action: PayloadAction<{ key: string; item: MenuItem }>
    ) => {
      const { key, item } = action.payload;

      const existingPage = state.data[key] || [];

      // Append & ensure uniqueness
      state.data[key] = uniqueBy([...existingPage, item], "id");
    },
    removeMenuItemById: (state, action: PayloadAction<string>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].filter(
          (item) => item.id !== action.payload
        );
      });
    },

    clearMenuItemsData: (state) => {
      state.data = {};
    },

    updateMenuItemsTotal: (state, action: PayloadAction<number>) => {
      state.data_total = action.payload;
    },
  },
});

// ---------------- Exports ----------------
export const {
  updateMenuItemsData,
  updateMenuItemById,
  removeMenuItemById,
  clearMenuItemsData,
  updateMenuItemsTotal,
  appendMenuItemToPage,
} = menuItemsSlice.actions;

export default menuItemsSlice.reducer;
