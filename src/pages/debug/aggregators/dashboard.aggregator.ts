import {
  getDashboardData,
  getDashboardStats,
} from "@/api-services/dashboardService";
import {
  createApiProbe,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

export const dashboardAggregator: ServiceAggregatorDefinition = {
  id: "dashboard",
  name: "Dashboard",
  serviceFile: "dashboardService.ts",
  description: "Read-only dashboard overview and stats.",
  getProbes: ({ token }) => {
    if (!token) return [];
    return [
      createApiProbe(
        "dashboard-overview",
        "Dashboard overview",
        "GET",
        "/dashboard/dashboard/",
        () => getDashboardData(token)
      ),
      createApiProbe(
        "dashboard-stats",
        "Dashboard stats",
        "GET",
        "/dashboard/dashboard/stats/",
        () => getDashboardStats(token)
      ),
    ];
  },
};
