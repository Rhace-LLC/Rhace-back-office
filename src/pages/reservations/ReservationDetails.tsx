import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";
import { Reservation } from "@/api-services/order.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, CheckCircle, Table, RefreshCcw, Clock, Users, Phone, Mail, XCircle } from "lucide-react";
import { ReservationStatus } from "./re";

interface ReservationDetailProps {
  reservation?: Reservation | null;
  onAssignTable?: (reservationId: string, tableId: string) => void;
  onUpdateStatus?: (reservationId: string, status: ReservationStatus) => void;
  onConfirmReservation?: (reservationId: string) => void;
  onCancelReservation?: (reservationId: string) => void;
  onCompleteReservation?: (reservationId: string) => void;
}

const DetailItem: React.FC<{ label: string; value: string | number | undefined | null; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm border overflow-hidden">
    <div className="text-gray-400 pt-1 flex-shrink-0">{icon}</div>
    <div className="flex flex-col min-w-0">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900 break-words truncate">
        {value || "—"}
      </span>
    </div>
  </div>
);

const getStatusColor = (status: ReservationStatus) => {
  switch (status) {
    case "confirmed": return "text-green-700 bg-green-100 border-green-200";
    case "cancelled": return "text-red-700 bg-red-100 border-red-200";
    case "completed": return "text-blue-700 bg-blue-100 border-blue-200";
    case "pending":
    default: return "text-amber-700 bg-amber-100 border-amber-200";
  }
};

export const ReservationDetail: React.FC<ReservationDetailProps> = ({
  reservation,
  onAssignTable,
  onUpdateStatus,
  onConfirmReservation,
  onCancelReservation,
  onCompleteReservation,
}) => {
  const [tableId, setTableId] = useState("");
  const [status, setStatus] = useState<ReservationStatus>(reservation?.status ?? "pending");

  useEffect(() => {
    setStatus(reservation?.status ?? "pending");
  }, [reservation]);

  if (!reservation) return null;

  const handleAssignTable = async () => {
    if (!onAssignTable) return;
    try {
      await onAssignTable(String(reservation.id), tableId);
      toast.success("Table assigned successfully");
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to assign table");
    }
  };

  const handleStatusUpdate = async () => {
    if (!onUpdateStatus) return;
    try {
      await onUpdateStatus(String(reservation.id), status);
      toast.success("Status updated successfully");
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to update status");
    }
  };

  const handleConfirm = async () => {
    if (!onConfirmReservation) return;
    try {
      await onConfirmReservation(String(reservation.id));
      toast.success("Reservation confirmed");
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to confirm reservation");
    }
  };

  const handleCancel = async () => {
    if (!onCancelReservation) return;
    try {
      await onCancelReservation(String(reservation.id));
      toast.success("Reservation cancelled");
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to cancel reservation");
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
    <div className="flex flex-col h-full p-4 space-y-6 ">
      {/* Header */}
      <header className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">
          Reservation #{String(reservation.id).slice(0, 8)}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {reservation.customer.first_name} {reservation.customer.last_name}'s booking.
        </p>
        <div className={`mt-3 inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(reservation.status)}`}>
          Status: <span className="uppercase">{reservation.status}</span>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="details" className="flex flex-col flex-grow">
        <TabsList className="grid grid-cols-2 bg-gray-100 rounded-md">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <div className="flex-grow pt-4 overflow-y-auto pr-2">

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Customer Info */}
            {/* Booking Time */}
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center"><Calendar className="h-4 w-4 mr-2"/> Booking Time</h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Date" value={new Date(reservation.date).toLocaleDateString()} icon={<Calendar className="h-4 w-4"/>}/>
                <DetailItem label="Time" value={reservation.time} icon={<Clock className="h-4 w-4"/>}/>
              </div>
            </section>
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center"><User className="h-4 w-4 mr-2"/> Customer Info</h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Full Name" value={`${reservation.customer.first_name} ${reservation.customer.last_name}`} icon={<User className="h-4 w-4"/>}/>
                <DetailItem label="Party Size" value={reservation.party_size} icon={<Users className="h-4 w-4"/>}/>
                <DetailItem label="Phone" value={reservation.customer.phone} icon={<Phone className="h-4 w-4"/>}/>
                <DetailItem label="Email" value={reservation.customer.email} icon={<Mail className="h-4 w-4"/>}/>
              </div>
            </section>


          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">

            {/* Pending => Confirm */}
            {reservation.status === "pending" && onConfirmReservation && (
              <div className="p-4 rounded-lg border bg-green-50 border-green-200 space-y-3">
                <h4 className="flex items-center text-green-700 font-semibold"><CheckCircle className="h-5 w-5 mr-2"/> Confirm Reservation</h4>
                <p className="text-sm text-green-600">Confirm this reservation to notify the customer and mark it active.</p>
                <Button onClick={handleConfirm} className="w-full bg-green-600 hover:bg-green-700">Confirm</Button>
              </div>
            )}

            {/* Confirmed => Complete & Cancel */}
            {reservation.status === "confirmed" && (
              <div className="space-y-4">
                {/* Complete */}
                {onCompleteReservation && (
                  <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 space-y-2">
                    <h4 className="flex items-center text-blue-700 font-semibold"><CheckCircle className="h-5 w-5 mr-2"/> Complete Reservation</h4>
                    <p className="text-sm text-blue-600">Mark this reservation as completed after the party has finished.</p>
                    <Button onClick={handleComplete} className="w-full bg-blue-600 hover:bg-blue-700">Complete</Button>
                  </div>
                )}
                {/* Cancel */}
                {onCancelReservation && (
                  <div className="p-4 rounded-lg border bg-red-50 border-red-200 space-y-2">
                    <h4 className="flex items-center text-red-700 font-semibold"><XCircle className="h-5 w-5 mr-2"/> Cancel Reservation</h4>
                    <p className="text-sm text-red-600">Cancel this reservation if needed. The customer will be notified immediately.</p>
                    <Button onClick={handleCancel} className="w-full bg-red-600 hover:bg-red-700">Cancel</Button>
                  </div>
                )}
              </div>
            )}

            {/* Assign Table */}
            {onAssignTable && (
              <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 space-y-2">
                <h4 className="flex items-center text-gray-700 font-semibold"><Table className="h-4 w-4 mr-2"/> Assign Table</h4>
                <Label htmlFor="table-id">Table ID</Label>
                <div className="flex space-x-2">
                  <Input id="table-id" value={tableId} onChange={(e) => setTableId(e.target.value)} className="flex-1"/>
                  <Button onClick={handleAssignTable} disabled={!tableId} className="bg-indigo-600 hover:bg-indigo-700">Assign</Button>
                </div>
              </div>
            )}

            {/* Update Status (Optional) */}
            {onUpdateStatus && (
              <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 space-y-2">
                <h4 className="flex items-center text-gray-700 font-semibold"><RefreshCcw className="h-4 w-4 mr-2"/> Change Status</h4>
                <Label htmlFor="status-select">Select Status</Label>
                <select
                  id="status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReservationStatus)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button onClick={handleStatusUpdate} className="w-full bg-gray-800 hover:bg-gray-900 mt-2">Update Status</Button>
              </div>
            )}
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
};
