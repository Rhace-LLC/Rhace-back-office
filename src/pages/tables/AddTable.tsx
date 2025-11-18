import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createTable } from "@/api-services/menu.service";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: Number(value),
    });
  };

  const handleSubmit = async () => {
    try {
      await createTable(
        auth.restaurants[0].id,
        { ...formData, is_available: true, restaurant: auth.restaurants[0].id },
        auth.token
      );
      toast.success("Table added successfully");
      setFormData({
        max_party_size: 0,
        table_number: 0,
      });
    } catch (error: any) {
      toast.error("Failed to add table");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl bg-white py-10">
      <div className="space-y-2">
        <Label>Table Number</Label>
        <Input
          name="table_number"
          type="number"
          value={formData.table_number}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Max Party Size</Label>
        <Input
          name="max_party_size"
          type="number"
          value={formData.max_party_size}
          onChange={handleChange}
        />
      </div>

      <Button onClick={handleSubmit} className="w-full cursor-pointer">
        Add Table
      </Button>
    </div>
  );
};
