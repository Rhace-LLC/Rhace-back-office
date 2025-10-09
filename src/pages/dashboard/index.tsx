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
import { Clock, DollarSign, Users, ChefHat, Plus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { mockUsers } from "@/navigation/mock";

const revenueData = [
  { name: "Mon", revenue: 2400 },
  { name: "Tue", revenue: 3200 },
  { name: "Wed", revenue: 2800 },
  { name: "Thu", revenue: 3600 },
  { name: "Fri", revenue: 4200 },
  { name: "Sat", revenue: 5100 },
  { name: "Sun", revenue: 4800 },
];

const mockOrders = [
  {
    id: "ORD-001",
    table: "Table 5",
    status: "Preparing",
    time: "15:30",
    total: 45.5,
  },
  {
    id: "ORD-002",
    table: "Table 2",
    status: "Pending",
    time: "15:25",
    total: 32.75,
  },
  {
    id: "ORD-003",
    table: "Table 8",
    status: "Served",
    time: "15:20",
    total: 67.25,
  },
  {
    id: "ORD-004",
    table: "Table 1",
    status: "Preparing",
    time: "15:15",
    total: 28.5,
  },
];

const mockTables = [
  { id: 1, waiter: "Sarah Johnson", status: "Occupied", orders: 2 },
  { id: 2, waiter: "Mike Chen", status: "Free", orders: 0 },
  { id: 5, waiter: "Sarah Johnson", status: "Occupied", orders: 1 },
  { id: 8, waiter: "Alex Thompson", status: "Reserved", orders: 0 },
];

export function Dashboard() {
  const user = mockUsers[0];

  if (user?.role === "Waiter") {
    return (
      <div className="space-y-6 p-5">
        <div>
          <h1>Waiter Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your assigned tables and orders
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">My Tables</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">4</div>
              <p className="text-muted-foreground text-xs">
                2 occupied, 2 free
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending Orders</CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">3</div>
              <p className="text-muted-foreground text-xs">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Today's Tips</CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">$45.20</div>
              <p className="text-muted-foreground text-xs">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Tables</CardTitle>
              <CardDescription>
                Tables currently under your care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTables
                  .filter((t) => t.waiter === user?.name)
                  .map((table) => (
                    <div
                      key={table.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg">Table {table.id}</div>
                        <Badge
                          variant={
                            table.status === "Occupied"
                              ? "destructive"
                              : table.status === "Free"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {table.status}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {table.orders} order{table.orders !== 1 ? "s" : ""}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>
                  Orders requiring your attention
                </CardDescription>
              </div>
              <Button size="sm" className="bg-[#2542e3]">
                <Plus className="mr-1 h-4 w-4" />
                New Order
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockOrders
                  .filter((o) => o.status !== "Served")
                  .slice(0, 3)
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <div className="text-sm">{order.id}</div>
                        <div className="text-muted-foreground text-xs">
                          {order.table} • {order.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">${order.total}</div>
                        <Badge
                          variant={
                            order.status === "Pending" ? "secondary" : "default"
                          }
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user?.role === "Kitchen") {
    return (
      <div className="space-y-6 p-5">
        <div>
          <h1>Kitchen Dashboard</h1>
          <p className="text-muted-foreground">
            Manage incoming orders and preparation queue
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Orders in Queue</CardTitle>
              <ChefHat className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">7</div>
              <p className="text-muted-foreground text-xs">2 urgent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Avg Prep Time</CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">12m</div>
              <p className="text-muted-foreground text-xs">Within target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Orders Completed</CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">24</div>
              <p className="text-muted-foreground text-xs">Today</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Orders Queue</CardTitle>
            <CardDescription>
              Orders awaiting preparation with timer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Time Elapsed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.table}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        8m
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "Pending" ? "destructive" : "default"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Start
                        </Button>
                        <Button size="sm" className="bg-[#2542e3]">
                          Complete
                        </Button>
                      </div>
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

  // Admin Dashboard
  return (
    <div className="space-y-6 p-5">
      <div>
        <h1>Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Restaurant overview and key performance indicators
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Orders</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">24</div>
            <p className="text-muted-foreground text-xs">+3 from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Today's Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">$2,847</div>
            <p className="text-muted-foreground text-xs">+8% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Table Occupancy</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">75%</div>
            <p className="text-muted-foreground text-xs">12/16 tables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Staff Active</CardTitle>
            <ChefHat className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">8</div>
            <p className="text-muted-foreground text-xs">All shifts covered</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
            <CardDescription>
              Revenue performance over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => [
                    `$${value.toString()}`,
                    "Revenue",
                  ]}
                />
                <Bar dataKey="revenue" fill="#2542e3" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Activity</CardTitle>
            <CardDescription>Performance summary for today</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Sarah Johnson</TableCell>
                  <TableCell>Waiter</TableCell>
                  <TableCell>12</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      Excellent
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mike Chen</TableCell>
                  <TableCell>Kitchen</TableCell>
                  <TableCell>24</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      Excellent
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Alex Thompson</TableCell>
                  <TableCell>Waiter</TableCell>
                  <TableCell>8</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Good
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
