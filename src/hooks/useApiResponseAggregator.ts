import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { parseError } from "@/api-services/utils/parseError";
import {
  applyPromotions,
  createPromotion,
  getPromotion,
  listPromotions,
  togglePromotion,
  type PromotionPayload,
} from "@/api-services/promotion";
import {
  createBuildYourDish,
  getBuildYourDish,
  getDidYouKnow,
} from "@/api-services/entertainment";

export interface AggregatedResponse {
  id: string;
  label: string;
  method: string;
  url: string;
  ok: boolean;
  timestamp: string;
  response?: unknown;
  error?: string;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const extractPromotionId = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    const first = asRecord(value[0]);
    return typeof first?.id === "string" ? first.id : undefined;
  }
  const record = asRecord(value);
  return typeof record?.id === "string" ? record.id : undefined;
};

/** A minimal, deliberately-inactive payload so POST probes don't affect diners. */
const buildTestPayload = (): PromotionPayload => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const pad = (value: number) => String(value).padStart(2, "0");
  const endTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
    now.getSeconds()
  )}`;

  return {
    name: `[API-TEST] ${now.toISOString()}`,
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

/** Valid answers are derived from the build-your-dish question options. */
const buildYourDishAnswers = {
  mood: "comforting",
  spice_tolerance: "mild",
  appetite: "meal",
};

const toPlainText = (payload: {
  generated_at: string;
  restaurant_id: string | null;
  total: number;
  responses: AggregatedResponse[];
}) =>
  [
    `Generated at: ${payload.generated_at}`,
    `Restaurant: ${payload.restaurant_id ?? "—"}`,
    `Total probes: ${payload.total}`,
    "",
    ...payload.responses.map((item) =>
      [
        "=".repeat(64),
        `${item.method} ${item.url}`,
        `Label: ${item.label}`,
        `OK: ${item.ok}`,
        item.error ? `Error: ${item.error}` : "Response:",
        item.error ? "" : JSON.stringify(item.response, null, 2),
        "",
      ].join("\n")
    ),
  ].join("\n");

export const useApiResponseAggregator = () => {
  const auth = useAuth();
  const restaurantId = auth.restaurants?.[0]?.id;

  const [responses, setResponses] = useState<AggregatedResponse[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!restaurantId) {
      setError("No restaurant id available for this account.");
      return;
    }

    setRunning(true);
    setError(null);
    setResponses([]);

    const collected: AggregatedResponse[] = [];
    const record = (item: Omit<AggregatedResponse, "timestamp">) => {
      collected.push({ ...item, timestamp: new Date().toISOString() });
      setResponses([...collected]);
    };

    const probe = async (
      label: string,
      method: string,
      url: string,
      fn: () => Promise<unknown>
    ): Promise<unknown> => {
      try {
        const response = await fn();
        record({
          id: crypto.randomUUID(),
          label,
          method,
          url,
          ok: true,
          response,
        });
        return response;
      } catch (err) {
        record({
          id: crypto.randomUUID(),
          label,
          method,
          url,
          ok: false,
          error: parseError(err),
        });
        return undefined;
      }
    };

    const base = `/menu/restaurant/${restaurantId}/promotions`;

    const listResult = await probe("Promotions — list", "GET", `${base}/`, () =>
      listPromotions(restaurantId, auth.token)
    );

    const createdResult = await probe(
      "Promotions — create (test)",
      "POST",
      `${base}/`,
      () => createPromotion(restaurantId, buildTestPayload(), auth.token)
    );

    const promotionId =
      extractPromotionId(createdResult) ?? extractPromotionId(listResult);

    if (promotionId) {
      await probe(
        "Promotion — detail",
        "GET",
        `${base}/${promotionId}/`,
        () => getPromotion(restaurantId, promotionId, auth.token)
      );

      await probe(
        "Promotion — toggle",
        "POST",
        `${base}/${promotionId}/toggle/`,
        () => togglePromotion(restaurantId, promotionId, auth.token)
      );
    }

    await probe("Promotions — apply", "POST", `${base}/apply/`, () =>
      applyPromotions(restaurantId, auth.token)
    );

    await probe(
      "Entertainment — build-your-dish",
      "GET",
      "/entertainment/build-your-dish/",
      () => getBuildYourDish(auth.token)
    );

    await probe(
      "Entertainment — did-you-know",
      "GET",
      "/entertainment/did-you-know/",
      () => getDidYouKnow(auth.token)
    );

    await probe(
      "Entertainment — create build-your-dish",
      "POST",
      `/entertainment/restaurants/${restaurantId}/build-your-dish/`,
      () =>
        createBuildYourDish(
          restaurantId,
          { ...buildYourDishAnswers },
          auth.token
        )
    );

    setRunning(false);
  };

  const download = (format: "json" | "txt") => {
    const payload = {
      generated_at: new Date().toISOString(),
      restaurant_id: restaurantId ?? null,
      total: responses.length,
      responses,
    };

    const content =
      format === "json" ? JSON.stringify(payload, null, 2) : toPlainText(payload);

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rhace-api-responses-${Date.now()}.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    setResponses([]);
    setError(null);
  };

  return { restaurantId, responses, running, error, run, download, clear };
};
