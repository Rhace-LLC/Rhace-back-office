import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createInventoryItem } from "@/api-services/inventory.service";
import { useAuth } from "@/contexts/AuthContext";

export const AddInventoryItem: React.FC = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    threshold: 0,
    restaurant: "",
    is_allergen: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    try {
      await createInventoryItem(formData, token);
      toast.success("Inventory item added successfully");
      setFormData({
        name: "",
        category: "",
        quantity: 0,
        unit: "",
        threshold: 0,
        restaurant: "",
        is_allergen: false,
      });
    } catch (error: any) {
      toast.error("Failed to add item");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl bg-white py-10">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input name="name" value={formData.name} onChange={handleChange} />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Input
          name="category"
          value={formData.category}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Quantity</Label>
        <Input
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Unit</Label>
        <Input name="unit" value={formData.unit} onChange={handleChange} />
      </div>

      <div className="space-y-2">
        <Label>Threshold</Label>
        <Input
          name="threshold"
          type="number"
          value={formData.threshold}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_allergen"
          name="is_allergen"
          checked={formData.is_allergen}
          onChange={handleChange}
        />
        <Label htmlFor="is_allergen">Allergen</Label>
      </div>

      <Button onClick={handleSubmit} className="w-full cursor-pointer">
        Add Item
      </Button>
    </div>
  );
};
