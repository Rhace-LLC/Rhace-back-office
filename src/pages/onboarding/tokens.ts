/**
 * Onboarding design-token presets.
 * Every value references design/master-design-token.json — no new visuals.
 */

/** Soft page background — color_system.backgrounds.page (tinted). */
export const obPage = "flex min-h-screen w-full justify-center bg-page";

/** Shared rounded card — component_primitives.card. */
export const obPanel =
  "w-full rounded-[24px] border border-line bg-surface shadow-md";

/** Input — component_primitives.input: radius 8px, height 40px, line border. */
export const obField =
  "flex h-12 w-full rounded-[8px] border border-line bg-cardfill px-3.5 text-sm leading-5 text-ink transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-focus-ring";

/** Multi-line field variant. */
export const obTextarea = `${obField} min-h-[88px] resize-none py-3`;

export const obLabel =
  "mb-1.5 block text-sm font-medium leading-5 tracking-[-0.01em] text-ink-secondary";

export const obError = "mt-1 block text-xs leading-[17px] text-destructive";

/** H3 — 24px/29px/600/-0.4px from typography_matrix.scale. */
export const obTitle =
  "text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink";

export const obSubtitle = "mt-2 text-sm leading-5 text-ink-muted";

export const obEyebrow =
  "text-[11px] leading-[15px] font-medium uppercase tracking-[0.08em] text-brand";

/** Primary CTA — neutral ink fill keeps the page calm. */
export const obCta =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-5 text-sm font-medium leading-5 text-white transition-colors duration-150 hover:bg-ink-secondary active:bg-ink focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

/** Quiet text-style secondary action. */
export const obCtaGhost =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] px-5 text-sm font-medium leading-5 text-ink-muted transition-colors duration-150 hover:bg-line-subtle hover:text-ink focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none";

export const obLink =
  "font-medium text-brand transition-colors hover:text-brand-hover";

/** Selectable option card — border + check treatment on selection. */
export const obChoice =
  "group flex w-full items-start gap-3 rounded-[16px] border bg-surface p-4 text-left transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none";

export const obChoiceIdle = "border-line bg-surface hover:border-line-strong";

export const obChoiceActive =
  "border-brand bg-brand/[0.04] ring-1 ring-brand";

export const obChip =
  "inline-flex items-center gap-1.5 rounded-[8px] border px-3 py-2 text-sm leading-5 transition-colors duration-150";

export const obChipIdle = "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink";

export const obChipActive = "border-brand bg-cardfill text-brand ring-1 ring-brand";
