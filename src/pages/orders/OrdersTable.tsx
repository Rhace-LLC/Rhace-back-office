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
import { Eye, Clock, Truck, User, Table as TableIcon, Check } from "lucide-react";
import type { Order } from "./types/order";
import { Staff } from "../../api-services/staffService";
import { Table as TableType } from "../../api-services/tableService";
import formatPrice from "@/utils/formatPrice";

// Define OrderStatus locally to avoid import issues
type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"
  | "delivered";

interface OrdersTableProps {
  orders: Order[];
  onOrderSelect: (order: Order) => void;
  waiters: Staff[];
  tables: TableType[];
  isWaiter?: boolean;
  confirmingIds?: Set<string>;
  onWaiterConfirm?: (orderId: string) => void;
}

const statusColors: Record<OrderStatus, string> = {
  received: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-inset text-ink border-line",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  delivered: "bg-purple-100 text-purple-800 border-purple-200",
};

export function OrdersTable({
  orders,
  onOrderSelect,
  waiters,
  tables,
  isWaiter = false,
  confirmingIds,
  onWaiterConfirm,
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
      ? formatPrice(order.total_price)
      : formatPrice(0);
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

  // Get assigned table info - FIXED: Show table info even if not available
  const getAssignedTableInfo = (order: Order) => {
    if (!order.table || order.order_type !== "dine-in") return "N/A";
    const table = tables.find((t) => t.id === order.table);
    if (!table) return "Unknown table";

    return `Table ${table.table_number} (${table.max_party_size} seats)`;
  };

  // Get table availability status
  const getTableAvailabilityStatus = (order: Order) => {
    if (!order.table || order.order_type !== "dine-in") return null;
    const table = tables.find((t) => t.id === order.table);
    if (!table) return null;

    return table.is_available ? "available" : "occupied";
  };

  // Check if waiter is assigned
  const hasWaiterAssigned = (order: Order) => {
    return !!order.waiter && waiters.some((w) => w.id === order.waiter);
  };

  // FIXED: Check if table is assigned (regardless of availability)
  const hasTableAssigned = (order: Order) => {
    return (
      order.order_type === "dine-in" &&
      !!order.table &&
      tables.some((t) => t.id === order.table)
    );
  };

  // Waiter confirmation is only meaningful while status is `received`.
  // `waiter_confirmed` may be undefined on older payloads — treat as unconfirmed.
  const needsConfirmation = (order: Order) =>
    order.status === "received" && !order.waiter_confirmed;

  const isConfirmed = (order: Order) =>
    order.status === "received" && !!order.waiter_confirmed;

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
    <div className="rounded-3xl border border-line bg-surface shadow-sm">
      <Table className="compact-table">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-24 py-3 text-xs font-medium tracking-wider text-ink-secondary uppercase">
              Order ID
            </TableHead>
            <TableHead className="py-3 text-xs font-medium tracking-wider text-ink-secondary uppercase">
              Customer
            </TableHead>
            <TableHead className="w-16 py-3 text-xs font-medium tracking-wider text-ink-secondary uppercase">
              Type
            </TableHead>
            <TableHead className="w-28 py-3 text-xs font-medium tracking-wider text-ink-secondary uppercase">
              Status
            </TableHead>
            <TableHead className="w-32 py-3 text-xs font-medium tracking-wider text-ink-secondary uppercase">
              Waiter
            </TableHead>
            <TableHead className="w-24 py-3 text-xs font-medium tracking-wider text-ink-secondary uppercase">
              Table
            </TableHead>
            <TableHead className="w-20 py-3 text-xs font-medium tracking-wider text-ink-secondary uppercase">
              Total
            </TableHead>
            <TableHead className="w-16 py-3 text-xs font-medium tracking-wider text-ink-secondary uppercase">
              Items
            </TableHead>
            <TableHead className="w-36 py-3 text-xs font-medium tracking-wider text-ink-secondary uppercase">
              Created
            </TableHead>
            <TableHead className="w-20 py-3 text-right text-xs font-medium tracking-wider text-ink-secondary uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer border-b border-line-subtle hover:bg-inset/80"
              onClick={() => onOrderSelect(order)}
            >
              <TableCell className="py-2.5">
                <div className="font-mono text-sm font-semibold text-ink">
                  {getOrderIdDisplay(order)}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div>
                  <div className="max-w-[120px] truncate text-sm font-medium text-ink">
                    {getCustomerName(order)}
                  </div>
                  <div className="max-w-[120px] truncate text-xs text-ink-muted">
                    {getCustomerPhone(order)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-xs font-medium whitespace-nowrap text-ink-secondary">
                  {getCompactOrderType(getOrderType(order))}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="flex flex-col gap-1">
                  <Badge
                    variant="outline"
                    className={`${statusColors[order.status as OrderStatus]} flex h-5 w-fit items-center border px-1.5 py-0 text-xs font-normal`}
                  >
                    {getStatusIcon(order.status as OrderStatus)}
                    <span className="max-w-[80px] truncate">
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </Badge>
                  {needsConfirmation(order) && (
                    <Badge
                      variant="outline"
                      className="flex h-5 w-fit items-center border border-amber-200 bg-amber-50 px-1.5 py-0 text-xs font-normal text-amber-700"
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      Awaiting confirm
                    </Badge>
                  )}
                  {isConfirmed(order) && (
                    <Badge
                      variant="outline"
                      className="flex h-5 w-fit items-center border border-green-200 bg-green-50 px-1.5 py-0 text-xs font-normal text-green-700"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Confirmed
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="flex items-center gap-1.5">
                  {hasWaiterAssigned(order) ? (
                    <>
                      <User className="h-3.5 w-3.5 text-green-500" />
                      <span className="max-w-[80px] truncate text-sm text-ink-secondary">
                        {getAssignedWaiterName(order)}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="h-3.5 w-3.5 text-ink-subtle" />
                      <span className="text-sm text-ink-subtle">
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
                      <div className="flex flex-col">
                        <span className="text-sm text-ink-secondary">
                          {getAssignedTableInfo(order)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`px-1 py-0 text-xs ${
                              getTableAvailabilityStatus(order) === "available"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {getTableAvailabilityStatus(order) === "available"
                              ? "Available"
                              : "Occupied"}
                          </Badge>
                        </div>
                      </div>
                    </>
                  ) : order.order_type === "dine-in" ? (
                    <>
                      <TableIcon className="h-3.5 w-3.5 text-ink-subtle" />
                      <span className="text-sm text-ink-subtle">
                        Not assigned
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-ink-subtle">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-sm font-semibold text-ink">
                  {getTotalPrice(order)}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-center text-sm text-ink-secondary">
                  {getItemsCount(order)}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="text-xs text-ink-muted">
                  {getCreatedAt(order)}
                </div>
              </TableCell>
              <TableCell className="py-2.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  {isWaiter &&
                    needsConfirmation(order) &&
                    onWaiterConfirm && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 border-green-200 bg-green-50 px-2 text-xs text-green-700 hover:bg-green-100"
                        disabled={confirmingIds?.has(order.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onWaiterConfirm(String(order.id));
                        }}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        {confirmingIds?.has(order.id) ? "Confirming…" : "Confirm"}
                      </Button>
                    )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-inset-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOrderSelect(order);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
