import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Clock, DollarSign, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Table {
  id: number;
  seats: number;
  status: string;
  waiter: string | null;
  orderValue: number;
  timeOccupied: string | null;
}

const mockTables: Table[] = [
  {
    id: 1,
    seats: 4,
    status: "Occupied",
    waiter: "Sarah Johnson",
    orderValue: 45.5,
    timeOccupied: "1h 15m",
  },
  {
    id: 2,
    seats: 2,
    status: "Free",
    waiter: null,
    orderValue: 0,
    timeOccupied: null,
  },
  {
    id: 3,
    seats: 6,
    status: "Reserved",
    waiter: "Mike Chen",
    orderValue: 0,
    timeOccupied: null,
  },
  {
    id: 4,
    seats: 4,
    status: "Needs Cleaning",
    waiter: null,
    orderValue: 0,
    timeOccupied: null,
  },
  {
    id: 5,
    seats: 2,
    status: "Occupied",
    waiter: "Sarah Johnson",
    orderValue: 32.75,
    timeOccupied: "45m",
  },
  {
    id: 6,
    seats: 8,
    status: "Free",
    waiter: null,
    orderValue: 0,
    timeOccupied: null,
  },
  {
    id: 7,
    seats: 4,
    status: "Occupied",
    waiter: "Alex Thompson",
    orderValue: 67.25,
    timeOccupied: "2h 5m",
  },
  {
    id: 8,
    seats: 2,
    status: "Reserved",
    waiter: "Mike Chen",
    orderValue: 0,
    timeOccupied: null,
  },
  {
    id: 9,
    seats: 4,
    status: "Free",
    waiter: null,
    orderValue: 0,
    timeOccupied: null,
  },
  {
    id: 10,
    seats: 6,
    status: "Occupied",
    waiter: "Sarah Johnson",
    orderValue: 89.25,
    timeOccupied: "30m",
  },
  {
    id: 11,
    seats: 2,
    status: "Free",
    waiter: null,
    orderValue: 0,
    timeOccupied: null,
  },
  {
    id: 12,
    seats: 4,
    status: "Needs Cleaning",
    waiter: null,
    orderValue: 0,
    timeOccupied: null,
  },
];

const waiters = ["Sarah Johnson", "Mike Chen", "Alex Thompson"];

const statusColors = {
  Free: "bg-green-100 text-green-800 border-green-200",
  Occupied: "bg-red-100 text-red-800 border-red-200",
  Reserved: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Needs Cleaning": "bg-gray-100 text-gray-800 border-gray-200",
};

const statusBadgeColors = {
  Free: "default",
  Occupied: "destructive",
  Reserved: "secondary",
  "Needs Cleaning": "outline",
} as const;

