import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QrCode, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateTableDataById } from "@/store/table.slice";
import QRCode from "react-qr-code";
import { useAuth } from "@/contexts/AuthContext";
import GenericDialog from "@/components/generic_sheet_overlay/alert";
import { Table as TableItem } from "@/api-services/tableService";

import { RefreshCcw, Table, X, Check, Utensils } from "lucide-react";
import { useLoading } from "@/contexts/LoadingContext";
import {
//  getWaitersTableAssignments,
  updateTable,
} from "@/api-services/menu.service";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { Input } from "@/components/ui/input";
import { getStaffByRole, Staff } from "@/api-services/staffService";
//  import { getAllStaff } from "@/api-services/auth.service";
import { parseError } from "@/api-services/utils/parseError";

export type TableStatus = "free" | "occupied" | "needs_cleaning";
const StatusLabelToValue: Record<string, TableStatus> = {
  Open: "free",
  Occupied: "occupied",
  "Needs Cleaning": "needs_cleaning",
};
const TableStatusLabels = ["Open", "Occupied", "Needs Cleaning"] as const;

const getStatusProps = (label: string) => {
  switch (label) {
    case "Open":
      return {
        icon: Table,
        color: "text-green-600 bg-green-50 border-green-200 hover:bg-green-100",
        ring: "focus-within:ring-green-500",
      };
    case "Occupied":
      return {
        icon: Utensils,
        color: "text-red-600 bg-red-50 border-red-200 hover:bg-red-100",
        ring: "focus-within:ring-red-500",
      };
    case "Needs Cleaning":
      return {
        icon: X,
        color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100",
        ring: "focus-within:ring-amber-500",
      };
    default:
      return {
        icon: Check,
        color: "text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100",
        ring: "focus-within:ring-gray-500",
      };
  }
};

interface ViewTableProps {
  table: TableItem;
}

