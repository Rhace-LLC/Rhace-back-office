import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItem } from "@/store/inventory.slice";

interface ViewInventoryItemProps {
  item: InventoryItem;
}

export const ViewInventoryItem: React.FC<ViewInventoryItemProps> = ({
  item,
}) => {
  const isEditing = false;
  const [editableItem, setEditableItem] = useState(item);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableItem({ ...editableItem, [name]: value });
  };

  return (
    <div className="space-y-3 bg-white py-10">
      <h2 className="text-lg font-semibold">Inventory Item Details</h2>

      <div className="space-y-2">
        <Label>Name</Label>
        {isEditing ? (
          <Input
            name="name"
            value={editableItem.name}
            onChange={handleChange}
          />
        ) : (
          <p className="text-gray-700">{editableItem.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        {isEditing ? (
          <Input
            name="category"
            value={editableItem.category}
            onChange={handleChange}
          />
        ) : (
          <p className="text-gray-700">{editableItem.category}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Quantity</Label>
        {isEditing ? (
          <Input
            type="number"
            name="quantity"
            value={editableItem.quantity}
            onChange={handleChange}
          />
        ) : (
          <p className="text-gray-700">{editableItem.quantity}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Unit</Label>
        {isEditing ? (
          <Input
            name="unit"
            value={editableItem.unit}
            onChange={handleChange}
          />
        ) : (
          <p className="text-gray-700">{editableItem.unit}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <p className="text-gray-700">{editableItem.status}</p>
      </div>
    </div>
  );
};
