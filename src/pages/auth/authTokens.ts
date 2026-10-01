/**
 * Shared token-driven class presets for the Auth pages.
 * Maps to design/for-restaurant-management/visual-direction.md —
 * solid tactile surfaces, no blur/glow. No new visuals.
 */
export const authPage = "flex min-h-screen w-full justify-center bg-page";

export const authPanel =
  "w-full rounded-[28px] border border-line bg-surface shadow-md overflow-hidden";

/** Input — tactile: 16px radius, height 48px, solid surface, line border. */
export const authField =
  "flex h-12 w-full rounded-2xl border border-line bg-surface px-3.5 text-[14px] leading-5 text-ink transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-focus-ring";

export const authLabel =
  "mb-1.5 block text-sm font-medium leading-5 tracking-[-0.01em] text-ink-secondary";

/** H2 — 36px/39px/600/-1px from typography scale. */
export const authTitle =
  "text-[36px] leading-[39px] font-semibold tracking-[-1px] text-ink";

/** H3 — 24px/29px/600/-0.4px from typography scale. */
export const authTitleSm =
  "text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink";

export const authSubtitle = "mt-2 text-base tracking-[-0.3px] leading-5 text-ink-muted";

export const authLink = "font-medium text-brand transition-colors hover:text-brand-hover";

/** Primary button — solid royal blue focal block with button shadow. */
export const authButton =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium leading-5 text-white shadow-button transition-colors duration-150 hover:bg-brand-hover active:bg-brand-active focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60";
