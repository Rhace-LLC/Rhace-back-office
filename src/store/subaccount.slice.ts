import { SubaccountResponse } from "@/api-services/subaccount.service";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

// -----------------------------------------------------
// STATE TYPE
// -----------------------------------------------------
export interface SubaccountState {
  data: SubaccountResponse | null;
}

// -----------------------------------------------------
// INITIAL STATE
// -----------------------------------------------------
const initialState: SubaccountState = {
  data: null,
};

// -----------------------------------------------------
// SLICE
// -----------------------------------------------------
const subaccountSlice = createSlice({
  name: "subaccount",
  initialState,
  reducers: {
    // 🔹 Set the entire subaccount data
    setSubaccountDetails: (
      state,
      action: PayloadAction<SubaccountResponse>
    ) => {
      state.data = action.payload;
    },

    // 🔹 Update partial fields of subaccount data
    updateSubaccountDetails: (
      state,
      action: PayloadAction<Partial<SubaccountResponse>>
    ) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },

    // 🔹 Reset to initial state
    resetSubaccountDetails: (state) => {
      state.data = null;
    },
  },
});

// -----------------------------------------------------
// EXPORT ACTIONS & REDUCER
// -----------------------------------------------------
export const {
  setSubaccountDetails,
  updateSubaccountDetails,
  resetSubaccountDetails,
} = subaccountSlice.actions;

export default subaccountSlice.reducer;
