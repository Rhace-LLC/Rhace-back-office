import { cva } from "class-variance-authority";

// Kept separate from badge.tsx so that file only exports components
// (required for React Fast Refresh).
export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-brand-hover",
        secondary:
          "border-transparent bg-inset text-ink-secondary hover:bg-inset-accent",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-danger-strong",
        outline: "border-line bg-surface text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
