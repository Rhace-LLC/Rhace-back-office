import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
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
    <PageContainer>
      <PageHeader
        title="Entertainment"
        description="Guest-facing content that keeps diners engaged while they order."
        actions={
          <Button variant="outline" onClick={fetchAll}>
            <RefreshCcw /> Refresh
          </Button>
        }
      />
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
          <section className="rounded-[20px] border border-line bg-cardfill p-6 shadow-md">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-surface text-brand">
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
                  className="rounded-[20px] border border-line-subtle bg-surface p-4"
                >
                  <p className="text-[13px] leading-5 font-medium text-ink">
                    {question.question}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <span
                        key={option.value}
                        className="rounded-full border border-line bg-cardfill px-3 py-1 text-[11px] leading-[15px] font-medium text-ink-secondary"
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
          <section className="rounded-[20px] border border-line bg-cardfill p-6 shadow-md">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-surface text-brand">
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
                  className="rounded-[20px] border border-line-subtle bg-surface p-4"
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
    </PageContainer>
  );
}
