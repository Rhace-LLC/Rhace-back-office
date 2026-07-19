import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  UtensilsCrossed,
} from "lucide-react";
import formatPrice from "@/utils/formatPrice";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const dailyRevenueData = [
  { day: "Mon", revenue: 2400, orders: 45 },
  { day: "Tue", revenue: 3200, orders: 58 },
  { day: "Wed", revenue: 2800, orders: 52 },
  { day: "Thu", revenue: 3600, orders: 65 },
  { day: "Fri", revenue: 4200, orders: 78 },
  { day: "Sat", revenue: 5100, orders: 92 },
  { day: "Sun", revenue: 4800, orders: 85 },
];

const topDishesData = [
  { name: "Margherita Pizza", orders: 45, revenue: 832.5 },
  { name: "Spaghetti Carbonara", orders: 38, revenue: 741.0 },
  { name: "Ribeye Steak", orders: 28, revenue: 980.0 },
  { name: "Fish & Chips", orders: 32, revenue: 704.0 },
  { name: "Caesar Salad", orders: 41, revenue: 574.0 },
];

const tableTurnoverData = [
  { table: "Table 1", turns: 8, avgTime: "1h 15m", revenue: 340.5 },
  { table: "Table 2", turns: 12, avgTime: "45m", revenue: 425.75 },
  { table: "Table 3", turns: 6, avgTime: "1h 30m", revenue: 285.0 },
  { table: "Table 4", turns: 9, avgTime: "1h 10m", revenue: 398.25 },
  { table: "Table 5", turns: 11, avgTime: "50m", revenue: 456.8 },
];

const pieChartData = [
  { name: "Appetizers", value: 25, color: "#2542e3" },
  { name: "Main Courses", value: 45, color: "#3b82f6" },
  { name: "Desserts", value: 15, color: "#60a5fa" },
  { name: "Beverages", value: 15, color: "#93c5fd" },
];

const staffPerformanceData = [
  {
    name: "Sarah Johnson",
    role: "Waiter",
    tablesServed: 24,
    ordersProcessed: 67,
    avgOrderTime: "12m",
    customerRating: 4.8,
    performance: "Excellent",
  },
  {
    name: "Mike Chen",
    role: "Kitchen Staff",
    tablesServed: 0,
    ordersProcessed: 89,
    avgOrderTime: "15m",
    customerRating: 4.6,
    performance: "Excellent",
  },
  {
    name: "Alex Thompson",
    role: "Waiter",
    tablesServed: 18,
    ordersProcessed: 42,
    avgOrderTime: "14m",
    customerRating: 4.4,
    performance: "Good",
  },
  {
    name: "Emma Davis",
    role: "Kitchen Staff",
    tablesServed: 0,
    ordersProcessed: 73,
    avgOrderTime: "16m",
    customerRating: 4.5,
    performance: "Good",
  },
];

export function Analytics() {
  const auth = useAuth();

  // Only admins can access analytics
  if (auth.isAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-5">
        <div className="text-center">
          <h2>Access Restricted</h2>
          <p className="text-muted-foreground">
            Only administrators can access analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5">
      <div>
        <h1>Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive restaurant performance insights
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Today's Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">₦4,847</div>
            <p className="text-muted-foreground flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Orders Today</CardTitle>
            <UtensilsCrossed className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">89</div>
            <p className="text-muted-foreground text-xs">+8 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Order Value</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">₦54.45</div>
            <p className="text-muted-foreground text-xs">+₦3.20 increase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Table Turnover</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">3.2x</div>
            <p className="text-muted-foreground text-xs">Per table today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Customer Satisfaction</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">4.6/5</div>
            <p className="text-muted-foreground text-xs">Average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue Trend</CardTitle>
            <CardDescription>
              Daily revenue and order count over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue" && typeof value === "number" ? formatPrice(value) : value,
                    name === "revenue" ? "Revenue" : "Orders",
                  ]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill="#2542e3"
                  name="revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>
              Revenue distribution across menu categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {pieChartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Dishes</CardTitle>
            <CardDescription>
              Most popular dishes by order count and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dish</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDishesData.map((dish, index) => (
                  <TableRow key={index}>
                    <TableCell>{dish.name}</TableCell>
                    <TableCell>{dish.orders}</TableCell>
                    <TableCell>{formatPrice(dish.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table Performance</CardTitle>
            <CardDescription>
              Turnover rate and revenue by table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Turns</TableHead>
                  <TableHead>Avg Time</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableTurnoverData.map((table, index) => (
                  <TableRow key={index}>
                    <TableCell>{table.table}</TableCell>
                    <TableCell>{table.turns}</TableCell>
                    <TableCell>{table.avgTime}</TableCell>
                    <TableCell>{formatPrice(table.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Performance Summary</CardTitle>
          <CardDescription>
            Performance metrics for all staff members today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tables Served</TableHead>
                <TableHead>Orders Processed</TableHead>
                <TableHead>Avg Order Time</TableHead>
                <TableHead>Customer Rating</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffPerformanceData.map((staff, index) => (
                <TableRow key={index}>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{staff.role}</Badge>
                  </TableCell>
                  <TableCell>{staff.tablesServed || "N/A"}</TableCell>
                  <TableCell>{staff.ordersProcessed}</TableCell>
                  <TableCell>{staff.avgOrderTime}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>{staff.customerRating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        staff.performance === "Excellent"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        staff.performance === "Excellent"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {staff.performance}
                    </Badge>
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
