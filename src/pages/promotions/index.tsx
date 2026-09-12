import { useCallback, useEffect, useState } from "react";
import { BadgePercent, CalendarRange, Layers, RefreshCcw } from "lucide-react";
import { ContentHOC } from "@/components/nocontent";
import { useAuth } from "@/contexts/AuthContext";
import { listPromotions, type Promotion } from "@/api-services/promotion";
import { parseError } from "@/api-services/utils/parseError";
import { cn } from "@/lib/utils";

const formatDate = (value: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

export default function PromotionsPage() {
  const auth = useAuth();
  const restaurantId = auth.restaurants?.[0]?.id;

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPromotions = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      setError("");
      const res = await listPromotions(restaurantId, auth.token);
      setPromotions(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(parseError(err) || "Failed to load promotions.");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, auth.token]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 md:px-8 lg:px-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
            Promotions
          </h1>
          <p className="mt-1 text-sm leading-5 text-ink-muted">
            Create and manage discounts across your menu.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPromotions}
          className="inline-flex h-10 w-max items-center gap-2 rounded-[10px] border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors duration-150 hover:border-ink focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      <div className="py-4" />

      <ContentHOC
        loading={loading}
        error={!!error}
        noContent={promotions.length === 0}
        loadingText="Fetching promotions..."
        noContentMessage="No promotions yet."
        noContentBtnText="Refresh"
        noContentAction={fetchPromotions}
        errMessage={error || "Failed to load promotions."}
        actionFn={fetchPromotions}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promotion) => (
            <article
              key={promotion.id}
              className="flex flex-col rounded-[16px] border border-line bg-cardfill p-6 shadow-[0_6px_18px_0_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-[14px] leading-5 font-medium text-ink">
                    {promotion.name}
                  </h2>
                  <p className="mt-1 text-[11px] leading-[15px] text-ink-muted">
                    by {promotion.created_by_name || "—"}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-[9999px] px-2.5 py-1 text-[10px] leading-[14px] font-semibold tracking-[0.08em] uppercase",
                    promotion.is_active
                      ? "bg-brand text-white"
                      : "bg-line text-ink-muted"
                  )}
                >
                  {promotion.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {promotion.description && (
                <p className="mt-3 line-clamp-2 text-sm leading-5 text-ink-secondary">
                  {promotion.description}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2">
                <BadgePercent className="h-5 w-5 text-brand" />
                <span className="text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
                  {promotion.percentage}%
                </span>
                <span className="text-sm text-ink-muted">off</span>
              </div>

              <div className="mt-4 space-y-2 border-t border-line-subtle pt-4 text-[13px] leading-5 text-ink-secondary">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 shrink-0 text-ink-subtle" />
                  <span>
                    {formatDate(promotion.start_date)} –{" "}
                    {formatDate(promotion.end_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 shrink-0 text-ink-subtle" />
                  <span>
                    {promotion.applies_to_all
                      ? "Applies to all items"
                      : `Applies to ${promotion.menu_items.length} item(s)`}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </ContentHOC>
    </div>
  );
}
