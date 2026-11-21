import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  loading?: boolean;
}

/** Compact KPI tile used by the role dashboards. */
export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  loading,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-ink-secondary">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-ink-muted" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="mb-2 h-7 w-12" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold text-ink">{value}</div>
            {hint && <p className="text-xs text-ink-muted">{hint}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
