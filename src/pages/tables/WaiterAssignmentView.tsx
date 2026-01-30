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
interface WaiterAssignmentViewProps {
  assignment: Assignment | null | undefined;
  onRefresh: () => void;
}

export const WaiterAssignmentView = ({
  assignment,
  onRefresh,
}: WaiterAssignmentViewProps) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [assignment]);
  // --- EMPTY STATE: NO ASSIGNMENT ---
  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-gray-50/50 p-12 text-center ring-1 ring-gray-100">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
          <LayoutGrid size={32} strokeWidth={1.2} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-gray-900">
          You Haven't Been Assigned
        </h3>
        <p className="mt-2 max-w-[540px] text-[14px] leading-relaxed font-medium text-gray-400">
          You haven't been assigned to any table for today.
        </p>
        <button className="mt-8 text-[13px] font-bold text-blue-500">
          Contact Floor Manager For Your Assignment.
        </button>
        <button
          onClick={() => {
            onRefresh();
            setLoading(true);
          }}
          disabled={loading} // Added state handling for a better UX
          className={cn(
            "group flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold tracking-tight transition-all active:scale-95",
            "border border-gray-100 bg-white text-gray-500 shadow-sm shadow-gray-200/50",
            "hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900",
            loading && "cursor-not-allowed opacity-50"
          )}
        >
          <RefreshCcw
            size={15}
            strokeWidth={2.5}
            className={cn(
              "transition-transform duration-500",
              loading ? "animate-spin" : "group-hover:rotate-180"
            )}
          />
          <span>Refresh</span>
        </button>
      </div>
    );
  }

  // --- ACTIVE STATE: ASSIGNMENT DETECTED ---
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] ring-1 ring-gray-100 transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      {/* HEADER: TYPOGRAPHIC FOCUS */}
      <div className="flex items-start justify-between pb-8">
        <div>
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-blue-500 uppercase">
            Current Shift
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            Assigned Tables
          </h2>
          <div className="mt-2 flex items-center gap-2 text-[13px] font-medium text-gray-400">
            <UserCheck size={14} />
            <span>Assigned by {assignment.assigned_by}</span>
          </div>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-[18px] font-black text-gray-900 ring-1 ring-gray-100">
          {assignment.table_count}
        </div>
      </div>

      {/* TABLE PILLS: MINIMALIST GRID */}
      <div className="flex flex-wrap gap-2">
        {assignment.tables.map((table) => (
          <div
            key={table.id}
            className="flex items-center gap-3 rounded-2xl bg-gray-50 px-5 py-3 ring-1 ring-gray-100 transition-all hover:bg-white hover:shadow-md hover:ring-transparent"
          >
            Table
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-[10px] font-bold text-gray-400 ring-1 ring-gray-100">
              <Hash size={10} />
            </div>
            <span className="text-[14px] font-bold tracking-tight text-gray-800">
              {table.table_number || table.id}
            </span>
          </div>
        ))}
      </div>

      {/* FOOTER: NOTES SECTION */}
      {assignment.notes && (
        <div className="mt-10 rounded-[1.5rem] bg-gray-50/50 p-5 ring-1 ring-gray-100">
          <div className="mb-2 flex items-center gap-2 text-gray-400">
            <StickyNote size={14} strokeWidth={2.5} />
            <span className="text-[11px] font-bold tracking-wider uppercase">
              Service Notes
            </span>
          </div>
          <p className="text-[13px] leading-relaxed font-medium text-gray-600">
            {assignment.notes}
          </p>
        </div>
      )}
    </div>
  );
};
