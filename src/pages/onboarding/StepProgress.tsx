"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Backend steps shown in the wizard (Step 3 / "Setup" is hidden). */
const STEPS = [
  { label: "Restaurant", num: "01", value: 1 },
  { label: "Menu", num: "02", value: 2 },
  { label: "Team", num: "04", value: 4 },
  { label: "Payments", num: "05", value: 5 },
];

export function StepProgress({ current }: { current: number }) {
  const currentIndex = STEPS.findIndex((s) => s.value === current);

  return (
    <ol className="flex w-full items-center justify-center gap-0 sm:gap-1">
      {STEPS.map((step, i) => {
        const done = currentIndex > -1 && i < currentIndex;
        const active = step.value === current;
        return (
          <li key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-hidden
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-200",
                  done && "border-brand bg-brand text-white",
                  active && "border-brand bg-surface text-brand ring-2 ring-brand/25",
                  !done && !active && "border-line bg-surface text-ink-subtle"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : step.num}
              </span>
              <span
                className={cn(
                  "text-[11px] leading-[15px] font-medium whitespace-nowrap",
                  active && "text-ink",
                  done && "text-brand",
                  !done && !active && "text-ink-subtle"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "mx-1 mb-4 h-px w-4 sm:mx-2 sm:w-8",
                  i + 1 < currentIndex ? "bg-brand" : "bg-line"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
