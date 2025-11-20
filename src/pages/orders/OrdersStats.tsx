import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Package } from "lucide-react";
import { Order, OrderStatus } from "./types/order";

interface OrdersStatsProps {
  orders: Order[];
}

export function OrdersStats({ orders = [] }: OrdersStatsProps) {
  const safeOrders = orders || [];

  const stats = {
    total: safeOrders.length,
    received: safeOrders.filter((o) => o.status === OrderStatus.RECEIVED)
      .length,
    preparing: safeOrders.filter((o) => o.status === OrderStatus.PREPARING)
      .length,
    ready: safeOrders.filter((o) => o.status === OrderStatus.READY).length,
    totalRevenue: safeOrders.reduce(
      (sum, order) => sum + parseFloat(order.total_price || "0"),
      0
    ),
    dineIn: safeOrders.filter((o) => o.order_type === "dine-in").length,
    delivery: safeOrders.filter((o) => o.order_type === "delivery").length,
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-muted-foreground text-xs">All time orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalRevenue.toFixed(2)}
          </div>
          <p className="text-muted-foreground text-xs">Total revenue</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.received + stats.preparing}
          </div>
          <p className="text-muted-foreground text-xs">
            Orders being processed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ready</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {stats.ready}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.ready}</div>
          <p className="text-muted-foreground text-xs">
            Ready for pickup/delivery
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
