import { getMenuItems } from "@/api-services/menu.service";
import { parseError } from "@/api-services/utils/parseError";
import { useAuth } from "@/contexts/AuthContext";
import { updateMenuItemsData, updateMenuItemsTotal } from "@/store/menu.slice";

import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";

export function useMenuItemsData(page: number) {
  const dispatch = useDispatch();
  const auth = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMenuItems(auth.restaurants[0].id, auth.token);

      // store paginated data by page
      dispatch(updateMenuItemsData({ key: String(page), data: response }));

      // update total dynamically if needed
      dispatch(updateMenuItemsTotal(100));
    } catch (err) {
      console.error(err);
      setError(parseError(err) || "Failed to fetch menu items.");
    } finally {
      setLoading(false);
    }
  }, [auth, dispatch, page]);

  return {
    loading,
    error,
    fetchAllData,
  };
}
