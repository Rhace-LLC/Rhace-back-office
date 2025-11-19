import { Reservation } from "@/api-services/order.service";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ReservationState {
  data: Record<string, Reservation[]>; // paginated
}

const initialState: ReservationState = {
  data: {},
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
const reservationSlice = createSlice({
  name: "reservation",
  initialState,
  reducers: {
    updateReservationData: (
      state,
      action: PayloadAction<{ key: string; data: Reservation[] }>
    ) => {
      const { key, data } = action.payload;
      state.data[key] = uniqueBy([...(state.data[key] || []), ...data], "id");
    },
    updateReservationDataById: (state, action: PayloadAction<Reservation>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      });
    },
    removeReservationDataById: (state, action: PayloadAction<string>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].filter(
          (item) => String(item.id) !== action.payload
        );
      });
    },
    clearReservationData: (state) => {
      state.data = {};
    },
  },
});

export const {
  updateReservationData,
  updateReservationDataById,
  removeReservationDataById,
  clearReservationData,
} = reservationSlice.actions;

export default reservationSlice.reducer;
