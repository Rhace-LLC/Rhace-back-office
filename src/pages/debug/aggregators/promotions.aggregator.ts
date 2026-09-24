import {
  applyPromotions,
  createPromotion,
  deletePromotion,
  getPromotion,
  listPromotions,
  patchPromotion,
  togglePromotion,
  updatePromotion,
  type PromotionPayload,
} from "@/api-services/promotion";
import {
  createApiProbe,
  extractFirstId,
  requireTestId,
  testName,
  type ServiceAggregatorDefinition,
} from "../aggregator.types";

/** A deliberately inactive payload so write probes stay low-impact. */
const buildTestPayload = (): PromotionPayload => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const pad = (value: number) => String(value).padStart(2, "0");
  const endTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
    now.getSeconds()
  )}`;

  return {
    name: testName("promotion"),
    description: "Automated API response probe. Safe to delete.",
    percentage: "1",
    start_date: today,
    end_date: today,
    end_time: endTime,
    applies_to_all: true,
    is_active: false,
    menu_items: [],
  };
};

export const promotionsAggregator: ServiceAggregatorDefinition = {
  id: "promotions",
  name: "Promotions",
  serviceFile: "promotion/index.ts",
  description:
    "Promotion reads plus opt-in writes: creates an inactive [API-TEST] promotion, touches it, then deletes it.",
  requiresRestaurantId: true,
  hasWriteProbes: true,
  getProbes: ({ token, restaurantId }) => {
    if (!token || !restaurantId) return [];
    const base = `/menu/restaurant/${restaurantId}/promotions`;
    const ids: { promotionId?: string } = {};

    return [
      createApiProbe(
        "promotions-list",
        "Promotion list",
        "GET",
        `${base}/`,
        () => listPromotions(restaurantId, token)
      ),
      createApiProbe(
        "promotions-detail-first",
        "Promotion detail (first)",
        "GET",
        `${base}/:id/`,
        async () => {
          const id = extractFirstId(
            await listPromotions(restaurantId, token)
          );
          if (!id) throw new Error("Skipped: no promotions found");
          return getPromotion(restaurantId, id, token);
        }
      ),
      createApiProbe(
        "promotions-create",
        "Create promotion (test)",
        "POST",
        `${base}/`,
        async () => {
          const created = await createPromotion(
            restaurantId,
            buildTestPayload(),
            token
          );
          ids.promotionId = created.id;
          return created;
        },
        true
      ),
      createApiProbe(
        "promotions-detail",
        "Test promotion detail",
        "GET",
        `${base}/:id/`,
        () =>
          getPromotion(
            restaurantId,
            requireTestId(ids.promotionId, "read test promotion"),
            token
          )
      ),
      createApiProbe(
        "promotions-update",
        "Update test promotion",
        "PUT",
        `${base}/:id/`,
        () =>
          updatePromotion(
            restaurantId,
            requireTestId(ids.promotionId, "update test promotion"),
            {
              ...buildTestPayload(),
              description: "Updated by automated API probe. Safe to delete.",
            },
            token
          ),
        true
      ),
      createApiProbe(
        "promotions-patch",
        "Patch test promotion",
        "PATCH",
        `${base}/:id/`,
        () =>
          patchPromotion(
            restaurantId,
            requireTestId(ids.promotionId, "patch test promotion"),
            { description: "Patched by automated API probe." },
            token
          ),
        true
      ),
      createApiProbe(
        "promotions-toggle",
        "Toggle test promotion",
        "POST",
        `${base}/:id/toggle/`,
        () =>
          togglePromotion(
            restaurantId,
            requireTestId(ids.promotionId, "toggle test promotion"),
            token
          ),
        true
      ),
      createApiProbe(
        "promotions-apply",
        "Apply promotions",
        "POST",
        `${base}/apply/`,
        () => applyPromotions(restaurantId, token),
        true
      ),
      createApiProbe(
        "promotions-delete",
        "Delete test promotion (cleanup)",
        "DELETE",
        `${base}/:id/`,
        () =>
          deletePromotion(
            restaurantId,
            requireTestId(ids.promotionId, "delete test promotion"),
            token
          ),
        true
      ),
    ];
  },
};
