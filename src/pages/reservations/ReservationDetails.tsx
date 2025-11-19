import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";
import {
  Reservation,
  updateReservationStatus,
} from "@/api-services/order.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { ReservationStatus } from "./re";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useTableData } from "../tables/useTableData";
import { Table } from "@/store/table.slice";
import GenericDialog from "@/components/generic_sheet_overlay/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useLoading } from "@/contexts/LoadingContext";
import { updateReservationDataById } from "@/store/reservation.slice";

const getStatusColor = (status: ReservationStatus) => {
  switch (status) {
    case "confirmed":
      return "text-green-700 bg-green-100 border-green-200";
    case "cancelled":
      return "text-red-700 bg-red-100 border-red-200";
    case "completed":
      return "text-blue-700 bg-blue-100 border-blue-200";
    case "pending":
    default:
      return "text-amber-700 bg-amber-100 border-amber-200";
  }
};

const DetailItem: React.FC<{
  label: string;
  value: string | number | undefined | null;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="flex items-start space-x-3 overflow-hidden rounded-lg border bg-white p-3 shadow-sm">
    <div className="flex-shrink-0 pt-1 text-gray-400">{icon}</div>
    <div className="flex min-w-0 flex-col">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="truncate text-sm font-semibold break-words text-gray-900">
        {value || "—"}
      </span>
    </div>
  </div>
);

interface ReservationDetailProps {
  reservation?: Reservation | null;
  onAssignTable?: (reservationId: string, tableId: string) => void;
  onUpdateStatus?: (reservationId: string, status: ReservationStatus) => void;
  onConfirmReservation?: (reservationId: string) => void;
  onCancelReservation?: (reservationId: string) => void;
  onCompleteReservation?: (reservationId: string) => void;
}

