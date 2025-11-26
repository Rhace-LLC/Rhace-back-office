import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InventoryItem, updateInventoryDataById } from "@/store/inventory.slice";
import { toast } from "sonner";
import { updateInventoryItem } from "@/api-services/inventory.service";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch } from "react-redux";

interface ViewInventoryItemProps {
  item: InventoryItem;
  onUpdate?: (updated: InventoryItem) => Promise<void>;
}

export const ViewInventoryItem: React.FC<ViewInventoryItemProps> = ({
  item,
  onUpdate,
}) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editableItem, setEditableItem] = useState(item);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setEditableItem((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: editableItem.name,
        unit: editableItem.unit,
        threshold: editableItem.threshold,
        is_allergen: editableItem.is_allergen,
        restaurant: item.restaurant, // Make sure editableItem has restaurant UUID
      };

      const response = await updateInventoryItem(
        String(item.id),
        payload,
        auth.token
      );

      dispatch(updateInventoryDataById(response))

      toast.success("Item updated successfully");

      setIsEditing(false);

      // Trigger optional callback to update parent state
      if (onUpdate) await onUpdate(response);
    } catch (e) {
      toast.error("Failed to update item");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Inventory Item</h2>

        {!isEditing ? (
          <Button className="cursor-pointer" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              className="cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={() => {
                setEditableItem(item);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer bg-blue-600 hover:bg-blue-700"
              onClick={handleUpdate}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Name</Label>
        {isEditing ? (
          <Input
            name="name"
            value={editableItem.name}
            onChange={handleChange}
            className="h-10"
          />
        ) : (
          <p className="text-gray-800">{editableItem.name}</p>
        )}
      </div>

      {/* Quantity + Unit */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <Label className="text-sm font-medium text-gray-700">Quantity</Label>
          {isEditing ? (
            <Input
              type="number"
              name="quantity"
              value={editableItem.quantity}
              onChange={handleChange}
              className="h-10"
            />
          ) : (
            <p className="text-gray-800">{editableItem.quantity}</p>
          )}
        </div>

        <div className="col-span-1 space-y-2">
          <Label className="text-sm font-medium text-gray-700">Unit</Label>
          {isEditing ? (
            <Input
              name="unit"
              value={editableItem.unit}
              onChange={handleChange}
              className="h-10"
            />
          ) : (
            <p className="text-gray-800">{editableItem.unit}</p>
          )}
        </div>
      </div>

      {/* Threshold */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Low Stock Threshold
        </Label>
        {isEditing ? (
          <Input
            type="number"
            name="threshold"
            value={editableItem.threshold}
            onChange={handleChange}
            className="h-10"
          />
        ) : (
          <p className="text-gray-800">{editableItem.threshold}</p>
        )}
      </div>

      {/* Allergen */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Allergen</Label>

        {isEditing ? (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="is_allergen"
              checked={editableItem.is_allergen}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-red-600">
              This ingredient contains allergens
            </span>
          </div>
        ) : (
          <p
            className={`text-sm font-semibold ${
              editableItem.is_allergen ? "text-red-600" : "text-gray-800"
            }`}
          >
            {editableItem.is_allergen ? "Yes (Allergen)" : "No"}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Available</Label>
        <p className="text-gray-800">
          {editableItem.available ? "In Stock" : "Out of Stock"}
        </p>
      </div>
    </div>
  );
};
