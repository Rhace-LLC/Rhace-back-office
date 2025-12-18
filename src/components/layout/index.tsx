import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "@/contexts/AuthContext";
import { clearProfile } from "@/store/userSlice";
import { clearCategoryData } from "@/store/category.slice";
import { clearInventoryData } from "@/store/inventory.slice";
import { clearMenuItemsData } from "@/store/menu.slice";
import { clearReservationData } from "@/store/reservation.slice";
import { resetProfile } from "@/store/restaurantProfile";
import { clearStaffData } from "@/store/staff.slice";
import { resetSubaccountDetails } from "@/store/subaccount.slice";
import { resetSubscriptionState } from "@/store/subscriptions.slice";
import { clearTableData } from "@/store/table.slice";

export const useLogout = () => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = useCallback(() => {
    // Clear auth state from Redux
    auth.logout();

    dispatch(clearProfile());
    dispatch(clearCategoryData());
    dispatch(clearInventoryData());
    dispatch(clearMenuItemsData());
    dispatch(clearReservationData());
    dispatch(resetProfile());
    dispatch(clearStaffData());
    dispatch(resetSubaccountDetails());
    dispatch(resetSubscriptionState());
    dispatch(clearTableData());

    localStorage.removeItem("user");

    // Redirect to login page
    navigate("/login");
  }, [dispatch, navigate]);

  return { logout };
};
