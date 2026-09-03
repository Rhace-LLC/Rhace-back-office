/**
 * Shared token-driven class presets for the Auth pages.
 * Every value maps to design/master-design-token.json — no new visuals.
 */
export const authPage = "flex min-h-screen w-full justify-center bg-page";

export const authPanel =
  "w-full rounded-[24px]";

/** Input — component_primitives.input: radius 8px, height 40px, border line. */
export const authField =
  "flex h-12 w-full rounded-[8px] border border-line bg-cardfill px-3.5 text-[14px] leading-5 text-ink transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-focus-ring";

export const authLabel =
  "mb-1.5 block text-sm font-medium leading-5 tracking-[-0.01em] text-ink-secondary";

/** H2 — 36px/39px/600/-1px from typography_matrix.scale. */
export const authTitle =
  "text-[36px] leading-[39px] font-semibold tracking-[-1px] text-ink";

/** H3 — 24px/29px/600/-0.4px from typography_matrix.scale. */
export const authTitleSm =
  "text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink";

export const authSubtitle = "mt-2 text-base tracking-[-0.3px] leading-5 text-ink-muted";

export const authLink = "font-medium text-brand transition-colors hover:text-brand-hover";

/** Primary button — neutral ink fill keeps the page calm; brand reserved for accents. */
export const authButton =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 hover:bg-ink-secondary active:bg-ink focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60";
