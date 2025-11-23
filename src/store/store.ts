import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import dashboardReducer from "./dashboard.slice";
import categoryReducer from "./category.slice";
import menuReducer from "./menu.slice";
import reservationReducer from "./reservation.slice";
import staffReducer from "./staff.slice";
import inventoryReducer from "./inventory.slice";
import tableReducer from "./table.slice";
import restaurantProfileReducer from "./restaurantProfile";
import subscriptionReducer from "./subscriptions.slice";

export const store = configureStore({
  reducer: {
    profile: userReducer,
    dashboard: dashboardReducer,
    category: categoryReducer,
    menu: menuReducer,
    // Add more slices here
    reservations: reservationReducer,
    staff: staffReducer,
    inventory: inventoryReducer,
    table: tableReducer,
    restaurantProfile: restaurantProfileReducer,
    subscriptions: subscriptionReducer,
  },
  devTools: import.meta.env.MODE !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
