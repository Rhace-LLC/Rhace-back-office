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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Clock, DollarSign, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const mockOrders = [
  {
    id: "ORD-001",
    table: "Table 5",
    status: "Preparing",
    waiter: "Sarah Johnson",
    total: 45.5,
    time: "15:30",
    items: [
      {
        name: "Margherita Pizza",
        price: 18.5,
        addons: ["Extra Cheese"],
        quantity: 1,
      },
      { name: "Caesar Salad", price: 12.0, addons: [], quantity: 1 },
      { name: "Coca Cola", price: 3.5, addons: [], quantity: 2 },
      { name: "Tiramisu", price: 8.0, addons: [], quantity: 1 },
    ],
  },
  {
    id: "ORD-002",
    table: "Table 2",
    status: "Pending",
    waiter: "Mike Chen",
    total: 32.75,
    time: "15:25",
    items: [
      {
        name: "Spaghetti Carbonara",
        price: 16.5,
        addons: ["Extra Parmesan"],
        quantity: 1,
      },
      { name: "Garlic Bread", price: 6.25, addons: [], quantity: 1 },
      { name: "House Wine", price: 10.0, addons: [], quantity: 1 },
    ],
  },
  {
    id: "ORD-003",
    table: "Table 8",
    status: "Served",
    waiter: "Alex Thompson",
    total: 67.25,
    time: "15:20",
    items: [
      {
        name: "Ribeye Steak",
        price: 35.0,
        addons: ["Medium Rare", "Garlic Butter"],
        quantity: 1,
      },
      { name: "Mashed Potatoes", price: 8.5, addons: [], quantity: 1 },
      { name: "Grilled Vegetables", price: 9.75, addons: [], quantity: 1 },
      { name: "Red Wine", price: 14.0, addons: [], quantity: 1 },
    ],
  },
  {
    id: "ORD-004",
    table: "Table 1",
    status: "Preparing",
    waiter: "Sarah Johnson",
    total: 28.5,
    time: "15:15",
    items: [
      {
        name: "Fish & Chips",
        price: 19.5,
        addons: ["Mushy Peas"],
        quantity: 1,
      },
      { name: "Lemonade", price: 4.5, addons: [], quantity: 2 },
    ],
  },
  {
    id: "ORD-005",
    table: "Table 12",
    status: "Paid",
    waiter: "Mike Chen",
    total: 89.25,
    time: "14:45",
    items: [
      {
        name: "Chef Special Pasta",
        price: 24.0,
        addons: ["Truffle Oil"],
        quantity: 2,
      },
      { name: "Bruschetta", price: 12.5, addons: [], quantity: 1 },
      { name: "Champagne", price: 28.75, addons: [], quantity: 1 },
    ],
  },
];

const statusOptions = ["All", "Pending", "Preparing", "Served", "Paid"];
const statusColors = {
  Pending: "destructive",
  Preparing: "secondary",
  Served: "default",
  Paid: "outline",
} as const;

export function Orders() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<
    (typeof mockOrders)[0] | null
  >(null);

  const filteredOrders = mockOrders.filter(
    (order) => statusFilter === "All" || order.status === statusFilter
  );

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
    if (orderIndex !== -1) {
      mockOrders[orderIndex].status = newStatus;
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1>Orders Management</h1>
          <p className="text-muted-foreground">
            Track and manage all restaurant orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Orders</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{mockOrders.length}</div>
            <p className="text-muted-foreground text-xs">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
            <Badge variant="destructive" className="text-xs">
              {mockOrders.filter((o) => o.status === "Pending").length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {mockOrders.filter((o) => o.status === "Pending").length}
            </div>
            <p className="text-muted-foreground text-xs">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {mockOrders.filter((o) => o.status === "Preparing").length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {mockOrders.filter((o) => o.status === "Preparing").length}
            </div>
            <p className="text-muted-foreground text-xs">Being prepared</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              $
              {mockOrders
                .reduce((sum, order) => sum + order.total, 0)
                .toFixed(2)}
            </div>
            <p className="text-muted-foreground text-xs">Total today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            Click on any order to view details and update status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waiter</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-muted/50 cursor-pointer"
                >
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.table}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        statusColors[order.status as keyof typeof statusColors]
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.waiter}</TableCell>
                  <TableCell>{order.time}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[400px] overflow-y-auto sm:w-[540px]">
                        <SheetHeader>
                          <SheetTitle>
                            Order Details - {selectedOrder?.id}
                          </SheetTitle>
                          <SheetDescription>
                            {selectedOrder?.table} • {selectedOrder?.time} •{" "}
                            {selectedOrder?.waiter}
                          </SheetDescription>
                        </SheetHeader>

                        {selectedOrder && (
                          <div className="mt-6 space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3>Current Status</h3>
                                <Badge
                                  variant={
                                    statusColors[
                                      selectedOrder.status as keyof typeof statusColors
                                    ]
                                  }
                                  className="mt-1"
                                >
                                  {selectedOrder.status}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="text-muted-foreground text-sm">
                                  Total Amount
                                </p>
                                <p className="text-lg">
                                  ${selectedOrder.total.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h3 className="mb-3">Update Status</h3>
                              <Select
                                value={selectedOrder.status}
                                onValueChange={(value: any) =>
                                  updateOrderStatus(selectedOrder.id, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="Preparing">
                                    Preparing
                                  </SelectItem>
                                  <SelectItem value="Served">Served</SelectItem>
                                  <SelectItem value="Paid">Paid</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <Separator />

                            <div>
                              <h3 className="mb-3">Order Items</h3>
                              <div className="space-y-3">
                                {selectedOrder.items.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start justify-between rounded-lg border p-3"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span>{item.name}</span>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          x{item.quantity}
                                        </Badge>
                                      </div>
                                      {item.addons.length > 0 && (
                                        <p className="text-muted-foreground mt-1 text-xs">
                                          Add-ons: {item.addons.join(", ")}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm">
                                        $
                                        {(item.price * item.quantity).toFixed(
                                          2
                                        )}
                                      </p>
                                      <p className="text-muted-foreground text-xs">
                                        ${item.price} each
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </SheetContent>
                    </Sheet>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
