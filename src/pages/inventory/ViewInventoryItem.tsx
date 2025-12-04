import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  InventoryItem,
  updateInventoryDataById,
} from "@/store/inventory.slice";
import { toast } from "sonner";
import {
  createInventoryTransaction,
  updateInventoryItem,
} from "@/api-services/inventory.service";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch } from "react-redux";

type InventoryTransactionType =
  | "wastage"
  | "restock"
  | "usage"
  | "comp"
  | "adjustment";

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

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);

  const [editableItem, setEditableItem] = useState(item);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingQuantity, setIsSavingQuantity] = useState(false);
  const [transactionType, setTransactionType] =
    useState<InventoryTransactionType>("restock");

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

  // ---------------- Edit Info ----------------
  const handleUpdateInfo = async () => {
    setIsSavingInfo(true);
    try {
      const payload = {
        name: editableItem.name,
        unit: editableItem.unit,
        threshold: editableItem.threshold,
        is_allergen: editableItem.is_allergen,
        restaurant: item.restaurant,
      };

      const response = await updateInventoryItem(
        String(item.id),
        payload,
        auth.token
      );

      dispatch(updateInventoryDataById(response));
      toast.success("Item info updated successfully");
      if (onUpdate) await onUpdate(response);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update item info");
    } finally {
      setIsSavingInfo(false);
    }
  };

  // ---------------- Edit Quantity ----------------
  const handleUpdateQuantity = async () => {
    setIsSavingQuantity(true);
    try {
      const payload = {
        item: item.id,
        quantity: editableItem.quantity,
        transaction_type: transactionType, // <-- use union type here
        reason: "Quantity update",
        recorded_by: auth.user?.id || "",
      };

      await createInventoryTransaction(payload, auth.token);

      dispatch(
        updateInventoryDataById({ ...item, quantity: editableItem.quantity })
      );
      toast.success("Quantity updated successfully");

      if (onUpdate) await onUpdate(item);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update quantity");
    } finally {
      setIsSavingQuantity(false);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Inventory Item</h2>
        <div className="flex gap-2">
          {!isEditingInfo && (
            <Button onClick={() => setIsEditingInfo(true)}>Edit Info</Button>
          )}
          {!isEditingQuantity && (
            <Button onClick={() => setIsEditingQuantity(true)}>
              Edit Quantity
            </Button>
          )}
        </div>
      </div>

      {/* ---------------- Info Section ---------------- */}
      {isEditingInfo && (
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Name</Label>
            <Input
              name="name"
              value={editableItem.name}
              onChange={handleChange}
              className="h-10"
            />
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Unit</Label>
            <Input
              name="unit"
              value={editableItem.unit}
              onChange={handleChange}
              className="h-10"
            />
          </div>

          {/* Threshold */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Low Stock Threshold
            </Label>
            <Input
              type="number"
              name="threshold"
              value={editableItem.threshold}
              onChange={handleChange}
              className="h-10"
            />
          </div>

          {/* Allergen */}
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

          {/* Save/Cancel */}
          <div className="flex gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleUpdateInfo}
              disabled={isSavingInfo}
            >
              {isSavingInfo ? "Saving..." : "Save Info"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setEditableItem(item);
                setIsEditingInfo(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isEditingQuantity && (
        <div className="space-y-4">
          {/* Quantity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Quantity
            </Label>
            <Input
              type="number"
              name="quantity"
              value={editableItem.quantity}
              onChange={handleChange}
              className="h-10"
            />
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Transaction Type
            </Label>
            <select
              value={transactionType}
              onChange={(e) =>
                setTransactionType(e.target.value as InventoryTransactionType)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            >
              <option value="wastage">Wastage</option>
              <option value="restock">Restock</option>
              <option value="usage">Usage</option>
              <option value="comp">Comp</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-2">
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleUpdateQuantity()}
              disabled={isSavingQuantity}
            >
              {isSavingQuantity ? "Updating..." : "Save Quantity"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setEditableItem(item);
                setIsEditingQuantity(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ---------------- Display Remaining Info ---------------- */}
      {!isEditingInfo && !isEditingQuantity && (
        <div className="space-y-4">
          <p>
            <span className="font-medium">Name:</span> {editableItem.name}
          </p>
          <p>
            <span className="font-medium">Unit:</span> {editableItem.unit}
          </p>
          <p>
            <span className="font-medium">Quantity:</span>{" "}
            {editableItem.quantity}
          </p>
          <p>
            <span className="font-medium">Threshold:</span>{" "}
            {editableItem.threshold}
          </p>
          <p>
            <span className="font-medium">Allergen:</span>{" "}
            {editableItem.is_allergen ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-medium">Available:</span>{" "}
            {editableItem.available ? "In Stock" : "Out of Stock"}
          </p>
        </div>
      )}
    </div>
  );
};
