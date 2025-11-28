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
        <TableRow className="bg-gray-50">
          <TableHead className="font-medium text-gray-600">ID</TableHead>
          <TableHead className="font-medium text-gray-600">Name</TableHead>
          <TableHead className="font-medium text-gray-600">Quantity</TableHead>
          <TableHead className="font-medium text-gray-600">Available</TableHead>
          <TableHead className="font-medium text-gray-600">Allergen</TableHead>
          <TableHead className="font-medium text-gray-600">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((item) => (
          <TableRow
            key={item.id}
            className="cursor-pointer transition hover:bg-gray-50"
          >
            {/* ID */}
            <TableCell className="text-gray-900">{item.id}</TableCell>

            {/* Name */}
            <TableCell className="font-medium text-gray-900">
              {item.name}
            </TableCell>

            {/* Quantity */}
            <TableCell>{item.quantity}</TableCell>

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
                  item.is_allergen ? "text-red-500" : "text-gray-600"
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
