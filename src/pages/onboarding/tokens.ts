/**
 * Onboarding design-token presets.
 * Maps to design/for-restaurant-management/visual-direction.md —
 * solid tactile surfaces, no blur/glow. No new visuals.
 */

/** Solid canvas background. */
export const obPage = "flex min-h-screen w-full justify-center bg-page";

/** Shared rounded card — white, 28px radius, line border, card shadow. */
export const obPanel =
  "w-full rounded-[28px] border border-line bg-surface shadow-md";

/** Input — 16px radius, height 48px, solid surface, line border. */
export const obField =
  "flex h-12 w-full rounded-2xl border border-line bg-surface px-3.5 text-sm leading-5 text-ink transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-focus-ring";

/** Multi-line field variant. */
export const obTextarea = `${obField} min-h-[88px] resize-none py-3`;

export const obLabel =
  "mb-1.5 block text-sm font-medium leading-5 tracking-[-0.01em] text-ink-secondary";

export const obError = "mt-1 block text-xs leading-[17px] text-destructive";

/** H3 — 24px/29px/600/-0.4px from typography scale. */
export const obTitle =
  "text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink";

export const obSubtitle = "mt-2 text-sm leading-5 text-ink-muted";

export const obEyebrow =
  "text-[11px] leading-[15px] font-medium uppercase tracking-[0.08em] text-brand";

/** Primary CTA — solid royal blue with button shadow. */
export const obCta =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium leading-5 text-white shadow-button transition-colors duration-150 hover:bg-brand-hover active:bg-brand-active focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

/** Quiet secondary action on soft inset tint. */
export const obCtaGhost =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-inset px-5 text-sm font-medium leading-5 text-ink-secondary transition-colors duration-150 hover:bg-inset-accent hover:text-ink focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none";

export const obLink =
  "font-medium text-brand transition-colors hover:text-brand-hover";

/** Selectable option card — solid surface, 20px radius. */
export const obChoice =
  "group flex w-full items-start gap-3 rounded-[20px] border bg-surface p-4 text-left transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none";

export const obChoiceIdle = "border-line bg-surface hover:border-line-strong";

export const obChoiceActive =
  "border-brand bg-inset-accent ring-1 ring-brand";

export const obChip =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm leading-5 transition-colors duration-150";

export const obChipIdle = "border-line bg-inset text-ink-muted hover:border-line-strong hover:text-ink";

export const obChipActive = "border-transparent bg-ink text-white";
