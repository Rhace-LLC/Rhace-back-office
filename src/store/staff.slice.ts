import { StaffMember } from "@/api-services/auth.service";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ---------------- Types ----------------
interface StaffState {
  data: StaffMember[] | null;
}

const initialState: StaffState = {
  data: null,
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
    // Merge new staff list (ensure no duplicates)
    updateStaffData: (state, action: PayloadAction<StaffMember[]>) => {
      if (!state.data) {
        // First load — set directly
        state.data = action.payload;
      } else {
        // Merge then dedupe
        state.data = uniqueBy([...state.data, ...action.payload], "id");
      }
    },

    // Update a single staff member by id
    updateStaffDataById: (state, action: PayloadAction<StaffMember>) => {
      if (!state.data) return;

      state.data = state.data.map((member) =>
        member.id === action.payload.id ? action.payload : member
      );
    },

    // Remove staff member
    removeStaffDataById: (state, action: PayloadAction<string>) => {
      if (!state.data) return;

      state.data = state.data.filter((member) => member.id !== action.payload);
    },

    // Reset staff state (choose null or [])
    clearStaffData: (state) => {
      state.data = null; // reset to null
      // state.data = []; // or use [] if preferred
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
