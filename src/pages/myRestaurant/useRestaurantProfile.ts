// useRestaurantProfile.ts
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parseError } from "@/api-services/utils/parseError";
import { RootState } from "@/store/store";
import { useAuth } from "@/contexts/AuthContext";
import { setProfile } from "@/store/restaurantProfile";
import {
  getRestaurantProfile,
  RestaurantProfile,
} from "@/api-services/restaurantProfile";

export const useRestaurantProfile = () => {
  const dispatch = useDispatch();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const profile = useSelector(
    (state: RootState) => state.restaurantProfile.profile
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res: RestaurantProfile = await getRestaurantProfile(
        auth.restaurants[0].id,
        auth.token
      );
      console.log("profile res", res);
      dispatch(setProfile(res));
    } catch (err) {
      setError(parseError(err) || "Failed to fetch restaurant profile.");
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
  };
};
