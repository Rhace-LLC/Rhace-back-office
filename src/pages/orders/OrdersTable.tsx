// components/OrdersTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, Truck, User, Table as TableIcon } from "lucide-react";
import { Order, OrderStatus } from "./types/order";
import { Staff } from "../../api-services/staffService";
import { Table as TableType } from "../../api-services/tableService";

interface OrdersTableProps {
  orders: Order[];
  onOrderSelect: (order: Order) => void;
  waiters: Staff[];
  tables: TableType[];
}
const statusColors: Record<OrderStatus, string> = {
  received: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  delivered: "bg-purple-100 text-purple-800 border-purple-200",
};

export function OrdersTable({
  orders,
  onOrderSelect,
  waiters,
  tables,
}: OrdersTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "received":
    case "preparing":
      return <Clock className="mr-1 h-3 w-3" />;
    case "ready":
    case "delivered":
      return <Truck className="mr-1 h-3 w-3" />;
    default:
      return null;
  }
};
  // ✅ SAFE ACCESSOR FUNCTIONS
  const getCustomerName = (order: Order) => {
    return order?.customer_name || "N/A";
  };

  const getCustomerPhone = (order: Order) => {
    return order?.customer_phone || "N/A";
  };

  const getTotalPrice = (order: Order) => {
    return order?.total_price
      ? parseFloat(order.total_price).toFixed(2)
      : "0.00";
  };

  const getOrderType = (order: Order) => {
    return order?.order_type || "unknown";
  };

  const getCreatedAt = (order: Order) => {
    return order?.created_at ? formatDate(order.created_at) : "N/A";
  };

  const getItemsCount = (order: Order) => {
    return order?.items?.length || 0;
  };

  // ✅ FIXED: Safe order ID display
  const getOrderIdDisplay = (order: Order) => {
    if (!order?.id) return "N/A";

    // Convert to string and take last 8 characters
    const idString = String(order.id);
    return `#${idString.slice(-8)}`;
  };

  // Get assigned waiter name
  const getAssignedWaiterName = (order: Order) => {
    if (!order.waiter) return "No waiter";
    const waiter = waiters.find((w) => w.id === order.waiter);
    if (!waiter) return "Unknown waiter";

    const name = waiter.full_name || `${waiter.first_name} ${waiter.last_name}`;
    return name.length > 12 ? name.substring(0, 12) + "..." : name;
  };

  // Get assigned table info
  const getAssignedTableInfo = (order: Order) => {
    if (!order.table || order.order_type !== "dine-in") return "N/A";
    const table = tables.find((t) => t.id === order.table);
    return table ? `Table ${table.table_number}` : "Unknown table";
  };

  // Check if waiter is assigned
  const hasWaiterAssigned = (order: Order) => {
    return !!order.waiter && waiters.some((w) => w.id === order.waiter);
  };

  // Check if table is assigned (for dine-in only)
  const hasTableAssigned = (order: Order) => {
    return (
      order.order_type === "dine-in" &&
      !!order.table &&
      tables.some((t) => t.id === order.table)
    );
  };

  // Get compact order type display
  const getCompactOrderType = (orderType: string) => {
    switch (orderType) {
      case "dine-in":
        return "Dine In";
      case "takeaway":
        return "Takeaway";
      case "delivery":
        return "Delivery";
      default:
        return orderType;
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <Table className="compact-table">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-24 py-3 text-xs font-medium tracking-wider text-gray-600 uppercase">
              Order ID
            </TableHead>
            <TableHead className="py-3 text-xs font-medium tracking-wider text-gray-600 uppercase">
              Customer
            </TableHead>
            <TableHead className="w-16 py-3 text-xs font-medium tracking-wider text-gray-600 uppercase">
              Type
            </TableHead>
            <TableHead className="w-28 py-3 text-xs font-medium tracking-wider text-gray-600 uppercase">
              Status
            </TableHead>
            <TableHead className="w-32 py-3 text-xs font-medium tracking-wider text-gray-600 uppercase">
              Waiter
            </TableHead>
            <TableHead className="w-24 py-3 text-xs font-medium tracking-wider text-gray-600 uppercase">
              Table
            </TableHead>
            <TableHead className="w-20 py-3 text-xs font-medium tracking-wider text-gray-600 uppercase">
              Total
            </TableHead>
            <TableHead className="w-16 py-3 text-xs font-medium tracking-wider text-gray-600 uppercase">
              Items
            </TableHead>
            <TableHead className="w-36 py-3 text-xs font-medium tracking-wider text-gray-600 uppercase">
              Created
            </TableHead>
            <TableHead className="w-20 py-3 text-right text-xs font-medium tracking-wider text-gray-600 uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer border-b border-gray-100 hover:bg-gray-50/80"
              onClick={() => onOrderSelect(order)}
            >
              <TableCell className="py-2.5">
                <div className="font-mono text-sm font-semibold text-gray-900">
                  {getOrderIdDisplay(order)}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div>
                  <div className="max-w-[120px] truncate text-sm font-medium text-gray-900">
                    {getCustomerName(order)}
                  </div>
                  <div className="max-w-[120px] truncate text-xs text-gray-500">
                    {getCustomerPhone(order)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-xs font-medium whitespace-nowrap text-gray-700">
                  {getCompactOrderType(getOrderType(order))}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <Badge
                  variant="outline"
                  className={`${statusColors[order.status]} flex h-5 w-fit items-center border px-1.5 py-0 text-xs font-normal`}
                >
                  {getStatusIcon(order.status)}
                  <span className="max-w-[80px] truncate">
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </Badge>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="flex items-center gap-1.5">
                  {hasWaiterAssigned(order) ? (
                    <>
                      <User className="h-3.5 w-3.5 text-green-500" />
                      <span className="max-w-[80px] truncate text-sm text-gray-700">
                        {getAssignedWaiterName(order)}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="h-3.5 w-3.5 text-gray-300" />
                      <span className="text-sm text-gray-400">
                        Not assigned
                      </span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="flex items-center gap-1.5">
                  {hasTableAssigned(order) ? (
                    <>
                      <TableIcon className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-sm text-gray-700">
                        {getAssignedTableInfo(order)}
                      </span>
                    </>
                  ) : order.order_type === "dine-in" ? (
                    <>
                      <TableIcon className="h-3.5 w-3.5 text-gray-300" />
                      <span className="text-sm text-gray-400">
                        Not assigned
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-sm font-semibold text-gray-900">
                  ${getTotalPrice(order)}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-center text-sm text-gray-600">
                  {getItemsCount(order)}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-xs text-gray-500">
                  {getCreatedAt(order)}
                </div>
              </TableCell>
              <TableCell className="py-2.5 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOrderSelect(order);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
