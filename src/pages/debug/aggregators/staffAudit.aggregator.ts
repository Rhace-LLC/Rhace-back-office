import {
  getAllStaff as getAllStaffList,
  getAuditSummary,
  getStaffActivity,
  getStaffReports,
} from "@/api-services/staffService";
import {
  createApiProbe,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

export const staffAuditAggregator: ServiceAggregatorDefinition = {
  id: "staff-audit",
  name: "Staff & Audit",
  serviceFile: "staffService.ts",
  description:
    "Read-only staff directory, performance reports, activity logs, and audit summary.",
  getProbes: ({ token, restaurantId }) => {
    if (!token) return [];
    const probes = [
      createApiProbe(
        "staff-all",
        "All staff",
        "GET",
        "/auth/all-staff",
        () => getAllStaffList(token)
      ),
      createApiProbe(
        "audit-reports",
        "Staff reports",
        "GET",
        "/audit/reports/",
        () => getStaffReports(undefined, token)
      ),
      createApiProbe(
        "audit-activity",
        "Staff activity",
        "GET",
        "/audit/activity/",
        () => getStaffActivity(undefined, token)
      ),
    ];

    if (restaurantId) {
      probes.push(
        createApiProbe(
          "audit-summary",
          "Audit summary",
          "GET",
          "/audit/summary/",
          () => getAuditSummary({ restaurant_id: restaurantId }, token)
        )
      );
    }

    return probes;
  },
};
