"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MenuDishData } from "@/store/menu.slice";
import { useLoading } from "@/contexts/LoadingContext";
import { createMenuItem, updateMenuItem } from "@/api-services/menu.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";

// =============== MANAGE DISH ===============
// =============== MANAGE DISH ===============
export const ManageDish: React.FC<{ dish: MenuDishData }> = ({ dish }) => {
  const auth = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState<string | null>(dish.image_url || null);

  const [dishForm, setDishForm] = useState({
    name: dish.name,
    price: dish.price,
    description: dish.description,
    available: dish.availability,
    image: null as File | null,
  });

  // Handle image file selection + live preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setDishForm((prev) => ({ ...prev, image: file }));

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", dishForm.name);
    formData.append("price", dishForm.price);
    formData.append("description", dishForm.description);
    formData.append("available", String(dishForm.available));
    if (dishForm.image) formData.append("image", dishForm.image);
    const response = await updateMenuItem(dish.id, formData, auth.token);

    console.log("Updated Dish:", dishForm, response);
    setEditMode(false);
  };

  return (
    <div className="space-y-6 py-8">
      {!editMode ? (
        <>
          <div>
            <div className="mx-auto w-full pb-8">
              {dish.image_url ? (
                <img
                  src={dish.image_url}
                  alt={dish.name || "Dish image"}
                  className="h-[100px] w-full rounded-2xl border border-gray-100 object-cover shadow-md"
                />
              ) : (
                <div className="flex h-[100px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 shadow-sm">
                  No Image Available
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <span>Dish Name:</span>
              <h2 className="text-xl font-semibold">{dish.name}</h2>
            </div>
            <div className="flex justify-between">
              <span>Price</span>
              <p className="mt-3 text-lg font-medium">${dish.price}</p>
            </div>
            <div className="flex-col justify-between gap-2 pt-5">
              <span>Description: </span>
              <p className="mt-1 text-gray-600">{dish.description}</p>
            </div>
            <div className="flex justify-between pt-8">
              <span>Status: </span>

              <span
                className={`font-medium ${
                  dish.availability ? "text-green-600" : "text-red-500"
                }`}
              >
                {dish.availability ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>

          <div className="w-full">
            <Button
              className="w-full cursor-pointer bg-[#2542e3]"
              onClick={() => setEditMode(true)}
            >
              Edit Dish
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            {/* === Image Upload + Preview === */}
            <div>
              <Label htmlFor="image">Dish Image</Label>
              {preview ? (
                <div className="relative mt-2">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-[120px] w-full rounded-2xl border border-gray-200 object-cover shadow-md"
                  />
                  <button
                    onClick={() => {
                      setPreview(null);
                      setDishForm((prev) => ({ ...prev, image: null }));
                    }}
                    className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white transition hover:bg-black"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                // Clickable upload area
                <label
                  htmlFor="image"
                  className="mt-2 flex h-[120px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-gray-400 hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-1 h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-sm font-medium">Click to upload image</p>
                </label>
              )}

              {/* Hidden file input */}
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* === Editable Fields === */}
            <div>
              <Label htmlFor="name">Dish Name</Label>
              <Input
                id="name"
                value={dishForm.name}
                onChange={(e) =>
                  setDishForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter dish name"
              />
            </div>

            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={dishForm.price}
                onChange={(e) =>
                  setDishForm((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={dishForm.description}
                onChange={(e) =>
                  setDishForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the dish..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={dishForm.available}
                onCheckedChange={(checked: any) =>
                  setDishForm((prev) => ({ ...prev, available: checked }))
                }
              />
              <Label htmlFor="available">Available for ordering</Label>
            </div>

            <Separator />

            <div className="space-y-3">
              <Button
                className="w-full cursor-pointer bg-[#2542e3]"
                onClick={handleSave}
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// =============== ADD DISH ===============
export const AddDish: React.FC = () => {
  const { setLoading, setLoadingText } = useLoading();
  const auth = useAuth();
  const [dishForm, setDishForm] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
    prep_time: "",
    available: true,
    image: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setDishForm((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async () => {
    // Prepare FormData payload
    const formData = new FormData();
    formData.append("name", dishForm.name.trim());
    formData.append("price", dishForm.price);
    formData.append("description", dishForm.description.trim());
    formData.append("category_id", dishForm.category_id);
    formData.append("prep_time", dishForm.prep_time);
    formData.append(
      "ingredients_data",
      JSON.stringify([{ inventory_item: 3, quantity: 2 }])
    );
    formData.append("is_special", "true");

    if (dishForm.image) formData.append("image", dishForm.image);
    console.log("Dish Image", dishForm.image);

    try {
      setLoading(true);
      setLoadingText("Creating Dish... Please Wait");

      const res = await createMenuItem(formData, auth.token);

      toast.success("Dish created successfully!");
      console.log("✅ API Response:", res);

      // Optionally clear form
      setDishForm({
        name: "",
        price: "",
        description: "",
        category_id: "",
        prep_time: "",
        available: true,
        image: null,
      });
    } catch (error: any) {
      const message = parseError(error) || "Failed to add dish.";
      toast.error(message);
      console.error("❌ Error creating dish:", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 pt-5">
      <div>
        <Label htmlFor="name">Dish Name</Label>
        <Input
          id="name"
          value={dishForm.name}
          onChange={(e) =>
            setDishForm((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter dish name"
        />
      </div>

      <div>
        <Label htmlFor="price">Price ($)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={dishForm.price}
          onChange={(e) =>
            setDishForm((prev) => ({ ...prev, price: e.target.value }))
          }
          placeholder="0.00"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={dishForm.description}
          onChange={(e) =>
            setDishForm((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          placeholder="Describe the dish..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="category">Category ID</Label>
        <Input
          id="category"
          value={dishForm.category_id}
          onChange={(e) =>
            setDishForm((prev) => ({ ...prev, category_id: e.target.value }))
          }
          placeholder="Enter category ID"
        />
      </div>

      <div>
        <Label htmlFor="prep_time">Preparation Time (HH:MM:SS)</Label>
        <Input
          id="prep_time"
          value={dishForm.prep_time}
          onChange={(e) =>
            setDishForm((prev) => ({ ...prev, prep_time: e.target.value }))
          }
          placeholder="00:30:00"
        />
      </div>

      <div>
        <Label htmlFor="image">Dish Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="available"
          checked={dishForm.available}
          onCheckedChange={(checked: any) =>
            setDishForm((prev) => ({ ...prev, available: checked }))
          }
        />
        <Label htmlFor="available">Available for ordering</Label>
      </div>

      <Separator />

      <div className="space-y-3 pt-5 pb-10">
        <Button
          className="w-full cursor-pointer bg-[#2542e3]"
          onClick={handleSubmit}
        >
          Add Dish
        </Button>
      </div>
    </div>
  );
};
