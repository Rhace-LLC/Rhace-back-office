import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Package } from "lucide-react";
import type { Order } from "./types/order";

interface OrdersStatsProps {
  orders: Order[];
}

// Format revenue specifically for Naira with proper formatting
const formatRevenue = (amount: number): string => {
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 100000) {
    return `₦${(amount / 1000).toFixed(0)}k`;
  } else if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(1)}k`;
  } else {
    return `₦${amount.toFixed(0)}`;
  }
};

// Format regular counts (orders)
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  } else {
    return `${count}`;
  }
};

export function OrdersStats({ orders = [] }: OrdersStatsProps) {
  const safeOrders = orders || [];
  
  const stats = {
    total: safeOrders.length,
    received: safeOrders.filter(o => String(o.status || '').toLowerCase() === 'received').length,
    preparing: safeOrders.filter(o => String(o.status || '').toLowerCase() === 'preparing').length,
    ready: safeOrders.filter(o => String(o.status || '').toLowerCase() === 'ready').length,
    totalRevenue: safeOrders.reduce((sum, order) => sum + parseFloat(order.total_price || '0'), 0),
    dineIn: safeOrders.filter(o => o.order_type === 'dine-in').length,
    delivery: safeOrders.filter(o => o.order_type === 'delivery').length,
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCount(stats.total)}</div>
          <p className="text-xs text-muted-foreground">All time orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRevenue(stats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">Total revenue</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCount(stats.received + stats.preparing)}</div>
          <p className="text-xs text-muted-foreground">Orders being processed</p>
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
          <div className="text-2xl font-bold">{formatCount(stats.ready)}</div>
          <p className="text-xs text-muted-foreground">Ready for pickup/delivery</p>
        </CardContent>
      </Card>
    </div>
  );
}