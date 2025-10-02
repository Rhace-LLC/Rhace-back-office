import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  isAuthenticated: boolean;
  token: string | null;
  email: string | null;
  name: string | null;
  avatar: string | null;
  profile?: string | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  token: null,
  email: null,
  name: null,
  avatar: null,
  profile: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        token: string;
        email: string;
        name?: string;
        avatar?: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.name = action.payload.name ?? null;
      state.avatar = action.payload.avatar ?? null;
    },
    clearUser: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.email = null;
      state.name = null;
      state.avatar = null;
    },
    updateProfile: (
      state,
      action: PayloadAction<{ name?: string; avatar?: string }>
    ) => {
      if (action.payload.name) state.name = action.payload.name;
      if (action.payload.avatar) state.avatar = action.payload.avatar;
    },
  },
});

export const { setUser, clearUser, updateProfile } = userSlice.actions;
export default userSlice.reducer;
