import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { parseError } from "@/api-services/utils/parseError";
import { getTables } from "@/api-services/menu.service";
import { updateTableData } from "@/store/table.slice";
import { useAuth } from "@/contexts/AuthContext";

interface UseTableDataProps {
  page?: number;
  page_size?: number;
}

export const useTableData = ({
  page = 1,
  page_size = 10,
}: UseTableDataProps) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const fetchAllData = useCallback(async () => {
    try {
      setFetchLoading(true);
      setFetchError("");
      const res = await getTables(
        auth.restaurants[0].id,
        { page, page_size },
        auth.token
      );
      dispatch(updateTableData({ key: String(page), data: res }));
    } catch (error) {
      setFetchError(parseError(error) || "Failed to fetch table data.");
    } finally {
      setFetchLoading(false);
    }
  }, [auth.restaurants, auth.token, dispatch, page, page_size]);

  return {
    fetchAllData,
    fetchLoading,
    fetchError,
  };
};
