// components/OrdersTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  [OrderStatus.RECEIVED]: "bg-blue-100 text-blue-800 border-blue-200",
  [OrderStatus.PREPARING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [OrderStatus.READY]: "bg-green-100 text-green-800 border-green-200",
  [OrderStatus.COMPLETED]: "bg-gray-100 text-gray-800 border-gray-200",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
  [OrderStatus.DELIVERED]: "bg-purple-100 text-purple-800 border-purple-200",
};

const orderTypeColors = {
  "dine-in": "bg-blue-50 text-blue-700 border-blue-200",
  "delivery": "bg-green-50 text-green-700 border-green-200",
  "takeaway": "bg-orange-50 text-orange-700 border-orange-200",
};

export function OrdersTable({ orders, onOrderSelect, waiters, tables }: OrdersTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RECEIVED:
      case OrderStatus.PREPARING:
        return <Clock className="h-3 w-3 mr-1" />;
      case OrderStatus.READY:
      case OrderStatus.DELIVERED:
        return <Truck className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  // ✅ SAFE ACCESSOR FUNCTIONS
  const getCustomerName = (order: Order) => {
    return order?.customer_name || 'N/A';
  };

  const getCustomerPhone = (order: Order) => {
    return order?.customer_phone || 'N/A';
  };

  const getTotalPrice = (order: Order) => {
    return order?.total_price ? parseFloat(order.total_price).toFixed(2) : '0.00';
  };

  const getOrderType = (order: Order) => {
    return order?.order_type || 'unknown';
  };

  const getCreatedAt = (order: Order) => {
    return order?.created_at ? formatDate(order.created_at) : 'N/A';
  };

  const getItemsCount = (order: Order) => {
    return order?.items?.length || 0;
  };

  // ✅ FIXED: Safe order ID display
  const getOrderIdDisplay = (order: Order) => {
    if (!order?.id) return 'N/A';
    
    // Convert to string and take last 8 characters
    const idString = String(order.id);
    return `#${idString.slice(-8)}`;
  };

  // Get assigned waiter name
  const getAssignedWaiterName = (order: Order) => {
    if (!order.waiter) return 'No waiter';
    const waiter = waiters.find(w => w.id === order.waiter);
    if (!waiter) return 'Unknown waiter';
    
    const name = waiter.full_name || `${waiter.first_name} ${waiter.last_name}`;
    return name.length > 12 ? name.substring(0, 12) + '...' : name;
  };

  // Get assigned table info
  const getAssignedTableInfo = (order: Order) => {
    if (!order.table || order.order_type !== 'dine-in') return 'N/A';
    const table = tables.find(t => t.id === order.table);
    return table ? `Table ${table.table_number}` : 'Unknown table';
  };

  // Check if waiter is assigned
  const hasWaiterAssigned = (order: Order) => {
    return !!order.waiter && waiters.some(w => w.id === order.waiter);
  };

  // Check if table is assigned (for dine-in only)
  const hasTableAssigned = (order: Order) => {
    return order.order_type === 'dine-in' && !!order.table && tables.some(t => t.id === order.table);
  };

  // Get compact order type display
  const getCompactOrderType = (orderType: string) => {
    switch (orderType) {
      case 'dine-in': return 'Dine In';
      case 'takeaway': return 'Takeaway';
      case 'delivery': return 'Delivery';
      default: return orderType;
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <Table className="compact-table">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-24 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Order ID</TableHead>
            <TableHead className="py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</TableHead>
            <TableHead className="w-16 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Type</TableHead>
            <TableHead className="w-28 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</TableHead>
            <TableHead className="w-32 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Waiter</TableHead>
            <TableHead className="w-24 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Table</TableHead>
            <TableHead className="w-20 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Total</TableHead>
            <TableHead className="w-16 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Items</TableHead>
            <TableHead className="w-36 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Created</TableHead>
            <TableHead className="w-20 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow 
              key={order.id} 
              className="hover:bg-gray-50/80 cursor-pointer border-b border-gray-100"
              onClick={() => onOrderSelect(order)}
            >
              <TableCell className="py-2.5">
                <div className="font-mono text-sm font-semibold text-gray-900">
                  {getOrderIdDisplay(order)}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {getCustomerName(order)}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[120px]">
                    {getCustomerPhone(order)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-xs font-medium text-gray-700 whitespace-nowrap">
                  {getCompactOrderType(getOrderType(order))}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <Badge 
                  variant="outline" 
                  className={`${statusColors[order.status]} flex items-center w-fit text-xs px-1.5 py-0 h-5 border font-normal`}
                >
                  {getStatusIcon(order.status)}
                  <span className="truncate max-w-[80px]">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </Badge>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="flex items-center gap-1.5">
                  {hasWaiterAssigned(order) ? (
                    <>
                      <User className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-sm text-gray-700 truncate max-w-[80px]">
                        {getAssignedWaiterName(order)}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="h-3.5 w-3.5 text-gray-300" />
                      <span className="text-sm text-gray-400">Not assigned</span>
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
                  ) : order.order_type === 'dine-in' ? (
                    <>
                      <TableIcon className="h-3.5 w-3.5 text-gray-300" />
                      <span className="text-sm text-gray-400">Not assigned</span>
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
                <div className="text-sm text-gray-600 text-center">
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