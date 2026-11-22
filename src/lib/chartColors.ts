/**
 * Chart colours for Recharts, which needs literal colour values rather than
 * Tailwind classes. These mirror the design tokens in src/index.css
 * (--color-chart-1…5, --color-ink-subtle, --color-warning-strong) — keep the
 * two in sync rather than adding new hex values to components.
 */
export const CHART = {
  primary: "#2a66ff", // --color-chart-1 / --color-brand
  primaryDeep: "#1d4ed8", // --color-chart-2 / --color-brand-hover
  primarySoft: "#93b4fd", // --color-chart-3
  ink: "#0f172a", // --color-chart-4 / --color-ink
  muted: "#64748b", // --color-ink-muted
  empty: "#94a3b8", // --color-chart-5 / --color-ink-subtle (no-data state)
  highlight: "#d97706", // --color-warning-strong (secondary series)
} as const;

/** Ordered categorical series for pies/bars. */
export const CHART_SERIES = [
  CHART.primary,
  CHART.primarySoft,
  CHART.ink,
  CHART.muted,
  CHART.primaryDeep,
] as const;
