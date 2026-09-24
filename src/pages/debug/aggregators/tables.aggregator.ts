import { getAllTables } from "@/api-services/tableService";
import {
  createApiProbe,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

export const tablesAggregator: ServiceAggregatorDefinition = {
  id: "tables",
  name: "Tables",
  serviceFile: "tableService.ts",
  description: "Read-only table listing for the current restaurant.",
  requiresRestaurantId: true,
  getProbes: ({ token, restaurantId }) => {
    if (!token || !restaurantId) return [];
    return [
      createApiProbe(
        "tables-all",
        "All tables",
        "GET",
        `/menu/restaurant/${restaurantId}/tables/`,
        () => getAllTables(token, restaurantId)
      ),
    ];
  },
};
