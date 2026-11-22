import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { parseError } from "@/api-services/utils/parseError";
import { getTables } from "@/api-services/menu.service";
import { updateTableData, updateTableTotal } from "@/store/table.slice";

/**
 * Store key holding the FULL table list. The tables endpoint is not paginated
 * (it returns every table), so the list lives under one key and pages
 * paginate client-side. ReservationDetails also reads this key.
 */
export const TABLE_LIST_KEY = "1";
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
      const list = Array.isArray(res) ? res : [];
      dispatch(updateTableData({ key: TABLE_LIST_KEY, data: list }));
      dispatch(updateTableTotal({ data_total: list.length }));
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
