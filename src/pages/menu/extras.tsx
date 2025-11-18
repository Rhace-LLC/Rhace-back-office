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
import { useCategoryData } from "../category/useCategoryData";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useInventory } from "../inventory/useInventory";

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
    const response = await updateMenuItem(
      auth.restaurants[0].id,
      dish.id,
      formData,
      auth.token
    );

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



interface Ingredient {
  inventory_item: string;
  quantity: number;
}

interface DishForm {
  name: string;
  price: string;
  description: string;
  category_id: string;
  prep_time: string;
  available: boolean;
  image: File | null;
  ingredients_data: Ingredient[];
}

// =============== ADD DISH ===============
export const AddDish: React.FC = () => {
  const auth = useAuth();
  const { setLoading, setLoadingText } = useLoading();

  // --- Form State ---
  const [dishForm, setDishForm] = useState<DishForm>({
    name: "",
    price: "",
    description: "",
    category_id: "",
    prep_time: "",
    available: true,
    image: null,
    ingredients_data: [{ inventory_item: "", quantity: 1 }],
  });

  // --- File Upload ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setDishForm((prev) => ({ ...prev, image: file }));
  };

  // --- Categories ---
  const page = 1;
  const categoryStore = useSelector((state: RootState) => state.category);
  const allDataCategory = categoryStore.data[String(page)] ?? [];
  const {
    fetchAllData: fetchCategories,
    loading: fetchCategoriesLoading,
    error: fetchCategoriesError,
  } = useCategoryData(page);

  // --- Inventory ---
  const inventoryHook = useInventory({ page: 1 });
  const inventoryData = inventoryHook.allData;
  const inventoryLoading = inventoryHook.loading;
  const inventoryError = inventoryHook.error;
  const fetchInventory = inventoryHook.fetchAllData;

  // --- Submit Handler ---
  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("name", dishForm.name.trim());
    formData.append("price", dishForm.price);
    formData.append("description", dishForm.description.trim());
    formData.append("category_id", dishForm.category_id);
    formData.append("prep_time", dishForm.prep_time);
    formData.append("ingredients_data", JSON.stringify(dishForm.ingredients_data));
    formData.append("is_special", "true");
    if (dishForm.image) formData.append("image", dishForm.image);

    try {
      setLoading(true);
      setLoadingText("Creating Dish... Please Wait");
      const res = await createMenuItem(auth.restaurants[0].id, formData, auth.token);
      toast.success("Dish created successfully!");

      // Reset form
      setDishForm({
        name: "",
        price: "",
        description: "",
        category_id: "",
        prep_time: "",
        available: true,
        image: null,
        ingredients_data: [{ inventory_item: "", quantity: 1 }],
      });

      console.log("Dish Created:", res);
    } catch (error: any) {
      const message = parseError(error) || "Failed to add dish.";
      toast.error(message);
      console.error("Error creating dish:", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 pt-5">
      {/* Dish Name */}
      <div>
        <Label htmlFor="name">Dish Name</Label>
        <Input
          id="name"
          value={dishForm.name}
          onChange={(e) => setDishForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Enter dish name"
        />
      </div>

      {/* Price */}
      <div>
        <Label htmlFor="price">Price ($)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={dishForm.price}
          onChange={(e) => setDishForm((prev) => ({ ...prev, price: e.target.value }))}
          placeholder="0.00"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={dishForm.description}
          onChange={(e) => setDishForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the dish..."
          rows={3}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>

        {fetchCategoriesError && (
          <div className="flex flex-col items-start gap-2 text-red-600">
            <p>Error loading categories: {fetchCategoriesError}</p>
            <Button size="sm" variant="outline" onClick={fetchCategories}>
              Reload Categories
            </Button>
          </div>
        )}

        {!fetchCategoriesError && !fetchCategoriesLoading && allDataCategory.length === 0 && (
          <div className="flex flex-col items-start gap-2 text-gray-600">
            <p>No categories found.</p>
            <Button size="sm" variant="outline" onClick={fetchCategories}>
              Reload Categories
            </Button>
          </div>
        )}

        {!fetchCategoriesError && allDataCategory.length > 0 && (
          <select
            id="category"
            value={dishForm.category_id}
            onChange={(e) => setDishForm((prev) => ({ ...prev, category_id: e.target.value }))}
            className="w-full rounded-md border p-2"
          >
            <option value="">Select a category</option>
            {allDataCategory.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <Label>Ingredients</Label>

        {inventoryError && (
          <div className="flex flex-col items-start gap-2 text-red-600">
            <p>Error loading inventory: {inventoryError}</p>
            <Button size="sm" variant="outline" onClick={fetchInventory}>
              Reload Inventory
            </Button>
          </div>
        )}

        {!inventoryError && !inventoryLoading && inventoryData.length === 0 && (
          <div className="flex flex-col items-start gap-2 text-gray-600">
            <p>No inventory items found.</p>
            <Button size="sm" variant="outline" onClick={fetchInventory}>
              Reload Inventory
            </Button>
          </div>
        )}

        {!inventoryError && inventoryData.length > 0 && (
          <>
            {dishForm.ingredients_data.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={ing.inventory_item}
                  onChange={(e) =>
                    setDishForm((prev) => {
                      const newIngredients = [...prev.ingredients_data];
                      newIngredients[idx].inventory_item = e.target.value;
                      return { ...prev, ingredients_data: newIngredients };
                    })
                  }
                  className="flex-1 rounded-md border p-2"
                >
                  <option value="">Select Inventory Item</option>
                  {inventoryData
                    .filter(
                      (item) =>
                        !dishForm.ingredients_data.some(
                          (i, iIdx) => i.inventory_item === item.id && iIdx !== idx
                        )
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.quantity} {item.unit})
                      </option>
                    ))}
                </select>

                <Input
                  type="number"
                  min={1}
                  value={ing.quantity}
                  onChange={(e) =>
                    setDishForm((prev) => {
                      const newIngredients = [...prev.ingredients_data];
                      newIngredients[idx].quantity = Number(e.target.value);
                      return { ...prev, ingredients_data: newIngredients };
                    })
                  }
                  className="w-24"
                />

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    setDishForm((prev) => ({
                      ...prev,
                      ingredients_data: prev.ingredients_data.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
            ))}

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setDishForm((prev) => {
                  const last = prev.ingredients_data[prev.ingredients_data.length - 1];
                  if (!last || (last.inventory_item && last.quantity > 0)) {
                    return {
                      ...prev,
                      ingredients_data: [...prev.ingredients_data, { inventory_item: "", quantity: 1 }],
                    };
                  }
                  return prev; // Do nothing if last row is incomplete
                })
              }
            >
              + Add Ingredient
            </Button>
          </>
        )}
      </div>

      {/* Prep Time */}
      <div>
        <Label htmlFor="prep_time">Preparation Time</Label>
        <Input
          id="prep_time"
          value={dishForm.prep_time}
          onChange={(e) => setDishForm((prev) => ({ ...prev, prep_time: e.target.value }))}
          placeholder="00:30:00"
        />
      </div>

      {/* Dish Image */}
      <div>
        <Label htmlFor="image">Dish Image</Label>
        <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      {/* Availability */}
      <div className="flex items-center space-x-2">
        <Switch
          id="available"
          checked={dishForm.available}
          onCheckedChange={(checked: boolean) => setDishForm((prev) => ({ ...prev, available: checked }))}
        />
        <Label htmlFor="available">Available for ordering</Label>
      </div>

      <Separator />

      {/* Submit */}
      <div className="space-y-3 pt-5 pb-10">
        <Button className="w-full cursor-pointer bg-[#2542e3]" onClick={handleSubmit}>
          Add Dish
        </Button>
      </div>
    </div>
  );
};
