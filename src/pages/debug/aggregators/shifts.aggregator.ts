import {
  clockInShift,
  clockOutShift,
  getShiftLogs,
} from "@/api-services/shift.service";
import {
  createApiProbe,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

export const shiftsAggregator: ServiceAggregatorDefinition = {
  id: "shifts",
  name: "Shifts",
  serviceFile: "shift.service.ts",
  description:
    "Shift log reads plus an opt-in write: clocks in and back out to exercise the full shift cycle.",
  hasWriteProbes: true,
  getProbes: ({ token }) => {
    if (!token) return [];
    return [
      createApiProbe("shifts-logs", "Shift logs", "GET", "/shifts/", () =>
        getShiftLogs(token)
      ),
      createApiProbe(
        "shifts-clock-in",
        "Clock in (test)",
        "POST",
        "/shifts/clock-in/",
        () => clockInShift({}, token),
        true
      ),
      createApiProbe(
        "shifts-clock-out",
        "Clock out (test)",
        "POST",
        "/shifts/clock-out/",
        () => clockOutShift({}, token),
        true
      ),
    ];
  },
};
