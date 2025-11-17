import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QrCode, RefreshCcw, CalendarDays, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table } from "@/store/table.slice";
import QRCode from "react-qr-code";
import { useAuth } from "@/contexts/AuthContext";

type TableStatus = "Open" | "Occupied" | "Needs Cleaning" | "Reserved";

interface ViewTableProps {
  table: Table;
  onAssignWaiter?: (id: string) => void;
  onGenerateQR?: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: TableStatus) => void;
}

export const ViewTable: React.FC<ViewTableProps> = ({ table }) => {
  const auth = useAuth()
  const [qrValue, setQrValue] = useState(table.qr_code_image);
  const [loading, setLoading] = useState(false);
  const [showStatusEditor, setShowStatusEditor] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Open");
  // -----------------------------------------------
  // HARD-CODED fields not part of the Table interface
  // -----------------------------------------------
  const mock = {
    name: `Table ${table.table_number}`,
    seats: table.max_party_size,
    status: table.is_available ? "Open" : "Occupied",
    currentGuest: null,
    totalBill: 64.75,
    waiter: "John Doe",
    reservation: {
      name: "Sarah Johnson",
      time: "7:30 PM",
      guests: 2,
    },
  };

  return (
    <div className="space-y-4 pt-5">
      {/* === TABLE INFO SECTION === */}
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full space-y-4">
          {/* Tab triggers */}
          <TabsList className="grid w-full grid-cols-4 rounded-lg border-b border-gray-200 bg-gray-50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="order">Order</TabsTrigger>
            <TabsTrigger value="reservation">Reservation</TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="h-4 w-4" />
              _QR Code
            </TabsTrigger>
          </TabsList>

          {/* Tab content */}
          <TabsContent value="overview" className="rounded-lg bg-white">
            <div>
              {/*Cards container*/}

              <div className="grid grid-cols-2 gap-4">
                {/* Seats Box */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Available Seats
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {table.max_party_size}
                  </p>
                </div>

                {/* Table Number */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Table Number
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {table.table_number}
                  </p>
                </div>
                {/* Current Status Card */}
                <div className="space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Current Status
                  </p>
                  <p className="text-xl font-bold text-gray-900 capitalize">
                    {"Open"}
                  </p>
                </div>

                {/* Assigned Waiter Card */}
                <div className="space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Assigned Waiter
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {"Unassigned"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-4">
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => setShowStatusEditor(true)}
                >
                  Update Table Status
                </Button>

                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => {}}
                >
                  {"Assign Waiter"}
                </Button>
              </div>
              {showStatusEditor && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Select a new status
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {["Open", "Occupied", "Needs Cleaning", "Reserved"].map(
                      (s) => (
                        <label
                          key={s}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all",
                            selectedStatus === s
                              ? "border-gray-400 bg-gray-100"
                              : "hover:bg-gray-50"
                          )}
                        >
                          <input
                            type="radio"
                            name="tableStatus"
                            value={s}
                            checked={selectedStatus === s}
                            onChange={() => setSelectedStatus(s)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {s}
                          </span>
                        </label>
                      )
                    )}
                  </div>

                  <div className="mt-2 flex gap-2">
                    <Button
                      className="w-full cursor-pointer"
                      onClick={() => {
                        setShowStatusEditor(false);
                      }}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Save Status Update
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full cursor-pointer"
                      onClick={() => setShowStatusEditor(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="order"
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <p className="text-gray-700">
              Display current orders for this table.
            </p>
          </TabsContent>

          <TabsContent value="reservation" className="rounded-lg">
            {/* === Reservation Section === */}
            <Card>
              <CardHeader>
                <h2 className="flex items-center gap-2 text-lg font-medium">
                  <CalendarDays className="h-4 w-4" /> Reservation Details
                </h2>
              </CardHeader>

              <CardContent>
                {mock.reservation ? (
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Name: </span>
                      {mock.reservation.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Time: </span>
                      {mock.reservation.time}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Guests: </span>
                      {mock.reservation.guests}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No reservation details available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="qr"
            className="space-y-4 rounded-lg border border-gray-200 bg-white p-4"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Table QR Code
            </h2>
            <p className="text-sm text-gray-600">
              Paste this on dining table {table.table_number} for customers to
              scan or place an order directly from their mobile device.
            </p>

            <div className="flex flex-col items-center justify-center space-y-4">
              {/* QR Preview */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
                <QRCode value={qrValue} size={180} />
              </div>

              <div className="flex gap-3">
                {/* Download Button */}
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    qrValue
                  )}`}
                  download={`Table-${table.table_number}-QRCode.png`}
                  target="_blank"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" /> Download QR
                </a>

                {/* Regenerate QR Button */}
                <Button
                  className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-gray-900"
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                      const data = {
                        tableId: table.table_number,
                        restaurantId: auth.restaurants[0].id,
                        restaurantName: auth.restaurants[0].name
                      }

                      const newQR = `http://localhost:3010?tid=${data.tableId}&rid=${data.restaurantId}&r=${data.restaurantName}`;
                      setQrValue(newQR);
                      setLoading(false);
                    }, 200);
                  }}
                  disabled={loading}
                >
                  <RefreshCcw className="h-4 w-4" />
                  {loading ? "Regenerating..." : "Regenerate QR"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
