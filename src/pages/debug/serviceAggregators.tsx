import { ServiceAggregator } from "./ServiceAggregator";
import { authAggregator } from "./aggregators/auth.aggregator";
import { staffAuditAggregator } from "./aggregators/staffAudit.aggregator";
import { menuAggregator } from "./aggregators/menu.aggregator";
import { tablesAggregator } from "./aggregators/tables.aggregator";
import { ordersAggregator } from "./aggregators/orders.aggregator";
import { inventoryAggregator } from "./aggregators/inventory.aggregator";
import { shiftsAggregator } from "./aggregators/shifts.aggregator";
import { subaccountAggregator } from "./aggregators/subaccount.aggregator";
import { subaccountPayoutAggregator } from "./aggregators/subaccountPayout.aggregator";
import { subscriptionsAggregator } from "./aggregators/subscriptions.aggregator";
import { restaurantAggregator } from "./aggregators/restaurant.aggregator";
import { dashboardAggregator } from "./aggregators/dashboard.aggregator";
import { notificationsAggregator } from "./aggregators/notifications.aggregator";
import { promotionsAggregator } from "./aggregators/promotions.aggregator";
import { entertainmentAggregator } from "./aggregators/entertainment.aggregator";
import { seedsAggregator } from "./aggregators/seeds.aggregator";

/**
 * Each API service gets its own aggregator component.
 * Every component runs independently (own hook instance, own
 * run/clear/download state) and only issues safe GET requests.
 */
export function AuthAggregator() {
  return <ServiceAggregator definition={authAggregator} />;
}

export function StaffAuditAggregator() {
  return <ServiceAggregator definition={staffAuditAggregator} />;
}

export function MenuAggregator() {
  return <ServiceAggregator definition={menuAggregator} />;
}

export function TablesAggregator() {
  return <ServiceAggregator definition={tablesAggregator} />;
}

export function OrdersAggregator() {
  return <ServiceAggregator definition={ordersAggregator} />;
}

export function InventoryAggregator() {
  return <ServiceAggregator definition={inventoryAggregator} />;
}

export function ShiftsAggregator() {
  return <ServiceAggregator definition={shiftsAggregator} />;
}

export function SubaccountAggregator() {
  return <ServiceAggregator definition={subaccountAggregator} />;
}

export function SubaccountPayoutAggregator() {
  return <ServiceAggregator definition={subaccountPayoutAggregator} />;
}

export function SubscriptionsAggregator() {
  return <ServiceAggregator definition={subscriptionsAggregator} />;
}

export function RestaurantAggregator() {
  return <ServiceAggregator definition={restaurantAggregator} />;
}

export function DashboardAggregator() {
  return <ServiceAggregator definition={dashboardAggregator} />;
}

export function NotificationsAggregator() {
  return <ServiceAggregator definition={notificationsAggregator} />;
}

export function PromotionsAggregator() {
  return <ServiceAggregator definition={promotionsAggregator} />;
}

export function EntertainmentAggregator() {
  return <ServiceAggregator definition={entertainmentAggregator} />;
}

export function SeedsAggregator() {
  return <ServiceAggregator definition={seedsAggregator} />;
}
