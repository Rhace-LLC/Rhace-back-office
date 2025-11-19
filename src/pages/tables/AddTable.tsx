import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createTable } from "@/api-services/menu.service";
import { UtensilsCrossed } from "lucide-react";

interface CreateTableRequest {
  max_party_size: number;
  table_number: number;
}

export const AddTable: React.FC = () => {
  const auth = useAuth();
  const [formData, setFormData] = useState<CreateTableRequest>({
    max_party_size: 0,
    table_number: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for button state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Note: The original logic converts the value to a Number directly. 
    // This is preserved.
    setFormData({
      ...formData,
      [name]: Number(value),
    });
  };

  const handleSubmit = async () => {
    // Basic validation
    if (formData.table_number <= 0) {
        toast.error("Table Number must be greater than zero.");
        return;
    }
    if (formData.max_party_size <= 0) {
        toast.error("Max Party Size must be greater than zero.");
        return;
    }

    setIsSubmitting(true);
    try {
      await createTable(
        auth.restaurants[0].id,
        { 
            ...formData, 
            is_available: true, 
            restaurant: auth.restaurants[0].id 
        },
        auth.token
      );
      toast.success(`Table ${formData.table_number} added successfully`);
      setFormData({
        max_party_size: 0,
        table_number: 0,
      });
    } catch (error: any) {
      toast.error("Failed to add table");
      console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    // Updated container for modern, minimalist look: centered, shadow, rounded
    <div className="py-8">
        
      {/* Title Section with Icon */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
        <UtensilsCrossed className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-800">Add New Dining Table</h2>
      </div>

      {/* Form Fields - Grid Layout for a cleaner look */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Table Number */}
        <div className="space-y-2">
          <Label htmlFor="table_number" className="text-sm font-medium text-gray-700">Table Number</Label>
          <Input
            id="table_number"
            name="table_number"
            type="number"
            value={String(formData.table_number)}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 101"
            className="h-10" // Ensures consistent height
          />
        </div>

        {/* Max Party Size */}
        <div className="space-y-2">
          <Label htmlFor="max_party_size" className="text-sm font-medium text-gray-700">Max Party Size</Label>
          <Input
            id="max_party_size"
            name="max_party_size"
            type="number"
            value={String(formData.max_party_size)}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 4"
            className="h-10" // Ensures consistent height
          />
        </div>
      </div>

      {/* Submit Button - Full width, primary color, modern styling */}
      <Button 
        onClick={handleSubmit} 
        className="w-full mt-6 py-3 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-base font-semibold transition-colors shadow-md"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adding Table..." : "Add Table"}
      </Button>
    </div>
  );
};