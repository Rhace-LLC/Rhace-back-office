import { useCallback, useEffect, useState } from "react";
import { Lightbulb, RefreshCcw, Sparkles, UtensilsCrossed } from "lucide-react";
import { ContentHOC } from "@/components/nocontent";
import { useAuth } from "@/contexts/AuthContext";
import {
  getBuildYourDish,
  getDidYouKnow,
  type BuildYourDishQuestionsResponse,
  type DidYouKnowResponse,
} from "@/api-services/entertainment";
import { parseError } from "@/api-services/utils/parseError";

const prettyCategory = (category: string) =>
  category.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function EntertainmentPage() {
  const auth = useAuth();

  const [didYouKnow, setDidYouKnow] = useState<DidYouKnowResponse | null>(null);
  const [buildYourDish, setBuildYourDish] =
    useState<BuildYourDishQuestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [facts, questions] = await Promise.all([
        getDidYouKnow(auth.token),
        getBuildYourDish(auth.token),
      ]);
      setDidYouKnow(facts);
      setBuildYourDish(questions);
    } catch (err) {
      setError(parseError(err) || "Failed to load entertainment content.");
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const hasContent = Boolean(
    didYouKnow?.facts?.length || buildYourDish?.questions?.length
  );

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 md:px-8 lg:px-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
            Entertainment
          </h1>
          <p className="mt-1 text-sm leading-5 text-ink-muted">
            Guest-facing content that keeps diners engaged while they order.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAll}
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
        noContent={!hasContent}
        loadingText="Fetching entertainment content..."
        noContentMessage="No entertainment content available."
        noContentBtnText="Refresh"
        noContentAction={fetchAll}
        errMessage={error || "Failed to load entertainment content."}
        actionFn={fetchAll}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Build your dish */}
          <section className="rounded-[16px] border border-line bg-cardfill p-6 shadow-[0_6px_18px_0_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface text-brand">
                <UtensilsCrossed className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-[14px] leading-5 font-medium text-ink">
                  Build Your Dish
                </h2>
                <p className="text-[11px] leading-[15px] text-ink-muted">
                  Guided questions shown to guests
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {(buildYourDish?.questions ?? []).map((question) => (
                <div
                  key={question.key}
                  className="rounded-[16px] border border-line-subtle bg-surface p-4"
                >
                  <p className="text-[13px] leading-5 font-medium text-ink">
                    {question.question}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <span
                        key={option.value}
                        className="rounded-[9999px] border border-line bg-cardfill px-3 py-1 text-[11px] leading-[15px] font-medium text-ink-secondary"
                      >
                        {option.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Did you know */}
          <section className="rounded-[16px] border border-line bg-cardfill p-6 shadow-[0_6px_18px_0_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface text-brand">
                <Lightbulb className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-[14px] leading-5 font-medium text-ink">
                  Did You Know?
                </h2>
                <p className="text-[11px] leading-[15px] text-ink-muted">
                  {didYouKnow?.count ?? 0} facts available
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-3">
              {(didYouKnow?.facts ?? []).map((fact) => (
                <li
                  key={fact.id}
                  className="rounded-[16px] border border-line-subtle bg-surface p-4"
                >
                  <span className="inline-flex items-center gap-1 text-[10px] leading-[14px] font-semibold tracking-[0.08em] text-brand uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    {prettyCategory(fact.category)}
                  </span>
                  <p className="mt-2 text-[13px] leading-5 text-ink-secondary">
                    {fact.text}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </ContentHOC>
    </div>
  );
}
