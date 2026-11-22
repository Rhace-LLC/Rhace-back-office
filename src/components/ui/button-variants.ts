import { cva } from "class-variance-authority";

// Kept separate from button.tsx so that file only exports components
// (required for React Fast Refresh).
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-button hover:bg-brand-hover active:bg-brand-active",
        destructive:
          "bg-destructive text-white hover:bg-danger-strong focus-visible:ring-destructive/20",
        outline:
          "border border-line bg-surface shadow-sm hover:bg-inset hover:text-foreground",
        secondary:
          "bg-inset text-ink-secondary hover:bg-inset-accent hover:text-foreground",
        ghost:
          "hover:bg-inset hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-10 rounded-md",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-12 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
