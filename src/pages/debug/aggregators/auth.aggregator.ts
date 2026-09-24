import {
  getAllStaff,
  getMe,
  getProfile,
  getRestaurantByIdentifier,
} from "@/api-services/auth.service";
import {
  createApiProbe,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

// Reads only on purpose: every auth write either needs credentials/OTPs,
// mutates real staff (invite/toggle), alters the signed-in profile/password,
// or ends the session (logout), so none are safe to fire automatically.

export const authAggregator: ServiceAggregatorDefinition = {
  id: "auth",
  name: "Auth",
  serviceFile: "auth.service.ts",
  description: "Read-only auth lookups: current user, profile, staff, restaurant.",
  getProbes: ({ token, restaurantId, restaurantSlug }) => {
    if (!token) return [];
    const probes = [
      createApiProbe("auth-me", "Current user", "GET", "/auth/me/", () =>
        getMe(token)
      ),
      createApiProbe(
        "auth-profile",
        "User profile",
        "GET",
        "/auth/profile/",
        () => getProfile(token)
      ),
      createApiProbe(
        "auth-all-staff",
        "All staff",
        "GET",
        "/auth/all-staff",
        () => getAllStaff(token)
      ),
    ];

    const identifier = restaurantSlug ?? restaurantId;
    if (identifier) {
      probes.push(
        createApiProbe(
          "auth-restaurant",
          "Restaurant by identifier",
          "GET",
          `/auth/restaurant/${identifier}/`,
          () => getRestaurantByIdentifier(identifier, token)
        )
      );
    }

    return probes;
  },
};
