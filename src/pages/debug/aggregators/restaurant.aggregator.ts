import {
  getRestaurantProfile,
  listRestaurantProfiles,
} from "@/api-services/restaurantProfile";
import {
  createApiProbe,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

// Reads only on purpose: update/patch/complete-onboarding/update-step all
// mutate the live restaurant profile or its onboarding state.

export const restaurantAggregator: ServiceAggregatorDefinition = {
  id: "restaurant",
  name: "Restaurant Profile",
  serviceFile: "restaurantProfile.ts",
  description: "Read-only restaurant profile listing and detail lookup.",
  getProbes: ({ token, restaurantId }) => {
    if (!token) return [];
    const probes = [
      createApiProbe(
        "restaurants-list",
        "Restaurant list",
        "GET",
        "/restaurants/list/",
        () => listRestaurantProfiles(token)
      ),
    ];

    if (restaurantId) {
      probes.push(
        createApiProbe(
          "restaurants-detail",
          "Restaurant detail",
          "GET",
          `/restaurants/get/${restaurantId}`,
          () => getRestaurantProfile(restaurantId, token)
        )
      );
    }

    return probes;
  },
};
