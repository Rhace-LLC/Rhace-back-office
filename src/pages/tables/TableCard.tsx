import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import clsx from "clsx";
import GenericSheet from "@/components/generic_sheet_overlay";
import { ViewTable } from "./ViewTable";
import { Table } from "@/store/table.slice";

interface TableCardProps {
  table: Table;
  onView?: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onView }) => {
  const [viewOpen, setViewOpen] = useState(false);

  const { table_number, max_party_size, is_available, restaurant_name } = table;

  const statusLabel = is_available ? "Available" : "Unavailable";
  const statusColor = is_available
    ? "text-green-700 bg-green-100/50"
    : "text-red-700 bg-red-100/50";

  return (
    <div>
      <Card className="flex flex-col justify-between rounded-xl border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md font-semibold">
              Table {table_number}
            </CardTitle>
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-medium",
                statusColor
              )}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-xs text-gray-500">{restaurant_name}</p>
        </CardHeader>

        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Seats Box */}
            <div className="flex flex-col items-start rounded-lg bg-blue-50 p-3">
              <span className="text-xs font-semibold tracking-wide text-blue-800 uppercase">
                Seats
              </span>
              <span className="text-lg font-bold text-blue-900">
                {max_party_size}
              </span>
            </div>

            {/* Status Box */}
            <div className="flex flex-col items-start rounded-lg bg-amber-50 p-3">
              <span className="text-xs font-semibold tracking-wide text-amber-800 uppercase">
                Status
              </span>
              <span className="text-lg font-bold text-amber-900">Open</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 p-2">
          <Button
            variant="secondary"
            className="w-full cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={() => setViewOpen(true)}
          >
            Manage Table
          </Button>
          <Button
            variant="secondary"
            className="w-full cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200"
            onClick={onView}
          >
            Take Order
          </Button>
        </CardFooter>
      </Card>

      {/* Sheet for full table details */}
      <GenericSheet
        title={`Dining Table ${table_number}`}
        subtitle={`Status: ${statusLabel} • Seats up to ${max_party_size}`}
        open={viewOpen}
        onOpenChange={setViewOpen}
      >
        <ViewTable table={table} />
      </GenericSheet>
    </div>
  );
};
