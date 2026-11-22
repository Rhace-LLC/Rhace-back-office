import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

/**
 * Shared loading skeletons — every back-office page loads the same way:
 * a skeleton shaped like the content it replaces (no spinners / "Loading…"
 * text). Each wrapper sets aria-busy and a visually hidden label for screen
 * readers.
 */

export type SkeletonVariant = "table" | "grid" | "detail" | "list";

/** Screen-reader-only announcement shared by all skeletons. */
const SrLabel = ({ label }: { label?: string }) => (
  <span className="sr-only">{label || "Loading…"}</span>
);

/** Mirrors <PageHeader>: title, description, action buttons. */
export function PageHeaderSkeleton({ actions = 2 }: { actions?: number }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {actions > 0 && (
        <div className="flex gap-2">
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>
      )}
    </div>
  );
}

/** Row of KPI tiles (matches StatCard / the stats rows on Orders etc.). */
export function StatCardsSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2",
        count >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-7 w-16" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Data table: header row + body rows. */
export function TableSkeleton({
  rows = 6,
  columns = 5,
  bare = false,
  label,
}: {
  rows?: number;
  columns?: number;
  /** Render without the card frame (when the parent already is a card). */
  bare?: boolean;
  label?: string;
}) {
  const body = (
    <div aria-busy="true" className="divide-y divide-line-subtle">
      <SrLabel label={label} />
      <div className="flex gap-4 bg-inset px-4 py-3">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn("h-4 flex-1", c === 0 && "max-w-[120px]")}
            />
          ))}
        </div>
      ))}
    </div>
  );

  if (bare) return body;
  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface shadow-sm">
      {body}
    </div>
  );
}

/** Card grid (tables, dishes, entertainment items). */
export function CardGridSkeleton({
  count = 6,
  label,
}: {
  count?: number;
  label?: string;
}) {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <SrLabel label={label} />
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Stacked list rows (notifications, assignments). */
export function ListSkeleton({
  rows = 5,
  label,
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div aria-busy="true" className="space-y-3">
      <SrLabel label={label} />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-md border border-line bg-surface p-4"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="hidden h-8 w-20 sm:block" />
        </div>
      ))}
    </div>
  );
}

/** Profile / settings style: heading block + label/value fields. */
export function DetailSkeleton({
  fields = 6,
  label,
}: {
  fields?: number;
  label?: string;
}) {
  return (
    <Card aria-busy="true">
      <SrLabel label={label} />
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Content-area skeleton by variant (used by ContentHOC). */
export function ContentSkeleton({
  variant = "table",
  label,
}: {
  variant?: SkeletonVariant;
  label?: string;
}) {
  switch (variant) {
    case "grid":
      return <CardGridSkeleton label={label} />;
    case "detail":
      return <DetailSkeleton label={label} />;
    case "list":
      return <ListSkeleton label={label} />;
    default:
      return <TableSkeleton label={label} />;
  }
}

/**
 * Whole-page skeleton for pages that render nothing until first load
 * (header + optional stat tiles + content).
 */
export function PageSkeleton({
  variant = "table",
  stats = 0,
  headerActions = 2,
  label,
}: {
  variant?: SkeletonVariant;
  stats?: number;
  headerActions?: number;
  label?: string;
}) {
  return (
    <PageContainer>
      <PageHeaderSkeleton actions={headerActions} />
      {stats > 0 && <StatCardsSkeleton count={stats} />}
      <ContentSkeleton variant={variant} label={label} />
    </PageContainer>
  );
}
