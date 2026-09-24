import {
  createBuildYourDish,
  getBuildYourDish,
  getDidYouKnow,
} from "@/api-services/entertainment";
import {
  createApiProbe,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

export const entertainmentAggregator: ServiceAggregatorDefinition = {
  id: "entertainment",
  name: "Entertainment",
  serviceFile: "entertainment/index.ts",
  description:
    "Entertainment reads plus an opt-in write: a build-your-dish recommendation request.",
  hasWriteProbes: true,
  getProbes: ({ token, restaurantId }) => {
    const probes = [
      createApiProbe(
        "entertainment-build-dish",
        "Build-your-dish questions",
        "GET",
        "/entertainment/build-your-dish/",
        () => getBuildYourDish(token)
      ),
      createApiProbe(
        "entertainment-did-you-know",
        "Did-you-know",
        "GET",
        "/entertainment/did-you-know/",
        () => getDidYouKnow(token)
      ),
    ];

    if (restaurantId) {
      probes.push(
        createApiProbe(
          "entertainment-build-dish-create",
          "Build-your-dish recommendation",
          "POST",
          `/entertainment/restaurants/${restaurantId}/build-your-dish/`,
          () =>
            createBuildYourDish(
              restaurantId,
              {
                mood: "comforting",
                spice_tolerance: "mild",
                appetite: "meal",
              },
              token
            ),
          true
        )
      );
    }

    return probes;
  },
};
