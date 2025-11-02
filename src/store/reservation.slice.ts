import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Reservation } from "../pages/reservations";

interface ReservationState {
  data: Record<string, Reservation[]>; // paginated
}

export const mockReservations: Reservation[] = [
  {
    id: "1",
    customer_name: "John Doe",
    customer_email: "john@example.com",
    customer_phone: "+1234567890",
    date: "2025-11-01",
    time: "19:00",
    party_size: 4,
    table_id: "T1",
    table_name: "Table 1",
    status: "pending",
    notes: "Birthday celebration",
    created_at: "2025-10-31T08:00:00Z",
    updated_at: "2025-10-31T08:00:00Z",
  },
  {
    id: "2",
    customer_name: "Jane Smith",
    customer_email: "jane@example.com",
    customer_phone: "+1234567891",
    date: "2025-11-02",
    time: "20:00",
    party_size: 2,
    table_id: "T3",
    table_name: "Table 3",
    status: "confirmed",
    notes: "Anniversary dinner",
    created_at: "2025-10-31T09:00:00Z",
    updated_at: "2025-10-31T09:30:00Z",
  },
  {
    id: "3",
    customer_name: "Michael Johnson",
    customer_email: "michael@example.com",
    customer_phone: "+1234567892",
    date: "2025-11-03",
    time: "18:30",
    party_size: 3,
    table_id: "T5",
    table_name: "Table 5",
    status: "cancelled",
    notes: "Requested vegan options",
    created_at: "2025-10-31T10:00:00Z",
    updated_at: "2025-10-31T10:30:00Z",
  },
  {
    id: "4",
    customer_name: "Emily Davis",
    customer_email: "emily@example.com",
    customer_phone: "+1234567893",
    date: "2025-11-04",
    time: "19:30",
    party_size: 5,
    table_id: "T2",
    table_name: "Table 2",
    status: "pending",
    notes: "Window seat preferred",
    created_at: "2025-10-31T11:00:00Z",
    updated_at: "2025-10-31T11:00:00Z",
  },
  {
    id: "5",
    customer_name: "David Brown",
    customer_email: "david@example.com",
    customer_phone: "+1234567894",
    date: "2025-11-05",
    time: "20:30",
    party_size: 6,
    table_id: "T6",
    table_name: "Table 6",
    status: "confirmed",
    notes: "",
    created_at: "2025-10-31T12:00:00Z",
    updated_at: "2025-10-31T12:15:00Z",
  },
  {
    id: "6",
    customer_name: "Sophia Wilson",
    customer_email: "sophia@example.com",
    customer_phone: "+1234567895",
    date: "2025-11-06",
    time: "18:00",
    party_size: 2,
    table_id: null,
    table_name: null,
    status: "pending",
    notes: "Allergic to nuts",
    created_at: "2025-10-31T13:00:00Z",
    updated_at: "2025-10-31T13:00:00Z",
  },
  {
    id: "7",
    customer_name: "William Martinez",
    customer_email: "william@example.com",
    customer_phone: "+1234567896",
    date: "2025-11-07",
    time: "19:45",
    party_size: 3,
    table_id: "T4",
    table_name: "Table 4",
    status: "confirmed",
    notes: "",
    created_at: "2025-10-31T14:00:00Z",
    updated_at: "2025-10-31T14:20:00Z",
  },
  {
    id: "8",
    customer_name: "Olivia Garcia",
    customer_email: "olivia@example.com",
    customer_phone: "+1234567897",
    date: "2025-11-08",
    time: "20:15",
    party_size: 4,
    table_id: "T1",
    table_name: "Table 1",
    status: "pending",
    notes: "High chair needed",
    created_at: "2025-10-31T15:00:00Z",
    updated_at: "2025-10-31T15:00:00Z",
  },
  {
    id: "9",
    customer_name: "James Lee",
    customer_email: "james@example.com",
    customer_phone: "+1234567898",
    date: "2025-11-09",
    time: "19:15",
    party_size: 2,
    table_id: "T3",
    table_name: "Table 3",
    status: "cancelled",
    notes: "",
    created_at: "2025-10-31T16:00:00Z",
    updated_at: "2025-10-31T16:10:00Z",
  },
  {
    id: "10",
    customer_name: "Mia Anderson",
    customer_email: "mia@example.com",
    customer_phone: "+1234567899",
    date: "2025-11-10",
    time: "18:45",
    party_size: 5,
    table_id: "T2",
    table_name: "Table 2",
    status: "confirmed",
    notes: "Celebrating promotion",
    created_at: "2025-10-31T17:00:00Z",
    updated_at: "2025-10-31T17:10:00Z",
  },
];
const initialState: ReservationState = {
  data: { "1": mockReservations },
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
          (item) => item.id !== action.payload
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
