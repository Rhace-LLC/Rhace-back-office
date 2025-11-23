import { UserProfile } from "@/api-services/auth.service";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: "",
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;

export default profileSlice.reducer;
