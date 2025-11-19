import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Import Button for a better action look
import { Users, Clock, Hash } from "lucide-react"; // Icons for minimalist headers
import { Reservation } from "@/api-services/order.service";
import GenericSheet from "@/components/generic_sheet_overlay";
import { ReservationDetail } from "./ReservationDetails";
import moment from "moment";

// Assuming Reservation type is defined elsewhere
// import { Reservation } from "@/api-services/order.service";
// import { ReservationDetail } from "./ReservationDetails";
// import GenericSheet from "@/components/generic_sheet_overlay";
interface RenderReservationTableDataProps {
  data: Reservation[];
}

const formatRelativeDate = (dateString: string) => {
  const date = moment(dateString).startOf("day");
  const today = moment().startOf("day");

  const diff = date.diff(today, "days"); // future = positive, past = negative

  // Today
  if (diff === 0) return "Today";

  // Tomorrow
  if (diff === 1) return "Tomorrow";

  // Yesterday
  if (diff === -1) return "Yesterday";

  // Future (in X days)
  if (diff > 1 && diff <= 7) return `In ${diff} days`;

  // Past (X days ago)
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)} days ago`;

  // Fallback for anything beyond ±7 days
  return date.format("MMM D");
};

// Helper to define modern badge styles based on status
const getStatusBadgeProps = (status: Reservation["status"]) => {
  switch (status) {
    case "confirmed":
      // Accent color (e.g., green/indigo) for positive status
      return {
        className:
          "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 font-medium",
        variant: "default",
      };
    case "confirmed":
      // Primary action/in-progress color (e.g., blue/teal)
      return {
        className:
          "bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100 font-medium",
        variant: "default",
      };
    case "cancelled":
      // Destructive color (red)
      return {
        className:
          "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 font-medium",
        variant: "default",
      };
    case "pending":
    default:
      // Neutral/waiting color
      return {
        className:
          "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 font-medium",
        variant: "default",
      };
  }
};

export const RenderReservationTableData: React.FC<
  RenderReservationTableDataProps
> = ({ data }) => {
  const [selectedReservation, setSelectedReservation] = useState<Reservation>();

  return (
    // Outer div for context and potential container styling
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <Table className="w-full">
        <TableHeader className="border-b bg-gray-50">
          <TableRow className="hover:bg-gray-50">
            <TableHead className="w-[100px] text-xs font-semibold tracking-wider text-gray-500 uppercase">
              <Hash className="mr-1 inline h-3 w-3" /> Ref
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Customer
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase">
              <Clock className="mr-1 inline h-3 w-3" /> Time
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              <Users className="mr-1 inline h-3 w-3" /> Guests
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Status
            </TableHead>
            <TableHead className="text-right text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                No reservations found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((r, index) => (
              // Row with hover effect to indicate clickability
              <TableRow
                key={index}
                onClick={() => setSelectedReservation(r)}
                className="cursor-pointer transition-colors duration-150 hover:bg-indigo-50/50"
              >
                {/* Reference ID */}
                <TableCell className="font-mono text-xs text-gray-600">
                  {index + 1}
                </TableCell>

                {/* Customer Info */}
                <TableCell>
                  <div className="font-semibold text-gray-800">
                    {r.customer.first_name} {r.customer.last_name}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {r.customer.phone || r.customer.email}
                  </div>
                </TableCell>

                <TableCell className="text-sm">
                  <div className="font-medium whitespace-nowrap text-gray-700">
                    {moment(r.time, "HH:mm:ss").format("hh:mm A")}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {moment(r.date).format("MMM D")}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {formatRelativeDate(r.date)}
                  </div>
                </TableCell>

                {/* Party Size */}
                <TableCell className="text-center font-semibold text-gray-700">
                  {r.party_size}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    className={
                      getStatusBadgeProps(r.status).className +
                      " rounded-full px-2.5 py-1 text-xs capitalize"
                    }
                  >
                    {r.status}
                  </Badge>
                </TableCell>

                {/* Actions (Simplified for minimalist aesthetic) */}
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    // Stop propagation to prevent row click from triggering twice
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReservation(r);
                    }}
                    className="text-xs font-medium hover:bg-gray-100"
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Detail Sheet */}
      {selectedReservation && (
        <GenericSheet
          open={!!selectedReservation}
          onOpenChange={() => {
            setSelectedReservation(undefined);
          }}
          title={""}
        >
          <ReservationDetail
            reservation={selectedReservation}
            // Retain the original placeholder functions
            onAssignTable={() => {}}
            onUpdateStatus={() => {}}
            onConfirmReservation={() => {}}
          />
        </GenericSheet>
      )}
    </div>
  );
};
