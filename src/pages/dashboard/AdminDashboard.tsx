"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { StatsAdminDashboard } from "./StatsAdminDashboard";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { updateAdminDashboardData } from "@/store/dashboard.slice";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueItem, StaffActivity } from "@/types/dashboard.types";
import { Star } from "lucide-react";

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const adminDashboardData = useSelector(
    (state: RootState) => state.dashboard.adminDashboardData
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // === Simulated API fetch ===
  const simulateFetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // dummy simulated response
      const simulatedData: {revenueData: RevenueItem[], staffActivities: StaffActivity[]} = {
        revenueData: [
          { name: "Mon", revenue: 1200 },
          { name: "Tue", revenue: 1800 },
          { name: "Wed", revenue: 900 },
          { name: "Thu", revenue: 2100 },
          { name: "Fri", revenue: 2500 },
          { name: "Sat", revenue: 3100 },
          { name: "Sun", revenue: 2700 },
        ],
        staffActivities: [
          {
            staffName: "Sarah Johnson",
            role: "Waiter",
            orders: 12,
            performance: "Excellent",
          },
          {
            staffName: "Mike Chen",
            role: "Kitchen",
            orders: 24,
            performance: "Excellent",
          },
          {
            staffName: "Alex Thompson",
            role: "Waiter",
            orders: 8,
            performance: "Good",
          },
        ],
      };

      // Dispatch simulated data to Redux store
      dispatch(updateAdminDashboardData(simulatedData));
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    simulateFetchDashboard();
  }, []);

  const { revenueData, staffActivities } = adminDashboardData;

  return (
    <div className="mt-15 space-y-6 p-5 md:mt-0">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Restaurant overview and key performance indicators
        </p>
      </div>

      <StatsAdminDashboard />

      {/* === Loading / Error States === */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-600 font-medium">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* === Revenue Chart === */}
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
                    formatter={(value: any) => [`$${value}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#2542e3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* === Staff Activity Table === */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Activity</CardTitle>
              <CardDescription>
                Performance summary for today
              </CardDescription>
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
                  {staffActivities.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>{activity.staffName}</TableCell>
                      <TableCell>{activity.role}</TableCell>
                      <TableCell>{activity.orders}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            activity.performance === "Excellent"
                              ? "bg-green-100 text-green-800"
                              : activity.performance === "Good"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                           4.5 {" "} <Star className="w-3 h-3" />
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
