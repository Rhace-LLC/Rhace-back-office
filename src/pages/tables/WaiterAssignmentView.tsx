import { Assignment } from "@/api-services/menu.service";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  UserCheck,
  StickyNote,
  Hash,
  RefreshCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { StaffShiftWidget } from "./_component/ShiftClockinWidget";

interface WaiterAssignmentViewProps {
  assignment: Assignment | null | undefined;
  onRefresh: () => void;
  isLoading?: boolean; // Accept an external loading prop if parent manages fetching
}

export const WaiterAssignmentView = ({
  assignment,
  onRefresh,
  isLoading: externalLoading = false,
}: WaiterAssignmentViewProps) => {
  const [loading, setLoading] = useState(false);

  // Sync internal state when assignment prop settles
  useEffect(() => {
    setLoading(false);
  }, [assignment]);

  const isRefreshing = loading || externalLoading;
  console.log({externalLoading,loading})

  return (
    <div className="space-y-6">
      {/* Shift Widget is placed outside conditional checks so staff can always manage shift status */}
      <StaffShiftWidget />

      {/* --- LOADING STATE --- */}
      {isRefreshing ? (
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-inset/50 p-12 text-center ring-1 ring-gray-100">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface shadow-sm ring-1 ring-gray-100">
            <RefreshCcw size={32} strokeWidth={1.2} className="text-ink-subtle animate-spin" />
          </div>
          <p className="text-[14px] font-medium text-ink-subtle">Loading assignment details...</p>
        </div>
      ) : !assignment ? (
        /* --- EMPTY STATE: NO ASSIGNMENT --- */
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-inset/50 p-12 text-center ring-1 ring-gray-100">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface shadow-sm ring-1 ring-gray-100">
            <LayoutGrid size={32} strokeWidth={1.2} className="text-ink-subtle" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-ink">
            You Haven't Been Assigned
          </h3>
          <p className="mt-2 max-w-[540px] text-[14px] leading-relaxed font-medium text-ink-subtle">
            You haven't been assigned to any table for today.
          </p>
          <button className="mt-4 text-[13px] font-bold text-blue-500">
            Contact Floor Manager For Your Assignment.
          </button>
          <button
            onClick={() => {
              setLoading(true);
              onRefresh();
            }}
            disabled={isRefreshing}
            className={cn(
              "group mt-6 flex items-center gap-2 rounded-3xl px-4 py-2 text-[13px] font-bold tracking-tight transition-all active:scale-95",
              "border border-line-subtle bg-surface text-ink-muted shadow-sm shadow-gray-200/50",
              "hover:border-line hover:bg-inset hover:text-ink",
              isRefreshing && "cursor-not-allowed opacity-50"
            )}
          >
            <RefreshCcw
              size={15}
              strokeWidth={2.5}
              className={cn(
                "transition-transform duration-500",
                isRefreshing ? "animate-spin" : "group-hover:rotate-180"
              )}
            />
            <span>Refresh</span>
          </button>
        </div>
      ) : (
        /* --- ACTIVE STATE: ASSIGNMENT DETECTED --- */
        <div className="group relative overflow-hidden rounded-[2.5rem] bg-surface p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] ring-1 ring-gray-100 transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          {/* HEADER */}
          <div className="flex items-start justify-between pb-8">
            <div>
              <span className="text-[11px] font-extrabold tracking-[0.2em] text-blue-500 uppercase">
                Current Shift
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
                Assigned Tables
              </h2>
              <div className="mt-2 flex items-center gap-2 text-[13px] font-medium text-ink-subtle">
                <UserCheck size={14} />
                <span>Assigned by {assignment.assigned_by}</span>
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-inset text-[18px] font-black text-ink ring-1 ring-gray-100">
              {assignment.table_count}
            </div>
          </div>

          {/* TABLE PILLS */}
          <div className="flex flex-wrap gap-2">
            {assignment.tables.map((table) => (
              <div
                key={table.id}
                className="flex items-center gap-3 rounded-2xl bg-inset px-5 py-3 ring-1 ring-gray-100 transition-all hover:bg-surface hover:shadow-md hover:ring-transparent"
              >
                Table
                <div className="flex h-6 w-6 items-center justify-center rounded-2xl bg-surface text-[10px] font-bold text-ink-subtle ring-1 ring-gray-100">
                  <Hash size={10} />
                </div>
                <span className="text-[14px] font-bold tracking-tight text-ink">
                  {table.table_number || table.id}
                </span>
              </div>
            ))}
          </div>

          {/* FOOTER: NOTES */}
          {assignment.notes && (
            <div className="mt-10 rounded-[1.5rem] bg-inset/50 p-5 ring-1 ring-gray-100">
              <div className="mb-2 flex items-center gap-2 text-ink-subtle">
                <StickyNote size={14} strokeWidth={2.5} />
                <span className="text-[11px] font-bold tracking-wider uppercase">
                  Service Notes
                </span>
              </div>
              <p className="text-[13px] leading-relaxed font-medium text-ink-secondary">
                {assignment.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};