import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { getReservations, Reservation } from "@/api-services/order.service";
import { parseError } from "@/api-services/utils/parseError";
import { useAuth } from "@/contexts/AuthContext";
import { updateReservationData } from "@/store/reservation.slice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ContentHOC } from "@/components/nocontent";
import { RenderReservationTableData } from "./ReservationTable";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
//import { ReservationFilters } from "./ReservationFilters";

// ---------------------- Types ----------------------
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export const ManageReservation: React.FC = () => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const viewState = "normal";
  const [page, setPage] = useState(1);
  const page_size = 10;
  //const [totalItems, setTotalItems] = useState(0);
  //const total_pages = Math.ceil(totalItems / page_size);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reservationsState = useSelector((s: RootState) => s.reservations);
  const [dataDisposable, setDataDisposable] = useState<
    Record<string, Reservation[]>
  >({});

  const toShow = reservationsState.data[String(page)] ?? [];
  //const toShowWithFilters = dataDisposable[String(page)] ?? [];

  // ========== API CALLS ==========
  const fetchAllReservations = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getReservations(auth.token, {
        page,
        page_size,
      });
      dispatch(updateReservationData({ key: String(page), data: res }));
    } catch (err) {
      setError(parseError(err) || "Failed to fetch reservations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReservationsWithFilters = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getReservations(auth.token, {
        page,
        page_size,
      });
      setDataDisposable((prev) => ({ ...prev, [String(page)]: res }));
    } catch (err) {
      console.error(err);
      setError(parseError(err) || "Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewState !== "normal") return;
    const pageData = reservationsState.data[String(page)];
    if (!pageData) {
      fetchAllReservations();
    }
  }, [page, viewState]);

  useEffect(() => {
    if (!viewState) {
      const pageData = dataDisposable[String(page)];
      if (!pageData) fetchAllReservationsWithFilters();
    }
  }, [page, viewState, dataDisposable]);

  useEffect(() => setPage(1), [viewState]);

  return (
    <PageContainer>
      <PageHeader
        title="Reservations"
        description="Manage reservations, assign tables and update statuses."
        actions={
          <Button variant="outline" onClick={fetchAllReservations}>
            <RefreshCcw /> Refresh
          </Button>
        }
      />

      <ContentHOC
        loading={loading}
        error={!!error}
        noContent={toShow.length === 0}
        loadingText="Fetching reservations. Please wait."
        noContentMessage="No reservations found"
        noContentBtnText="Reload"
        noContentAction={fetchAllReservations}
        errMessage={error || "Failed to load reservations."}
        actionFn={fetchAllReservations}
      >
        <RenderReservationTableData data={toShow} />
      </ContentHOC>
    </PageContainer>
  );
};
