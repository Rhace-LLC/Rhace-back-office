"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ContentHOC } from "@/components/nocontent";
import { Pagination } from "@/components/pagination";

//import { assignTableApi, fetchAllReservationsApi, updateReservationApi } from "@/api-services/reservation.service"; // implement these in your api layer

import { parseError } from "@/api-services/utils/parseError";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  assignTable,
  getReservations,
  updateReservation,
} from "@/api-services/order.service";

// ---------------------- Types ----------------------
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Reservation {
  id: string;
  reservation_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  date: string; // ISO date
  time: string; // e.g. "19:30"
  party_size: number;
  table_id?: string | null;
  table_name?: string | null;
  status: ReservationStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// ---------------------- Reservation Filters Component ----------------------
interface ReservationFiltersProps {
  filters: { searchTerm: string; status: string; date?: string };
  setFilters: (f: any) => void;
  onSearch: () => void;
}

export const ReservationFilters: React.FC<ReservationFiltersProps> = ({
  filters,
  setFilters,
  onSearch,
}) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
      <div className="flex-1">
        <Label>Search</Label>
        <Input
          placeholder="Search by name, phone or email"
          value={filters.searchTerm}
          onChange={(e) =>
            setFilters({ ...filters, searchTerm: e.target.value })
          }
        />
      </div>

      <div className="w-48">
        <Label>Status</Label>
        <select
          className="mt-1 w-full rounded border p-2"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <Button onClick={onSearch} className="mt-1">
          Search
        </Button>
      </div>
    </div>
  );
};

// ---------------------- RenderReservationTableData Component ----------------------
interface RenderReservationTableDataProps {
  data: Reservation[];
  onView: (r: Reservation) => void;
  onConfirm?: (r: Reservation) => void;
  onCancel?: (r: Reservation) => void;
}

export const RenderReservationTableData: React.FC<
  RenderReservationTableDataProps
