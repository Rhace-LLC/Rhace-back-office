import type { ServiceAggregatorDefinition } from "../aggregator.types";
import { authAggregator } from "./auth.aggregator";
import { staffAuditAggregator } from "./staffAudit.aggregator";
import { menuAggregator } from "./menu.aggregator";
import { tablesAggregator } from "./tables.aggregator";
import { ordersAggregator } from "./orders.aggregator";
import { inventoryAggregator } from "./inventory.aggregator";
import { shiftsAggregator } from "./shifts.aggregator";
import { subaccountAggregator } from "./subaccount.aggregator";
import { subaccountPayoutAggregator } from "./subaccountPayout.aggregator";
import { subscriptionsAggregator } from "./subscriptions.aggregator";
import { restaurantAggregator } from "./restaurant.aggregator";
import { dashboardAggregator } from "./dashboard.aggregator";
import { notificationsAggregator } from "./notifications.aggregator";
import { promotionsAggregator } from "./promotions.aggregator";
import { entertainmentAggregator } from "./entertainment.aggregator";
import { seedsAggregator } from "./seeds.aggregator";

export const serviceAggregatorDefinitions: ServiceAggregatorDefinition[] = [
  authAggregator,
  staffAuditAggregator,
  menuAggregator,
  tablesAggregator,
  ordersAggregator,
  inventoryAggregator,
  shiftsAggregator,
  subaccountAggregator,
  subaccountPayoutAggregator,
  subscriptionsAggregator,
  restaurantAggregator,
  dashboardAggregator,
  notificationsAggregator,
  promotionsAggregator,
  entertainmentAggregator,
  seedsAggregator,
];

/**
 * Request-making production service modules covered by the debug surface.
 * `utils/types.service.ts` is intentionally excluded: it only holds types.
 * `temp.service.ts` is excluded: it has no safe GET endpoints.
 */
export const apiServiceModules = [
  { serviceFile: "auth.service.ts" },
  { serviceFile: "staffService.ts" },
  { serviceFile: "menu.service.ts" },
  { serviceFile: "tableService.ts" },
  { serviceFile: "order.service.ts" },
  { serviceFile: "orderService.ts" },
  { serviceFile: "inventory.service.ts" },
  { serviceFile: "shift.service.ts" },
  { serviceFile: "subaccount.service.ts" },
  { serviceFile: "subaccountpayout.service.ts" },
  { serviceFile: "subscriptiions.service.ts" },
  { serviceFile: "restaurantProfile.ts" },
  { serviceFile: "dashboardService.ts" },
  { serviceFile: "notificationService.ts" },
  { serviceFile: "promotion/index.ts" },
  { serviceFile: "entertainment/index.ts" },
  { serviceFile: "seeds/index.ts" },
];
