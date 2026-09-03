"use client";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  obChoice,
  obChoiceActive,
  obChoiceIdle,
  obCtaGhost,
  obError,
  obEyebrow,
  obLabel,
  obSubtitle,
  obTitle,
} from "./tokens";

export function StepHeader({
  step,
  title,
  subtitle,
}: {
  step: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <p className={obEyebrow}>Step {step}</p>
      <h1 className={`${obTitle} mt-2`}>{title}</h1>
      <p className={obSubtitle}>{subtitle}</p>
    </div>
  );
}

export function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={obLabel}>
        {label}
        {required && <span className="ml-0.5 text-brand">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs leading-[17px] text-ink-subtle">{hint}</p>
      )}
      {error && <p className={obError}>{error}</p>}
    </div>
  );
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-surface text-ink transition-colors hover:border-line-strong hover:bg-cardfill focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none disabled:opacity-40"
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[48px] text-center text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(value + 1)}
        className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-surface text-ink transition-colors hover:border-line-strong hover:bg-cardfill focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ChoiceCard({
  title,
  description,
  icon,
  selected,
  onClick,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        obChoice,
        selected ? obChoiceActive : obChoiceIdle
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-colors",
          selected ? "bg-brand text-white" : "bg-cardfill text-ink-muted"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm leading-5 font-medium text-ink">
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block text-sm leading-5 text-ink-muted">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

export function StepActions({
  onContinue,
  continueLabel = "Continue",
  continueDisabled,
  onSecondary,
  secondaryLabel,
}: {
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  onSecondary?: () => void;
  secondaryLabel?: string;
}) {
  return (
    <div className="mt-8 space-y-2 border-t border-line-subtle pt-6">
      <button
        type="button"
        disabled={continueDisabled}
        onClick={onContinue}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-5 text-sm font-medium leading-5 text-white transition-colors duration-150 hover:bg-ink-secondary active:bg-ink focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      >
        {continueLabel}
      </button>
      {secondaryLabel && onSecondary && (
        <button type="button" onClick={onSecondary} className={obCtaGhost}>
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
