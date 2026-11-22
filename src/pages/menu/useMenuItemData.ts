import { getMenuItems } from "@/api-services/menu.service";
import { parseError } from "@/api-services/utils/parseError";
import { useAuth } from "@/contexts/AuthContext";
import { updateMenuItemsData, updateMenuItemsTotal } from "@/store/menu.slice";

import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";

/**
 * Store key holding the FULL menu-item list. The menu-items endpoint is not
 * paginated (it returns every item), so the list lives under one key and the
 * page paginates client-side. AddDish appends new dishes under this key.
 */
export const MENU_LIST_KEY = "1";

export function useMenuItemsData() {
  const dispatch = useDispatch();
  const { restaurants, token } = useAuth();
  const restaurantId = restaurants?.[0]?.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAllData = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      setError("");

      const response = await getMenuItems(restaurantId, token);
      const list = Array.isArray(response) ? response : [];

      dispatch(updateMenuItemsData({ key: MENU_LIST_KEY, data: list }));
      dispatch(updateMenuItemsTotal(list.length));
    } catch (err) {
      setError(parseError(err) || "Failed to fetch menu items.");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, token, dispatch]);

  return {
    loading,
    error,
    fetchAllData,
  };
}
