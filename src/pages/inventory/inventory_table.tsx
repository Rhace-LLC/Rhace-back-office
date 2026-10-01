import React from "react";
import { InventoryItem } from "@/store/inventory.slice";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  data: InventoryItem[];
  onView: (item: InventoryItem) => void;
}

const RenderInventoryTableData: React.FC<Props> = ({ data, onView }) => {
  return (
    <Table className="w-full border-collapse text-sm">
      <TableHeader>
        <TableRow className="bg-inset">
          <TableHead className="font-medium text-ink-secondary">ID</TableHead>
          <TableHead className="font-medium text-ink-secondary">Name</TableHead>
          <TableHead className="font-medium text-ink-secondary">Quantity / Min Qty</TableHead>
          <TableHead className="font-medium text-ink-secondary">Unit</TableHead>
          <TableHead className="font-medium text-ink-secondary">Available</TableHead>
          <TableHead className="font-medium text-ink-secondary">Allergen</TableHead>
          <TableHead className="font-medium text-ink-secondary">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((item) => (
          <TableRow
            key={item.id}
            className="cursor-pointer transition hover:bg-inset"
          >
            {/* ID */}
            <TableCell className="text-ink">{item.id}</TableCell>

            {/* Name */}
            <TableCell className="font-medium text-ink">
              {item.name}
            </TableCell>

            {/* Quantity */}
            <TableCell>
              <div>Quantity: {item.quantity}</div>
              <div className="text-xs text-ink-muted">
                Minimum Quantity: {item.threshold}
              </div>
            </TableCell>

            {/* Unit */}
            <TableCell>{item.unit}</TableCell>

            {/* Available */}
            <TableCell>
              <span
                className={`font-medium ${
                  item.available ? "text-green-600" : "text-red-500"
                }`}
              >
                {item.available ? "Yes" : "No"}
              </span>
            </TableCell>

            {/* Is Allergen */}
            <TableCell>
              <span
                className={`font-medium ${
                  item.is_allergen ? "text-red-500" : "text-ink-secondary"
                }`}
              >
                {item.is_allergen ? "Yes" : "No"}
              </span>
            </TableCell>

            {/* Actions */}
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onView(item)}>
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RenderInventoryTableData;
