import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubscriptionPlan } from "@/api-services/subscriptiions.service";

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect }) => {
  const {
    name,
    base_price,
    staff_threshold,
    surcharge_percentage,
    grace_period_days,
    description,
    is_active,
  } = plan;

  const amount = Number(base_price || 0);
  const surcharge = Number(surcharge_percentage || 0);
  const featured = amount <= 0;

  const meta = featured
    ? surcharge > 0
      ? `${surcharge}% per transaction`
      : "No monthly commitment"
    : "Predictable monthly cost";

  const features: string[] = [];
  if (surcharge > 0) features.push(`${surcharge}% per transaction`);
  if (staff_threshold > 0)
    features.push(`Up to ${staff_threshold} staff accounts`);
  if (grace_period_days > 0)
    features.push(`${grace_period_days}-day grace period`);
  if (features.length === 0) features.push("A plan built for your restaurant.");

  const price = `₦${amount.toLocaleString()}`;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[16px] p-6",
        featured
          ? "bg-gradient-to-br from-brand via-brand-secondary to-brand-accent shadow-md"
          : "border border-line bg-surface",
        !is_active && "opacity-60"
      )}
    >
      <p
        className={cn(
          "text-[11px] leading-[15px] font-semibold tracking-[0.08em] uppercase",
          featured ? "text-white/80" : "text-brand"
        )}
      >
        {name}
      </p>
      <p
        className={cn(
          "mt-2 text-sm leading-5 font-medium",
          featured ? "text-white/90" : "text-ink"
        )}
      >
        {meta}
      </p>
      <p
        className={cn(
          "mt-1 text-[24px] leading-[29px] font-semibold tracking-[-0.4px]",
          featured ? "text-white" : "text-ink"
        )}
      >
        {price}
        <span
          className={cn(
            "ml-1 text-sm font-normal",
            featured ? "text-white/80" : "text-ink-muted"
          )}
        >
          /month
        </span>
      </p>
      {description && (
        <p
          className={cn(
            "mt-1.5 text-sm leading-5",
            featured ? "text-white/80" : "text-ink-muted"
          )}
        >
          {description}
        </p>
      )}
      <ul className="mt-4 flex-1 space-y-2">
        {features.map((point) => (
          <li
            key={point}
            className={cn(
              "flex items-center gap-2 text-sm leading-5",
              featured ? "text-white/90" : "text-ink"
            )}
          >
            <Check
              className={cn(
                "h-4 w-4 shrink-0",
                featured ? "text-white" : "text-brand"
              )}
            />
            {point}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onSelect(plan)}
        disabled={!is_active}
        className={cn(
          "mt-6 inline-flex h-12 w-full items-center justify-center rounded-[8px] text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
          featured
            ? "bg-white text-brand hover:bg-surface"
            : "border border-line bg-surface text-ink hover:border-ink hover:bg-cardfill"
        )}
      >
        {is_active ? `Choose ${name}` : "Unavailable"}
      </button>
    </div>
  );
};
