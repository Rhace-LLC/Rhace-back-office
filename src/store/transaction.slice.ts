import {
  Pagination,
  Transaction,
} from "@/api-services/subaccountpayout.service";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TransactionState {
  data: Record<string, Transaction[]>; // paginated by page number
  pagination: Pagination;
}

const initialState: TransactionState = {
  data: {},
  pagination: {
    total: 0,
    page: 1,
    per_page: 10,
    page_count: 0,
  },
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
const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    updateTransactionData: (
      state,
      action: PayloadAction<{ key: string; data: Transaction[] }>
    ) => {
      const { key, data } = action.payload;
      state.data[key] = uniqueBy([...(state.data[key] || []), ...data], "id");
    },
    updateTransactionDataById: (state, action: PayloadAction<Transaction>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      });
    },

    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },

    removeTransactionDataById: (state, action: PayloadAction<string>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].filter(
          (item) => String(item.id) !== action.payload
        );
      });
    },
    clearTransactionData: (state) => {
      state.data = {};
    },
  },
});

export const {
  updateTransactionData,
  updateTransactionDataById,
  removeTransactionDataById,
  clearTransactionData,
  setPagination,
} = transactionSlice.actions;

export default transactionSlice.reducer;
