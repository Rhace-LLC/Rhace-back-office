import { getAllCategories } from "@/api-services/menu.service";
import { parseError } from "@/api-services/utils/parseError";
import { useAuth } from "@/contexts/AuthContext";
import {
  updateCategoryData,
  updateCategoryTotal,
} from "@/store/category.slice";

import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";

/**
 * The store key holding the full category list. The categories endpoint is
 * not paginated (it returns every category), so we keep the whole list under
 * one key and paginate client-side. `appendCategoryToPage({ key: "1" })` in
 * the add-category flows relies on this key.
 */
export const CATEGORY_LIST_KEY = "1";

export function useCategoryData() {
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

      const res = await getAllCategories(restaurantId, token);
      const list = Array.isArray(res) ? res : [];

      dispatch(updateCategoryData({ key: CATEGORY_LIST_KEY, data: list }));
      dispatch(updateCategoryTotal({ data_total: list.length }));
    } catch (err) {
      setError(parseError(err) || "Failed to fetch categories.");
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
