import { getAllCategories } from "@/api-services/menu.service";
import { parseError } from "@/api-services/utils/parseError";
import { useAuth } from "@/contexts/AuthContext";
import { updateCategoryData, updateCategoryTotal } from "@/store/category.slice";

import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
// adjust path

export function useCategoryData(page: number) {
  const dispatch = useDispatch();

  const auth = useAuth()

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getAllCategories(auth.restaurants[0].id, auth.token);

      // store paginated data
      dispatch(updateCategoryData({ key: String(page), data: res }));

      // update total (if you want dynamic total, replace 69)
      dispatch(updateCategoryTotal({ data_total: 69 }));
    } catch (err) {
      console.error(err);
      setError(parseError(err) || "Failed to fetch categories.");
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