export const ReservationDetail: React.FC<ReservationDetailProps> = ({
  reservation,
  onAssignTable,
  onConfirmReservation,
  onCompleteReservation,
}) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const { setLoading, setLoadingText } = useLoading();
  const dataStore = useSelector((state: RootState) => state.table);
  const [reasonError, setReasonError] = useState("");
  const [reason, setReason] = useState("");
  const allTables: Table[] = Object.values(dataStore.data).flat();
  const { fetchAllData, fetchLoading, fetchError } = useTableData({
    page: 1,
    page_size: 10,
  });

  useEffect(() => {
    if (!allTables.length) fetchAllData();
  }, [allTables.length, fetchAllData]);

  const [selectedTable, setSelectedTable] = useState<string>("");
  const selectedTableData = allTables.find(
    (x) => String(x.id) == String(selectedTable)
  );
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  if (!reservation) return null;

  const handleAssignTable = async () => {
    if (!onAssignTable || !selectedTable) return;
    try {
      await onAssignTable(String(reservation.id), selectedTable);
      toast.success("Table assigned successfully");
      setAssignDialogOpen(false);
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to assign table");
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setLoadingText("Confirming Reservation...");
      await updateReservationStatus(
        String(reservation.id),
        { status: "confirmed" },
        auth.token
      );
      dispatch(
        updateReservationDataById({ ...reservation, status: "confirmed" })
      );
      toast.success("Reservation confirmed");
      setConfirmDialogOpen(false);
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to confirm reservation");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const handleCancel = async () => {
    // Validate reason
    if (!reason.trim()) {
      setReasonError("A cancellation reason is required.");
      return;
    }
    setReasonError("");

    try {
      setLoading(true);
      setLoadingText("Cancelling Reservation...");

      await updateReservationStatus(
        String(reservation.id),
        { status: "cancelled", reason },
        auth.token
      );

      dispatch(
        updateReservationDataById({
          ...reservation,
          status: "cancelled",
        })
      );

      toast.success("Reservation cancelled");
      setCancelDialogOpen(false);
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to cancel reservation");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const handleComplete = async () => {
    if (!onCompleteReservation) return;
    try {
      await onCompleteReservation(String(reservation.id));
      toast.success("Reservation marked as completed");
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to complete reservation");
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6 p-4">
      {/* Header */}
      <header className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Reservation #{String(reservation.id).slice(0, 8)}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {reservation.customer.first_name} {reservation.customer.last_name}'s
          booking.
        </p>
        <div
          className={`mt-3 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
            reservation.status
          )}`}
        >
          Status: <span className="uppercase">{reservation.status}</span>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="details" className="flex flex-grow flex-col">
        <TabsList className="grid grid-cols-2 rounded-md bg-gray-100">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <div className="flex-grow overflow-y-auto pt-4 pr-2">
          {/* Details Tab */}

          <TabsContent value="details" className="space-y-6">
            {/* Customer Info */}
            {/* Booking Time */}
            <section className="space-y-3">
              <h3 className="flex items-center text-lg font-semibold text-gray-700">
                <Calendar className="mr-2 h-4 w-4" /> Booking Time
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem
                  label="Date"
                  value={new Date(reservation.date).toLocaleDateString()}
                  icon={<Calendar className="h-4 w-4" />}
                />
                <DetailItem
                  label="Time"
                  value={reservation.time}
                  icon={<Clock className="h-4 w-4" />}
                />
              </div>
            </section>
            <section className="space-y-3">
              <h3 className="flex items-center text-lg font-semibold text-gray-700">
                <User className="mr-2 h-4 w-4" /> Customer Info
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem
                  label="Full Name"
                  value={`${reservation.customer.first_name} ${reservation.customer.last_name}`}
                  icon={<User className="h-4 w-4" />}
                />
                <DetailItem
                  label="Party Size"
                  value={reservation.party_size}
                  icon={<Users className="h-4 w-4" />}
                />
                <DetailItem
                  label="Phone"
                  value={reservation.customer.phone}
                  icon={<Phone className="h-4 w-4" />}
                />
                <DetailItem
                  label="Email"
                  value={reservation.customer.email}
                  icon={<Mail className="h-4 w-4" />}
                />
              </div>
            </section>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            {/* Pending => Confirm */}
            {reservation.status === "cancelled" && (
              <div className="mt-6 rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-sm">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <h4 className="text-lg font-semibold text-gray-800">
                    Reservation Cancelled
                  </h4>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  This reservation has been cancelled. No further actions can be
                  taken.
                </p>
              </div>
            )}

            {reservation.status === "pending" && onConfirmReservation && (
              <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
                <h4 className="flex items-center text-lg font-semibold text-green-800">
                  <CheckCircle className="mr-2 h-5 w-5" /> Confirm Reservation
                </h4>
                <p className="text-sm text-green-700">
                  Confirm this reservation to notify the customer and make it
                  officially active.
                </p>
                <Button
                  onClick={() => setConfirmDialogOpen(true)}
                  className="w-full bg-green-600 font-semibold text-white shadow-md transition-all hover:bg-green-700"
                >
                  Confirm Reservation
                </Button>
              </div>
            )}

            {/* Assign Table */}
            {reservation.status !== "cancelled" &&
              reservation.status !== "completed" && (
                <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
                  <h4 className="flex items-center text-lg font-semibold text-gray-800">
                    Assign Table
                  </h4>
                  <Label htmlFor="table-select" className="text-sm">
                    Select Table
                  </Label>

                  {fetchLoading ? (
                    <div className="py-2 text-sm text-gray-500">
                      Loading tables...
                    </div>
                  ) : fetchError ? (
                    <div className="space-y-2">
                      <div className="text-sm text-red-600">{fetchError}</div>
                      <Button
                        onClick={fetchAllData}
                        className="bg-red-600 font-semibold text-white hover:bg-red-700"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : allTables.length === 0 ? (
                    <div className="py-2 text-sm text-gray-500">
                      No tables available.
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <select
                        id="table-select"
                        value={selectedTable || ""}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">-- Select Table --</option>
                        {allTables
                          .filter((x) => x.status !== "occupied")
                          .map((table) => (
                            <option key={table.id} value={table.id}>
                              {table.table_number} ({table.max_party_size} ppl)
                            </option>
                          ))}
                      </select>
                      <Button
                        onClick={() => setAssignDialogOpen(true)}
                        disabled={!selectedTable}
                        className="bg-indigo-600 font-semibold text-white shadow-md transition-all hover:bg-indigo-700"
                      >
                        Assign
                      </Button>
                    </div>
                  )}
                </div>
              )}

            {reservation.status == "confirmed" && (
              <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                <h4 className="flex items-center text-lg font-semibold text-blue-800">
                  <CheckCircle className="mr-2 h-5 w-5" /> Complete Reservation
                </h4>
                <p className="text-sm text-blue-700">
                  Mark this reservation as completed after the party has
                  finished.
                </p>
                <Button
                  onClick={handleComplete}
                  className="w-full bg-blue-600 font-semibold text-white shadow-md transition-all hover:bg-blue-700"
                >
                  Complete
                </Button>
              </div>
            )}
            {(reservation.status === "confirmed" ||
              reservation.status === "pending") && (
              <>
                {/* Divider */}
                <div className="my-6 flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="mx-3 text-sm font-medium text-gray-500">
                    Cancel Reservation
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Neutral Cancel Button */}
                <Button
                  onClick={() => setCancelDialogOpen(true)}
                  className="w-full border border-gray-300 bg-gray-100 font-medium text-gray-800 shadow-sm hover:bg-gray-200"
                >
                  Cancel Reservation
                </Button>
              </>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Dialogs */}
      <GenericDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <div className="space-y-4 p-5">
          <h3 className="text-lg font-semibold text-gray-800">
            Confirm Table Assignment
          </h3>
          <p className="text-sm text-gray-600">
            Are you sure you want to assign table{" "}
            {selectedTableData?.table_number} to this reservation?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setAssignDialogOpen(false)}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignTable}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Confirm
            </Button>
          </div>
        </div>
      </GenericDialog>

      <GenericDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
      >
        <div className="space-y-4 p-5">
          <h3 className="text-lg font-semibold text-gray-800">
            Confirm Reservation
          </h3>
          <p className="text-sm text-gray-600">
            Are you sure you want to confirm this reservation? The customer will
            be notified.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setConfirmDialogOpen(false)}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Confirm
            </Button>
          </div>
        </div>
      </GenericDialog>

      {
        <GenericDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
        >
          <div className="space-y-5 p-5">
            <h4 className="flex items-center text-lg font-semibold text-red-800">
              <XCircle className="mr-2 h-5 w-5" /> Cancel Reservation
            </h4>

            <p className="text-sm text-red-700">
              Provide a reason for cancelling this reservation. The customer
              will be notified immediately.
            </p>

            {/* Reason Textarea */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`w-full rounded-lg border p-3 text-sm outline-none focus:ring-2 ${
                  reasonError
                    ? "border-red-500 ring-red-200"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
                }`}
                rows={4}
                placeholder="Enter reason for cancellation..."
              />
              {reasonError && (
                <p className="text-xs text-red-600">{reasonError}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleCancel}
                className="flex-1 bg-red-600 font-semibold text-white shadow-md hover:bg-red-700"
              >
                Confirm Cancel
              </Button>
              <Button
                onClick={() => setCancelDialogOpen(false)}
                className="flex-1 bg-gray-200 font-semibold text-gray-800 hover:bg-gray-300"
              >
                Close
              </Button>
            </div>
          </div>
        </GenericDialog>
      }
    </div>
  );
};
