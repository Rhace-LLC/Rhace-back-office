import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Standard page chrome for every back-office screen.
 *
 *   <PageContainer>
 *     <PageHeader title="Orders" description="…" actions={<Button…/>} />
 *     …page content…
 *   </PageContainer>
 *
 * Keep page titles, spacing and padding consistent by using these instead of
 * hand-rolled <h1>/wrapper classes.
 */

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        // container: max 1320px; padding 20 / 32 / 48 (mobile / tablet / desktop)
        "mx-auto w-full max-w-[1320px] space-y-6 px-5 py-6 md:px-8 md:py-8 lg:px-12",
        className
      )}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned actions (buttons, filters). Wraps below on small screens. */
  actions?: ReactNode;
  /** Small element rendered before the title, e.g. a back button. */
  leading?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  leading,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {leading}
        <div className="min-w-0">
          {/* type scale h3: 24px / 29px / 600 / -0.4px */}
          <h1 className="text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm leading-[21px] text-ink-muted">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
