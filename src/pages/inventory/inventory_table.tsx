import React from "react";
import { InventoryItem } from "@/store/inventory.slice";
import { Button } from "@/components/ui/button";

interface Props {
  data: InventoryItem[];
  onView: (item: InventoryItem) => void;
}

const RenderInventoryTableData: React.FC<Props> = ({ data, onView }) => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-3 py-2 text-left">Name</th>
          <th className="border px-3 py-2 text-left">Category</th>
          <th className="border px-3 py-2 text-left">Quantity</th>
          <th className="border px-3 py-2 text-left">Status</th>
          <th className="border px-3 py-2 text-left">Last Updated</th>
          <th className="border px-3 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="border px-3 py-2">{item.name}</td>
            <td className="border px-3 py-2">{item.category}</td>
            <td className="border px-3 py-2">{item.quantity}</td>
            <td className="border px-3 py-2">{item.status}</td>
            <td className="border px-3 py-2">
              {true ? new Date().toLocaleString() : "—"}
            </td>
            <td className="border px-3 py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(item)}
              >
                View Details
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RenderInventoryTableData;
