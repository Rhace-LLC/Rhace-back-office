import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parseError } from "@/api-services/utils/parseError"; // import your function
import { RootState } from "@/store/store"; // you'll need to create this slice
import { useAuth } from "@/contexts/AuthContext";
import { getReservations } from "@/api-services/order.service";
import { updateReservationData } from "@/store/reservation.slice";

interface UseReservationsProps {
  page: number;
  page_size?: number;
  filters?: Record<string, any>; // optional query params
}

export const useReservations = ({
  page,
  page_size = 10,
  filters = {},
}: UseReservationsProps) => {
  const dispatch = useDispatch();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dataStore = useSelector((state: RootState) => state.reservations);
  const allData = dataStore.data[String(page)] || [];

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getReservations(auth.token, {
        page,
        page_size,
        ...filters,
      });
      dispatch(updateReservationData({ key: String(page), data: res }));
    } catch (err) {
      setError(parseError(err) || "Failed to fetch reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!allData.length) {
      fetchAllData();
    }
  }, [page]);

  return {
    allData,
    loading,
    error,
    fetchAllData,
  };
};
