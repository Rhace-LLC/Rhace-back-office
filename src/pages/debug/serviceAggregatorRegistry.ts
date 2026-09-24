import { serviceAggregatorDefinitions } from "./aggregators";
import {
  AuthAggregator,
  DashboardAggregator,
  EntertainmentAggregator,
  InventoryAggregator,
  MenuAggregator,
  NotificationsAggregator,
  OrdersAggregator,
  PromotionsAggregator,
  RestaurantAggregator,
  SeedsAggregator,
  ShiftsAggregator,
  StaffAuditAggregator,
  SubaccountAggregator,
  SubaccountPayoutAggregator,
  SubscriptionsAggregator,
  TablesAggregator,
} from "./serviceAggregators";

/**
 * One independently runnable card per API service. Each component owns its
 * hook instance, so services run in isolation and export their own results.
 */
export const serviceAggregators = [
  { id: "auth", component: AuthAggregator },
  { id: "staff-audit", component: StaffAuditAggregator },
  { id: "menu", component: MenuAggregator },
  { id: "tables", component: TablesAggregator },
  { id: "orders", component: OrdersAggregator },
  { id: "inventory", component: InventoryAggregator },
  { id: "shifts", component: ShiftsAggregator },
  { id: "subaccount", component: SubaccountAggregator },
  { id: "subaccount-payout", component: SubaccountPayoutAggregator },
  { id: "subscriptions", component: SubscriptionsAggregator },
  { id: "restaurant", component: RestaurantAggregator },
  { id: "dashboard", component: DashboardAggregator },
  { id: "notifications", component: NotificationsAggregator },
  { id: "promotions", component: PromotionsAggregator },
  { id: "entertainment", component: EntertainmentAggregator },
  { id: "seeds", component: SeedsAggregator },
];

export { serviceAggregatorDefinitions };
