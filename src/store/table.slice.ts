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
export interface Table {
  id: string;
  restaurant_name: string;
  table_number: string;
  qr_code_image: string;
  max_party_size: number;
  is_available: boolean;
  created: string;
  updated: string;
  restaurant: string;
}

export interface TableSummary {
  total_available: number;
  total_unavailable: number;
  total_tables: number;
}

interface TableState {
  data: Record<string, Table[]>; // grouped or paginated by key
  summary: TableSummary;
  data_total: number;
}

// ---------------- Initial State ----------------
const initialState: TableState = {
  data: {},
  summary: {
    total_available: 0,
    total_unavailable: 0,
    total_tables: 0,
  },
  data_total: 0,
};

// ---------------- Slice ----------------
const TableSlice = createSlice({
  name: "Table",
  initialState,
  reducers: {
    // Add or update a table in a specific page/group
    appendTableToPage: (
      state,
      action: PayloadAction<{ key: string; item: Table }>
    ) => {
      const { key, item } = action.payload;
      const current = state.data[key] || [];

      const updated = [item, ...current.filter((d) => d.id !== item.id)];
      state.data[key] = updated;
    },

    updateTableData: (
      state,
      action: PayloadAction<{ key: string; data: Table[] }>
    ) => {
      const { key, data } = action.payload;
      state.data[key] = uniqueBy([...(state.data[key] || []), ...data], "id");
    },

    // Update a single table across all groups
    updateTableDataById: (state, action: PayloadAction<Table>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      });
    },

    // Remove table by ID across all groups
    removeTableDataById: (state, action: PayloadAction<string>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].filter(
          (item) => item.id !== action.payload
        );
      });
    },

    // Update summary
    updateTableSummary: (state, action: PayloadAction<TableSummary>) => {
      state.summary = action.payload;
    },

    // Update total count
    updateTableTotal: (
      state,
      action: PayloadAction<{ data_total: number }>
    ) => {
      state.data_total = action.payload.data_total;
    },

    // Reset everything
    clearTableData: (state) => {
      state.data = {};
      state.summary = {
        total_available: 0,
        total_unavailable: 0,
        total_tables: 0,
      };
      state.data_total = 0;
    },
  },
});

// ---------------- Exports ----------------
export const {
  appendTableToPage,
  updateTableData,
  updateTableDataById,
  removeTableDataById,
  updateTableSummary,
  updateTableTotal,
  clearTableData,
} = TableSlice.actions;

export default TableSlice.reducer;
