import { StaffMember } from "@/api-services/auth.service";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ---------------- Types ----------------
interface StaffState {
  data: StaffMember[]; // now a flat array
}

const initialState: StaffState = {
  data: [],
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
const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    // Merge new staff into the list (avoid duplicates)
    updateStaffData: (state, action: PayloadAction<StaffMember[]>) => {
      state.data = uniqueBy([...state.data, ...action.payload], "id");
    },

    // Update a single staff member by id
    updateStaffDataById: (state, action: PayloadAction<StaffMember>) => {
      state.data = state.data.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    },

    // Remove a staff member by id
    removeStaffDataById: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((item) => item.id !== action.payload);
    },

    // Clear all staff data
    clearStaffData: (state) => {
      state.data = [];
    },
  },
});

export const {
  updateStaffData,
  updateStaffDataById,
  removeStaffDataById,
  clearStaffData,
} = staffSlice.actions;

export default staffSlice.reducer;
