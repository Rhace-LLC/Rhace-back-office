import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import dashboardReducer from "./dashboard.slice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    dashboard: dashboardReducer
    // Add more slices here
  },
  devTools: import.meta.env.MODE !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
