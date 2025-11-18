"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MenuItem, updateMenuItem } from "@/api-services/menu.service";
import { useAuth } from "@/contexts/AuthContext";
import { useLoading } from "@/contexts/LoadingContext";
import { parseError } from "@/api-services/utils/parseError";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { updateMenuItemById } from "@/store/menu.slice";

export const ManageDish: React.FC<{ dish: MenuItem }> = ({ dish }) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const { setLoading, setLoadingText } = useLoading();

  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState(dish.image_url || null);

  const [dishForm, setDishForm] = useState({
    name: dish.name,
    price: dish.price,
    description: dish.description,
    available: dish.available,
    image: null as File | null,
  });

  // Image Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setDishForm((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Save Handler
  const handleSave = async () => {
    try {
      setLoading(true);
      setLoadingText("Updating Dish");

      const formData = new FormData();
      formData.append("name", dishForm.name);
      formData.append("price", dishForm.price);
      formData.append("description", dishForm.description);
      formData.append("available", String(dishForm.available));
      if (dishForm.image) formData.append("image", dishForm.image);

      const res = await updateMenuItem(
        auth.restaurants[0].id,
        dish.id,
        formData,
        auth.token
      );

      dispatch(updateMenuItemById(res))

      toast.success("Dish updated successfully!");
      setEditMode(false);
    } catch (err) {
      toast.error(parseError(err) || "Failed to update dish.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     READ MODE — Clean & Minimal
     ============================================================ */
  if (!editMode) {
    return (
      <div className="space-y-8 py-6 animate-fadeIn">
        {/* IMAGE */}
        <div className="w-full">
          {preview ? (
            <img
              src={preview}
              alt="Dish"
              className="h-[150px] w-full rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="h-[150px] w-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm border">
              No Image
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Name</span>
            <span className="font-semibold text-gray-900">{dish.name}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>Price</span>
            <span className="font-medium text-gray-900">NGN {dish.price}</span>
          </div>

          <div className="space-y-1">
            <span className="text-sm text-gray-500">Description</span>
            <p className="text-[13px] text-gray-700 leading-relaxed">
              {dish.description}
            </p>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>Status</span>
            <span
              className={`font-medium ${
                dish.available ? "text-green-600" : "text-red-500"
              }`}
            >
              {dish.available ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>

        <Button
          className="w-full bg-[#2542e3]"
          onClick={() => setEditMode(true)}
        >
          Edit Dish
        </Button>
      </div>
    );
  }

  /* ============================================================
     EDIT MODE — Modern & Premium Look
     ============================================================ */
  return (
    <div className="space-y-8 py-6 animate-fadeIn">
      {/* IMAGE UPLOAD */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Dish Image</Label>

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              className="h-[150px] w-full rounded-xl object-cover shadow-sm"
            />
            <button
              onClick={() => {
                setPreview(null);
                setDishForm((p) => ({ ...p, image: null }));
              }}
              className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg"
            >
              Remove
            </button>
          </div>
        ) : (
          <label
            htmlFor="image"
            className="h-[150px] w-full flex flex-col items-center justify-center rounded-xl border border-dashed bg-gray-50 text-gray-400 cursor-pointer hover:bg-gray-100 transition"
          >
            <p className="text-sm font-medium">Click to upload image</p>
          </label>
        )}

        <input
          id="image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* FORM FIELDS */}
      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            value={dishForm.name}
            onChange={(e) =>
              setDishForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className="mt-1"
          />
        </div>

        <div>
          <Label>Price (₦)</Label>
          <Input
            type="number"
            value={dishForm.price}
            onChange={(e) =>
              setDishForm((prev) => ({ ...prev, price: e.target.value }))
            }
            className="mt-1"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            rows={3}
            value={dishForm.description}
            onChange={(e) =>
              setDishForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="mt-1"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Switch
            checked={dishForm.available}
            onCheckedChange={(v) =>
              setDishForm((prev) => ({ ...prev, available: v }))
            }
          />
          <Label>Available</Label>
        </div>
      </div>

      <Separator />

      {/* ACTION BUTTONS */}
      <div className="space-y-3">
        <Button className="w-full bg-[#2542e3]" onClick={handleSave}>
          Save Changes
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setEditMode(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