> = ({ data, onView, onConfirm, onCancel }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ref</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Party</TableHead>
          <TableHead>Table</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.reservation_id ?? r.id.slice(0, 8)}</TableCell>
            <TableCell>
              <div className="font-medium">{r.customer_name}</div>
              <div className="text-muted-foreground text-sm">
                {r.customer_phone || r.customer_email}
              </div>
            </TableCell>
            <TableCell>
              <div>{new Date(r.date).toLocaleDateString()}</div>
              <div className="text-muted-foreground text-sm">{r.time}</div>
            </TableCell>
            <TableCell>{r.party_size}</TableCell>
            <TableCell>{r.table_name || "—"}</TableCell>
            <TableCell>
              <Badge
                variant={
                  r.status === "confirmed"
                    ? "secondary"
                    : r.status === "cancelled"
                      ? "destructive"
                      : "outline"
                }
              >
                {r.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <button
                  className="bg-muted text-muted-foreground rounded px-2 py-1 text-sm hover:opacity-90"
                  onClick={() => onView(r)}
                >
                  View details
                </button>

                {r.status !== "confirmed" && onConfirm && (
                  <button
                    className="rounded bg-green-50 px-2 py-1 text-sm text-green-700 hover:opacity-90"
                    onClick={() => onConfirm(r)}
                  >
                    Confirm
                  </button>
                )}

                {r.status !== "cancelled" && onCancel && (
                  <button
                    className="rounded bg-red-50 px-2 py-1 text-sm text-red-700 hover:opacity-90"
                    onClick={() => onCancel(r)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// ---------------------- ReservationDetail (Sheet) ----------------------
interface ReservationDetailProps {
  open: boolean;
  reservation?: Reservation | null;
  onClose: () => void;
  onAssignTable?: (reservationId: string, tableId: string) => Promise<void>;
  onUpdateStatus?: (
    reservationId: string,
    status: ReservationStatus
  ) => Promise<void>;
}

export const ReservationDetail: React.FC<ReservationDetailProps> = ({
  open,
  reservation,
  onClose,
  onAssignTable,
  onUpdateStatus,
}) => {
  const [tableId, setTableId] = useState("");
  const [status, setStatus] = useState<ReservationStatus>(
    reservation?.status ?? "pending"
  );

  useEffect(() => {
    setStatus(reservation?.status ?? "pending");
  }, [reservation]);

  if (!reservation) return null;

  const handleAssign = async () => {
    if (!onAssignTable) return;
    try {
      await onAssignTable(reservation.id, tableId);
      toast.success("Table assigned");
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to assign table");
    }
  };

  const handleStatusUpdate = async () => {
    if (!onUpdateStatus) return;
    try {
      await onUpdateStatus(reservation.id, status);
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to update status");
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Reservation Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <div>
            <div className="text-muted-foreground text-sm">Customer</div>
            <div className="font-medium">{reservation.customer_name}</div>
            <div className="text-sm">{reservation.customer_phone}</div>
            <div className="text-sm">{reservation.customer_email}</div>
          </div>

          <div>
            <div className="text-muted-foreground text-sm">When</div>
            <div className="font-medium">
              {new Date(reservation.date).toLocaleDateString()} @{" "}
              {reservation.time}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-sm">Party Size</div>
            <div className="font-medium">{reservation.party_size}</div>
          </div>

          <div>
            <div className="text-muted-foreground text-sm">Table</div>
            <div className="font-medium">
              {reservation.table_name || "Not assigned"}
            </div>
          </div>

          <div>
            <Label>Assign Table</Label>
            <Input
              placeholder="Table ID"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
            />
            <div className="mt-2 flex gap-2">
              <Button onClick={handleAssign}>Assign</Button>
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReservationStatus)}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="mt-2 flex gap-2">
              <Button onClick={handleStatusUpdate}>Update Status</Button>
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-sm">Notes</div>
            <div className="font-medium whitespace-pre-wrap">
              {reservation.notes || "—"}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ---------------------- Main Page: ManageReservation ----------------------
export const ManageReservation: React.FC = () => {
  const auth = useAuth();
  const reservationsState = useSelector((s: RootState) => s.reservation);

  const [viewState, setViewState] = useState<"normal" | "search" | "filter">(
    "normal"
  );
  const [page, setPage] = useState(1);
  const page_size = 10;
  const [totalItems, setTotalItems] = useState(0);
  const total_pages = Math.ceil(totalItems / page_size);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState<any>({ searchTerm: "", status: "" });

  const [dataDisposable, setDataDisposable] = useState<
    Record<string, Reservation[]>
  >({});

  const toShow = useMemo(() => {
    if (viewState === "normal")
      return reservationsState.data[String(page)] ?? [];
    return dataDisposable[String(page)] ?? [];
  }, [reservationsState.data, dataDisposable, page, viewState]);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  // ========== API CALLS ==========
  const fetchAllReservations = async () => {
    try {
      setLoading(true);
      setError("");
      // If you have a redux action: dispatch(fetchAllReservations({ page, page_size }))
      // For demo, we'll call a service
      const res = await getReservations(auth.token, { page, page_size });
      // expect { data: Reservation[], total: number }
      // dispatch to redux if you want
      // dispatch(updateReservations({ key: String(page), data: res.data }));
      // dispatch(updateReservationsTotal({ data_total: res.total }));

      // For now set local
      setDataDisposable((prev) => ({ ...prev, [String(page)]: res.data }));
      setTotalItems(res?.total ?? 100);
    } catch (err) {
      console.error(err);
      setError(parseError(err) || "Failed to fetch reservations");
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
        ...filters,
      });
      setDataDisposable((prev) => ({ ...prev, [String(page)]: res.data }));
      setTotalItems(res.total);
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
    if (viewState === "filter" || viewState === "search") {
      const pageData = dataDisposable[String(page)];
      if (!pageData) fetchAllReservationsWithFilters();
    }
  }, [page, viewState, dataDisposable, filters]);

  useEffect(() => setPage(1), [viewState]);

  useEffect(() => {
    if (filters.status || filters.searchTerm.trim()) {
      setPage(1);
      setViewState("filter");
      setDataDisposable({});
      fetchAllReservationsWithFilters();
    } else {
      setViewState("normal");
      setDataDisposable({});
    }
  }, [filters.status]);

  // ========== Handlers ==========
  const onSearch = () => {
    setPage(1);
    setDataDisposable({});
    setViewState("search");
    fetchAllReservationsWithFilters();
  };

  const handleView = (r: Reservation) => {
    setSelectedReservation(r);
    setSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setSheetOpen(false);
    setSelectedReservation(null);
  };

  const handleConfirm = async (r: Reservation) => {
    try {
      setLoading(true);
      await updateReservation(r.id, { status: "confirmed" });
      toast.success("Reservation confirmed");
      // refresh
      fetchAllReservations();
    } catch (err) {
      toast.error(parseError(err) || "Failed to confirm");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (r: Reservation) => {
    try {
      setLoading(true);
      await updateReservation(r.id, { status: "cancelled" });
      toast.success("Reservation cancelled");
      fetchAllReservations();
    } catch (err) {
      toast.error(parseError(err) || "Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTable = async (reservationId: string, tableId: string) => {
    try {
      setLoading(true);
      await assignTable(reservationId, { table_id: tableId });
      toast.success("Table assigned");
      fetchAllReservations();
      setSelectedReservation((prev) =>
        prev ? { ...prev, table_id: tableId, table_name: tableId } : prev
      );
    } catch (err) {
      toast.error(parseError(err) || "Failed to assign table");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    reservationId: string,
    status: ReservationStatus
  ) => {
    try {
      setLoading(true);
      await updateReservation(reservationId, { status });
      toast.success("Status updated");
      fetchAllReservations();
    } catch (err) {
      toast.error(parseError(err) || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
      <div className="mx-auto space-y-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-medium tracking-tight">
              Reservations
            </h3>
            <p>Manage reservations, assign tables and update statuses.</p>
          </div>
          <ReservationFilters
            filters={filters}
            setFilters={setFilters}
            onSearch={onSearch}
          />

          <div>
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
              <RenderReservationTableData
                data={toShow}
                onView={handleView}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            </ContentHOC>
          </div>
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={total_pages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Reservation Detail Sheet */}
      <ReservationDetail
        open={sheetOpen}
        reservation={selectedReservation}
        onClose={handleCloseSheet}
        onAssignTable={handleAssignTable}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default ManageReservation;
