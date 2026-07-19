import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { createInventoryItem } from "@/api-services/inventory.service";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch } from "react-redux";
import { appendInventoryItem, Unit } from "@/store/inventory.slice";

// Define the expected shape of the inventory item data
interface InventoryItemData {
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  restaurant: string; // Assuming 'restaurant' is still needed, though not directly in the form
  is_allergen: boolean;
}

export const AddInventoryItem: React.FC<{
  currentPage: string;
  onSuccess: () => void;
}> = ({ currentPage, onSuccess }) => {
  const { token } = useAuth();
  const dispatch = useDispatch();
  const initialFormData: InventoryItemData = {
    name: "",
    quantity: 0,
    unit: "",
    threshold: 0,
    restaurant: "", // Placeholder or should be pulled from AuthContext/User data
    is_allergen: false,
  };
  const [formData, setFormData] = useState<InventoryItemData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let newValue: string | number | boolean = value;

    if (type === "number") {
      // Convert to number. If input is empty, reset to 0 to maintain type integrity.
      // You might consider converting to null/undefined if your API handles optional numbers differently.
      newValue = value === "" ? 0 : Number(value);
    } else if (type === "checkbox") {
      newValue = checked;
    }

    // The 'restaurant' field is not in the form, but if it needs dynamic assignment,
    // that logic should happen here or within handleSubmit.

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Basic validation check
    if (!formData.name.trim() || !formData.unit.trim()) {
      toast.error("Please fill in the Item Name and Unit.");
      return;
    }

    // Ensure numerical fields are valid numbers before sending
    const dataToSend = {
      ...formData,
      quantity: Number(formData.quantity) || 0,
      threshold: Number(formData.threshold) || 0,
    };

    setIsSubmitting(true);
    try {
      const newItem = await createInventoryItem(dataToSend, token);
      dispatch(appendInventoryItem({ key: currentPage, item: newItem }));
      toast.success(`${formData.name} added successfully!`);
      setFormData(initialFormData); // Reset form to initial state
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to add item. Check console for details.");
      console.error("Inventory item creation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Modern look: max-width for containment, larger padding, subtle shadow, rounded corners.
    <div className="py-7">
      {/* Title with strong visual presence */}

      {/* Main form body with consistent vertical spacing */}
      <div className="space-y-6">
        {/* Name Field (Full Width) */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Ingredient Name
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Organic Eggs, Roma Tomatoes"
            className="h-10"
          />
        </div>

        {/* Quantity & Unit Fields (Two Columns/Grid) */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 space-y-2">
            <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
              Unit
            </Label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select unit
              </option>
              {Object.values(Unit).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Threshold Field (Full Width for clarity) */}
        <div className="space-y-2">
          <Label
            htmlFor="threshold"
            className="text-sm font-medium text-gray-700"
          >
            Low Stock Threshold
          </Label>
          <Input
            id="threshold"
            name="threshold"
            type="number"
            value={formData.threshold}
            onChange={handleChange}
            min="0"
            placeholder="Minimum quantity before reorder (e.g., 5)"
            className="h-10"
          />
        </div>

        {/* Allergen Checkbox (Separate, attention-grabbing section) */}
        <div className="flex items-center space-x-3 pt-4">
          {/* Using a custom Checkbox component often provides better styling */}
          <input
            type="checkbox"
            id="is_allergen"
            name="is_allergen"
            checked={formData.is_allergen}
            onChange={handleChange}
            // Using native input with custom Tailwind classes for modern look
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <Label
            htmlFor="is_allergen"
            className="text-sm font-medium text-red-600"
          >
            Designate as Allergen
          </Label>
        </div>

        {/* Submit Button (Primary action, full width) */}
        <Button
          onClick={handleSubmit}
          className="font-md mt-8 w-full cursor-pointer bg-blue-600 py-3 text-[15px] transition-colors hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding Item..." : "Add Item to Inventory"}
        </Button>
      </div>
    </div>
  );
};
