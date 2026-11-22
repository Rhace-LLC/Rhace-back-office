import { useStableCallback } from "@/hooks/useStableCallback";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parseError } from "@/api-services/utils/parseError";
import { getInventoryItems } from "@/api-services/inventory.service";
import { RootState } from "@/store/store";
import {
  updateInventoryData,
  updateInventoryTotal,
} from "@/store/inventory.slice";
import { useAuth } from "@/contexts/AuthContext";

interface UseInventoryProps {
  page: number;
  page_size?: number;
}

export const useInventory = ({ page, page_size = 10 }: UseInventoryProps) => {
  const dispatch = useDispatch();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dataStore = useSelector((state: RootState) => state.inventory);
  const allData = dataStore.data[String(page)] || [];

  const fetchAllData = useStableCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getInventoryItems({ page, page_size }, auth.token);
      dispatch(updateInventoryData({ key: String(page), data: res.results }));
      // Total item count across all pages (paginated endpoint) for the pager.
      dispatch(updateInventoryTotal(res.count ?? res.results.length));
    } catch (err) {
      setError(parseError(err) || "Failed to fetch inventory.");
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!allData.length) {
      fetchAllData();
    }
  }, [page, allData.length, fetchAllData]);

  return {
    allData,
    loading,
    error,
    fetchAllData,
  };
};