export function TablesPage() {
  const [selectedTable, setSelectedTable] = useState<
    (typeof mockTables)[0] | null
  >(null);

  const [tables, setTables] = useState<Table[]>(mockTables);

  const updateTableStatus = (tableId: number, newStatus: string) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? {
              ...table,
              status: newStatus,
              waiter:
                newStatus === "Free" || newStatus === "Needs Cleaning"
                  ? null
                  : table.waiter,
            }
          : table
      )
    );

    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );
    }
  };

  const assignWaiter = (tableId: number, waiterName: string) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, waiter: waiterName } : table
      )
    );
    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable((prev) =>
        prev ? { ...prev, waiter: waiterName } : null
      );
    }
  };

  const occupiedTables = tables.filter((t) => t.status === "Occupied").length;
  const totalRevenue = tables.reduce((sum, table) => sum + table.orderValue, 0);

  return (
    <div className="space-y-6 p-5">
      <div>
        <h1>Table Management</h1>
        <p className="text-muted-foreground">
          Monitor table status and manage assignments
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Table Occupancy</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {occupiedTables}/{tables.length}
            </div>
            <p className="text-muted-foreground text-xs">
              {Math.round((occupiedTables / tables.length) * 100)}% occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Available Tables</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {tables.filter((t) => t.status === "Free").length}
            </div>
            <p className="text-muted-foreground text-xs">Ready for guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalRevenue.toFixed(2)}</div>
            <p className="text-muted-foreground text-xs">
              From occupied tables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Table Time</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">1h 15m</div>
            <p className="text-muted-foreground text-xs">Current session</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restaurant Floor Layout</CardTitle>
          <CardDescription>
            Click on any table to view details and manage assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {tables.map((table) => (
              <Dialog key={table.id}>
                <DialogTrigger asChild>
                  <div
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${statusColors[table.status as keyof typeof statusColors]} `}
                    onClick={() => setSelectedTable(table)}
                  >
                    <div className="text-center">
                      <div className="text-lg">Table {table.id}</div>
                      <div className="text-sm opacity-75">
                        {table.seats} seats
                      </div>
                      <Badge
                        variant={
                          statusBadgeColors[
                            table.status as keyof typeof statusBadgeColors
                          ]
                        }
                        className="mt-2 text-xs"
                      >
                        {table.status}
                      </Badge>
                      {table.waiter && (
                        <div className="mt-1 text-xs opacity-75">
                          {table.waiter.split(" ")[0]}
                        </div>
                      )}
                      {table.orderValue > 0 && (
                        <div className="mt-1 text-xs">
                          ${table.orderValue.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      Table {selectedTable?.id} Management
                    </DialogTitle>
                    <DialogDescription>
                      Manage table assignment and status
                    </DialogDescription>
                  </DialogHeader>

                  {selectedTable && (
                    <div className="mt-4 space-y-6">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Capacity
                          </p>
                          <p className="text-lg">{selectedTable.seats} seats</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Current Status
                          </p>
                          <Badge
                            variant={
                              statusBadgeColors[
                                selectedTable.status as keyof typeof statusBadgeColors
                              ]
                            }
                            className="mt-1"
                          >
                            {selectedTable.status}
                          </Badge>
                        </div>
                      </div>

                      {selectedTable.timeOccupied && (
                        <div className="text-center">
                          <p className="text-muted-foreground text-sm">
                            Time Occupied
                          </p>
                          <p className="text-lg">
                            {selectedTable.timeOccupied}
                          </p>
                        </div>
                      )}

                      {selectedTable.orderValue > 0 && (
                        <div className="text-center">
                          <p className="text-muted-foreground text-sm">
                            Current Order Value
                          </p>
                          <p className="text-lg">
                            ${selectedTable.orderValue.toFixed(2)}
                          </p>
                        </div>
                      )}

                      <Separator />

                      <div>
                        <label className="text-muted-foreground text-sm">
                          Assign Waiter
                        </label>
                        <Select
                          value={selectedTable.waiter || ""}
                          onValueChange={(value) =>
                            assignWaiter(selectedTable.id, value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select waiter" />
                          </SelectTrigger>
                          <SelectContent>
                            {waiters.map((waiter) => (
                              <SelectItem key={waiter} value={waiter}>
                                {waiter}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-muted-foreground text-sm">
                          Update Status
                        </label>
                        <Select
                          value={selectedTable.status}
                          onValueChange={(value) =>
                            updateTableStatus(selectedTable.id, value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Free">Free</SelectItem>
                            <SelectItem value="Occupied">Occupied</SelectItem>
                            <SelectItem value="Reserved">Reserved</SelectItem>
                            <SelectItem value="Needs Cleaning">
                              Needs Cleaning
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            updateTableStatus(selectedTable.id, "Free")
                          }
                        >
                          Mark as Clean
                        </Button>
                        <Button
                          className="flex-1 bg-[#2542e3]"
                          onClick={() =>
                            console.log(
                              "View current order for table",
                              selectedTable.id
                            )
                          }
                        >
                          View Order
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-green-200 bg-green-100"></div>
          <span className="text-sm">Free</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-red-200 bg-red-100"></div>
          <span className="text-sm">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-yellow-200 bg-yellow-100"></div>
          <span className="text-sm">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded border border-gray-200 bg-gray-100"></div>
          <span className="text-sm">Needs Cleaning</span>
        </div>
      </div>
    </div>
  );
}
