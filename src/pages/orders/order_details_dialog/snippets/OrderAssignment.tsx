import React from "react";
import { User, Table as TableIcon } from "lucide-react";
import { Staff } from "@/api-services/staffService";
import { Table } from "@/api-services/tableService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface OrderAssignmentsProps {
  isDineIn: boolean;
  isEditable: boolean;
  canAssignWaiter: boolean;
  canAssignTable: boolean;
  assignedWaiter: Staff | undefined;
  assignedTable: Table | undefined;
  waiters: Staff[];
  availableTables: Table[];
  selectedWaiter: string;
  setSelectedWaiter: (id: string) => void;
  selectedTable: string;
  setSelectedTable: (id: string) => void;
  onAssignWaiter: () => void;
  onAssignTable: () => void;
}

export const OrderAssignments: React.FC<OrderAssignmentsProps> = ({
  isDineIn,
  isEditable,
  canAssignWaiter,
  canAssignTable,
  assignedWaiter,
  assignedTable,
  waiters,
  availableTables,
  selectedWaiter,
  setSelectedWaiter,
  selectedTable,
  setSelectedTable,
  onAssignWaiter,
  onAssignTable,
}) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
        Assignments
      </h4>
      <div className="grid grid-cols-1 gap-3">
        {/* Waiter Management */}
        <div className="rounded-xl border border-[#D9E0EA] bg-[#FFFFFF] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#146BE8]" />
              <span className="font-medium text-[#0B0D10]">Assigned Waiter</span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                assignedWaiter ? "bg-[#DCEEFF] text-[#146BE8]" : "bg-[#E8EDF3] text-[#6B7280]"
              }`}
            >
              {assignedWaiter ? assignedWaiter.full_name : "Unassigned"}
            </span>
          </div>

          {canAssignWaiter && isEditable && (
            <div className="flex gap-2 pt-1">
              <Select value={selectedWaiter} onValueChange={setSelectedWaiter}>
                <SelectTrigger className="h-8 text-xs border-[#D9E0EA]">
                  <SelectValue placeholder="Select waiter..." />
                </SelectTrigger>
                <SelectContent>
                  {waiters.map((w) => (
                    <SelectItem key={w.id} value={w.id} className="text-xs">
                      {w.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={onAssignWaiter}
                disabled={!selectedWaiter}
                className="h-8 bg-[#146BE8] hover:bg-[#0F5FD4] text-white text-xs px-3 rounded-[7px]"
              >
                {assignedWaiter ? "Change" : "Assign"}
              </Button>
            </div>
          )}
        </div>

        {/* Table Management (Dine-in only) */}
        {isDineIn && (
          <div className="rounded-xl border border-[#D9E0EA] bg-[#FFFFFF] p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <TableIcon className="h-4 w-4 text-[#146BE8]" />
                <span className="font-medium text-[#0B0D10]">Assigned Table</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  assignedTable ? "bg-[#DCEEFF] text-[#146BE8]" : "bg-[#E8EDF3] text-[#6B7280]"
                }`}
              >
                {assignedTable ? `Table ${assignedTable.table_number}` : "Unassigned"}
              </span>
            </div>

            {canAssignTable && isEditable && (
              <div className="flex gap-2 pt-1">
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="h-8 text-xs border-[#D9E0EA]">
                    <SelectValue placeholder="Select table..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTables.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">
                        Table {t.table_number} ({t.max_party_size} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={onAssignTable}
                  disabled={!selectedTable}
                  className="h-8 bg-[#146BE8] hover:bg-[#0F5FD4] text-white text-xs px-3 rounded-[7px]"
                >
                  {assignedTable ? "Change" : "Assign"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};