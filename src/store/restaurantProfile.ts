import { RestaurantProfile } from "@/api-services/restaurantProfile";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RestaurantProfileState {
  profile: RestaurantProfile | null;
}

const initialState: RestaurantProfileState = {
  profile: null,
};

const restaurantProfileSlice = createSlice({
  name: "restaurantProfile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<RestaurantProfile>) => {
      console.log("action.payload", action.payload);
      state.profile = action.payload;
    },
    updateProfile: (
      state,
      action: PayloadAction<Partial<RestaurantProfile>>
    ) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    resetProfile: (state) => {
      state.profile = null;
    },
  },
});

export const { setProfile, updateProfile, resetProfile } =
  restaurantProfileSlice.actions;

export default restaurantProfileSlice.reducer;