export const ViewTable: React.FC<ViewTableProps> = ({ table }) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const { setLoading: setLoadingState, setLoadingText } = useLoading();
  const r = auth.restaurants[0];

  const [qrValue, setQrValue] = useState(() => {
    const tid = encodeURIComponent(table.id);
    const rid = encodeURIComponent(r.id);
    const rName = encodeURIComponent(r.name);
    const tno = encodeURIComponent(table.table_number);
    const accessCode = encodeURIComponent(table.access_code || "")

    return `https://bookies-customer.onrender.com?tid=${tid}&rid=${rid}&r=${rName}&tno=${tno}&access_code=${accessCode}`;
  });

  const [loading, setLoading] = useState(false);

  // Edit table required states
  const [tableInfoDialogOpen, setTableInfoDialogOpen] = useState(false);
  const [editTableNumber, setEditTableNumber] = useState(table.table_number);
  const [editMaxSeats, setEditMaxSeats] = useState(table.max_party_size);

  // Dialog open controller

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    keyof typeof StatusLabelToValue | ""
  >("");

  const handleUpdateTable = async () => {
    const backendValue = StatusLabelToValue[selectedStatus];
    try {
      setLoadingState(true);
      setLoadingText("Updating...");

      const body = { ...table, status: backendValue };

      if (body.status == "free") {
        body.is_available = true;
      } else {
        body.is_available = false;
      }

      // Make the request
      const res = await updateTable(
        auth.restaurants[0].id,
        table.id,
        body,
        auth.token
      );

      dispatch(updateTableDataById(res));

      // Success toast
      toast.success("Table status updated successfully");

      // Close dialog
      setStatusDialogOpen(false);

      // Optional: Refresh table lis
    } catch (error: any) {
      console.error("Update table error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update table status. Please try again."
      );
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const handleUpdateTableInfo = async () => {
    try {
      setLoadingState(true);
      setLoadingText("Updating...");

      const body = {
        ...table,
        table_number: editTableNumber,
        max_party_size: editMaxSeats,
      };

      if (body.status == "free") {
        body.is_available = true;
      } else {
        body.is_available = false;
      }

      // Make the request
      const res = await updateTable(
        auth.restaurants[0].id,
        table.id,
        body,
        auth.token
      );

      dispatch(updateTableDataById(res));

      // Success toast
      toast.success("Table status updated successfully");

      // Close dialog
      setTableInfoDialogOpen(false);

      // Optional: Refresh table lis
    } catch (error: any) {
      console.error("Update table error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update table status. Please try again."
      );
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const [waiters, setWaiters] = useState<Staff[]>([]);
  const [waiterReqLoading, setWaiterReqLoading] = useState(false);
  const [waiterReqError, setWaiterReqError] = useState<string | null>(null);

  const fetchWaiters = async () => {
    setWaiterReqLoading(true);
    setWaiterReqError(null);

    try {
      const byRole = await getStaffByRole(auth.token, "waiter");
      console.log("byRole", byRole);
      setWaiters(byRole);
    } catch (error: any) {
      const errorMessage = parseError(error);
      setWaiterReqError(
        errorMessage || "Unable to fetch waiters at the moment"
      );
    } finally {
      setWaiterReqLoading(false);
    }
  };
/*

  const [waiterAssignmentReqLoading, setWaiterAssignmentReqLoading] =
    useState(false);
  const [waiterAssignmentReqError, setWaiterAssignmentReqError] = useState<
    string | null
  >(null);

  const fetchWaiterAssignment = async () => {
    setWaiterAssignmentReqLoading(true);
    setWaiterAssignmentReqError(null);

    try {
      const response = await getWaitersTableAssignments({}, {}, auth?.token);
      return response;
    } catch (error: any) {
      const errorMessage = parseError(error);
      setWaiterAssignmentReqError(
        errorMessage || "Unable to fetch waiters at the moment"
      );
      throw error;
    } finally {
      setWaiterAssignmentReqLoading(false);
    }
  };
*/

  useEffect(() => {
    fetchWaiters();
  }, []); // <-- run only once

  return (
    <div className="space-y-4 pt-5">
      <Tabs defaultValue="overview" className="w-full space-y-4">
        {/* --- TAB TRIGGERS --- */}
        <TabsList className="grid w-full grid-cols-2 rounded-lg border-b border-gray-200 bg-gray-50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="qr">
            <QrCode className="h-4 w-4" />
            _QR Code
          </TabsTrigger>
        </TabsList>
        {/* --- OVERVIEW TAB --- */}
        <TabsContent value="overview">
          <div className="grid grid-cols-2 gap-4">
            {/* Seats */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
              <p className="text-xs font-medium tracking-wide text-indigo-600 uppercase">
                Available Seats
              </p>
              <p className="mt-1 text-[18px] font-semibold text-gray-900">
                {table.max_party_size}
              </p>
            </div>

            {/* Table Number */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
              <p className="text-xs font-medium tracking-wide text-blue-600 uppercase">
                Table Number
              </p>
              <p className="mt-1 text-[18px] font-semibold text-gray-900">
                {table.table_number}
              </p>
            </div>

            {/* Current Status */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
              <p className="text-xs font-medium tracking-wide text-emerald-600 uppercase">
                Current Status
              </p>
              <p className="mt-1 text-[18px] font-semibold text-gray-900 capitalize">
                {table.status}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 space-y-2 pt-5">
            <Button
              className="h-12 w-full cursor-pointer rounded-[10px] bg-indigo-600 text-white transition hover:bg-indigo-700"
              onClick={() => setStatusDialogOpen(true)}
            >
              Update Table Status
            </Button>

            <Button
              className="h-12 w-full cursor-pointer rounded-[10px] bg-blue-600 text-white transition hover:bg-blue-700"
              onClick={() => setTableInfoDialogOpen(true)}
            >
              Update Table Info
            </Button>
          </div>
          <div className="my-5 border-t border-gray-300" />
          <div className="w-full hidden">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold tracking-tight text-[#262626]">
                Waiter Assignment
              </h3>
              <p className="mt-1 text-sm text-[#636262]">
                Assign available waiters to tables to manage service flow and
                improve customer experience.
              </p>
            </div>

            {/* Loading state */}
            {waiterReqLoading && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-[#636262]">
                Loading waiters…
              </div>
            )}

            {/* Error state */}
            {!waiterReqLoading && waiterReqError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{waiterReqError}</p>
                <button
                  onClick={fetchWaiters}
                  className="mt-3 inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}
            {/* Body */}
            {!waiterReqLoading && !waiterReqError && (
              <div className="space-y-3">
                {waiters.length === 0 ? (
                  <p className="text-sm text-[#8a8a8a]">
                    No waiters available.
                  </p>
                ) : (
                  waiters.map((waiter) => (
                    <div
                      key={waiter.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                    >
                      {/* Waiter Info */}
                      <div>
                        <p className="font-medium text-[#262626]">
                          {waiter.full_name}
                        </p>
                        <p className="text-sm text-[#636262]">
                          {waiter.email} • {waiter.phone}
                        </p>
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => {
                          // assign waiter to table logic here
                        }}
                        className="rounded-md bg-[#262626] px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
                      >
                        Assign to table
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* --- ORDER TAB --- */}
        <TabsContent
          value="order"
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <p className="text-gray-700">
            Display current orders for this table.
          </p>
        </TabsContent>

        {/* --- RESERVATION TAB --- */}
        <TabsContent value="reservation" className="rounded-lg p-4">
          <p className="text-gray-700">
            Display current reservation for this table.
          </p>
        </TabsContent>

        {/* --- QR TAB --- */}
        <TabsContent
          value="qr"
          className="space-y-4 rounded-lg border border-gray-200 bg-white p-4"
        >
          <h2 className="text-center text-lg font-semibold">Table QR Code</h2>
          <p className="text-center text-sm text-gray-600">
            Paste this on dining table {table.table_number}.
          </p>

          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-lg border bg-gray-50 p-4">
              <QRCode value={qrValue} size={250} />
            </div>

            <div className="flex gap-3">
              {/* Download */}
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  qrValue
                )}`}
                download={`Table-${table.table_number}-QR.png`}
                target="_blank"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Download className="h-4 w-4" /> Download QR
              </a>

              {/* Regenerate */}
              <Button
                className="hidden items-center gap-2 bg-gray-800 text-white hover:bg-gray-900"
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    const r = auth.restaurants[0];
                    const newQR = `https://bookies-customer.onrender.com?tid=${table.id}&rid=${r.id}&r=${r.name}&tno=${table.table_number}`;
                    setQrValue(newQR);
                    setLoading(false);
                  }, 300);
                }}
              >
                <RefreshCcw className="h-4 w-4" />
                {loading ? "Regenerating..." : "Regenerate QR"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ================================
          UPDATE TABLE STATUS - DIALOG
      ================================= */}
      <GenericDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <div className="space-y-6 p-2">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Change Table Status
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Update the current state for Table {table?.table_number || "—"}.
            </p>
          </div>

          {/* Status Options */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">
              Choose a new status:
            </p>

            <div className="grid grid-cols-2 gap-4">
              {TableStatusLabels.map((label) => {
                const { icon: Icon, color, ring } = getStatusProps(label);
                const isSelected = selectedStatus === label;

                return (
                  <label
                    key={label}
                    className={cn(
                      "group relative flex cursor-pointer flex-col items-start rounded-xl border-2 p-4 transition-all duration-200",
                      color,
                      isSelected
                        ? `shadow-lg ${ring} ring-4 ring-offset-2`
                        : "border-transparent hover:shadow-md"
                    )}
                  >
                    <input
                      type="radio"
                      name="tableStatus"
                      value={label}
                      checked={isSelected}
                      onChange={() => setSelectedStatus(label)}
                      className="pointer-events-none absolute opacity-0"
                    />

                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span className="text-base font-semibold">{label}</span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 rounded-full bg-white p-1 shadow-sm">
                        <Check className="h-4 w-4 text-gray-900" />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              className="h-12 w-full bg-indigo-600 text-base font-semibold shadow-md hover:bg-indigo-700"
              onClick={() => {
                if (!selectedStatus) {
                  toast.error("Please select a status");
                  return;
                }

                handleUpdateTable();
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Confirm Status Update
            </Button>

            <Button
              variant="ghost"
              className="w-full text-gray-600 hover:bg-gray-100"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </GenericDialog>
      {/* ================================
    UPDATE TABLE INFO - DIALOG
================================== */}
      <GenericDialog
        open={tableInfoDialogOpen}
        onOpenChange={setTableInfoDialogOpen}
      >
        <div className="space-y-6 p-2">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Update Table Info
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Modify the table number or available seats for this table.
            </p>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            {/* Table Number */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Table Number
              </label>
              <Input
                className="h-11 rounded-lg"
                value={editTableNumber}
                onChange={(e) => {
                  let { value } = e.target;

                  if (value.length > 3) {
                    value = value.slice(0, 3);
                  }
                  setEditTableNumber(value);
                }}
                placeholder="Enter table number"
              />
            </div>

            {/* Maximum Seats */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Available Seats
              </label>
              <Input
                type="number"
                className="h-11 rounded-lg"
                value={String(editMaxSeats)}
                onChange={(e) => setEditMaxSeats(Number(e.target.value))}
                placeholder="Enter max seats"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              className="h-12 w-full bg-blue-600 text-base font-semibold shadow-md hover:bg-blue-700"
              onClick={() => {
                if (!editTableNumber || Number(editTableNumber) <= 0) {
                  toast.error("Table number must be a valid positive number");
                  return;
                }

                if (!editMaxSeats || Number(editMaxSeats) <= 0) {
                  toast.error(
                    "Available seats must be a valid positive number"
                  );
                  return;
                }

                handleUpdateTableInfo();
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Save Changes
            </Button>

            <Button
              variant="ghost"
              className="w-full text-gray-600 hover:bg-gray-100"
              onClick={() => setTableInfoDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </GenericDialog>
    </div>
  );
};
