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
import { Table } from "@/api-services/tableService";

interface TableCardProps {
  table: Table;
}

export const TableCard: React.FC<TableCardProps> = ({ table }) => {
  const [viewOpen, setViewOpen] = useState(false);

  const {
    table_number,
    max_party_size,
    is_available,
    restaurant_name,
    status,
  } = table;

  // Availability badge
  const availabilityLabel = is_available ? "Available" : "Unavailable";

  const availabilityColor = is_available
    ? "text-green-700 bg-green-100/50"
    : "text-red-700 bg-red-100/50";

  // Status box (free, occupied, reserved, etc.)
  const statusLabel = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "-";

  const statusBoxColor =
    status === "free"
      ? "bg-green-50 text-green-800"
      : status === "occupied"
        ? "bg-red-50 text-red-800"
        : "bg-amber-50 text-amber-800";

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
                availabilityColor
              )}
            >
              {availabilityLabel}
            </span>
          </div>

          <p className="text-xs text-gray-500">{restaurant_name}</p>
        </CardHeader>

        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Seats box */}
            <div className="flex flex-col items-start rounded-lg bg-blue-50 p-3">
              <span className="text-xs font-semibold tracking-wide text-blue-800 uppercase">
                Seats
              </span>
              <span className="text-lg font-bold text-blue-900">
                {max_party_size}
              </span>
            </div>

            {/* Status box */}
            <div
              className={clsx(
                "flex flex-col items-start rounded-lg p-3",
                statusBoxColor
              )}
            >
              <span className="text-xs font-semibold tracking-wide uppercase">
                Status
              </span>
              <span className="text-lg font-bold">{statusLabel}</span>
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
        </CardFooter>
      </Card>

      {/* Table Detail Sheet */}
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
}