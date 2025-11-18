"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLoading } from "@/contexts/LoadingContext";
import { createMenuItem } from "@/api-services/menu.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";
import { useCategoryData } from "../category/useCategoryData";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useInventory } from "../inventory/useInventory";
import { appendMenuItemToPage } from "@/store/menu.slice";

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

export const AddDish: React.FC<{
  onComplete: () => void;
  currentPage: string;
}> = ({ onComplete, currentPage }) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const { setLoading, setLoadingText } = useLoading();

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  // ---------------- IMAGE HANDLING ----------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setDishForm((prev) => ({ ...prev, image: file }));

    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setDishForm((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  // ---------------- CATEGORY DATA ----------------

  // --- Categories ---
  const page = 1;
  const categoryStore = useSelector((state: RootState) => state.category);
  const allDataCategory = categoryStore.data[String(page)] ?? [];

  const {
    fetchAllData: fetchCategories,
    loading: fetchCategoriesLoading,
    error: fetchCategoriesError,
  } = useCategoryData(page);
  // ---------------- INVENTORY DATA ----------------
  const inventoryHook = useInventory({ page: 1 });
  const inventoryData = inventoryHook.allData;
  const inventoryLoading = inventoryHook.loading;
  const inventoryError = inventoryHook.error;
  const fetchInventory = inventoryHook.fetchAllData;

  // ---------------- VALIDATION LOGIC ----------------
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!dishForm.name.trim()) errors.name = "Dish name is required.";
    if (!dishForm.price || Number(dishForm.price) <= 0)
      errors.price = "Valid price is required.";
    if (!dishForm.description.trim())
      errors.description = "Description is required.";
    if (!dishForm.category_id) errors.category_id = "Category is required.";
    if (!dishForm.prep_time.trim()) errors.prep_time = "Prep time is required.";
    if (!dishForm.image) errors.image = "Dish image is required.";

    // Ingredient validation
    if (dishForm.ingredients_data.length === 0)
      errors.ingredients = "At least one ingredient is required.";

    dishForm.ingredients_data.forEach((ing, idx) => {
      if (!ing.inventory_item)
        errors[`ing_${idx}`] = "Select an inventory item.";
      if (!ing.quantity || ing.quantity < 1)
        errors[`ing_qty_${idx}`] = "Quantity must be at least 1.";
    });

    // Detect duplicates
    const ids = dishForm.ingredients_data.map((i) => i.inventory_item);
    const duplicates = ids.filter(
      (item, index) => ids.indexOf(item) !== index && item !== ""
    );
    if (duplicates.length > 0)
      errors.ingredients = "Duplicate ingredients are not allowed.";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix highlighted errors.");
      return;
    }

    const formData = new FormData();
    formData.append("name", dishForm.name.trim());
    formData.append("price", dishForm.price);
    formData.append("description", dishForm.description.trim());
    formData.append("category_id", dishForm.category_id);
    formData.append("prep_time", dishForm.prep_time);
    formData.append("is_special", "true");
    formData.append(
      "ingredients_data",
      JSON.stringify(dishForm.ingredients_data)
    );
    if (dishForm.image) formData.append("image", dishForm.image);

    try {
      setLoading(true);
      setLoadingText("Creating Dish... Please Wait");

      const res = await createMenuItem(
        auth.restaurants[0].id,
        formData,
        auth.token
      );
      dispatch(appendMenuItemToPage({ key: currentPage, item: res }));
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

      // 🔥 Notify parent
      onComplete();

      setImagePreview(null);
      setValidationErrors({});
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to add dish.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-5 pt-5 pb-10">
      {/* NAME */}
      <div>
        <Label>Dish Name</Label>
        <Input
          value={dishForm.name}
          onChange={(e) =>
            setDishForm((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter dish name"
        />
        {validationErrors.name && (
          <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>
        )}
      </div>

      {/* PRICE */}
      <div>
        <Label>Price (NGN)</Label>
        <Input
          type="number"
          value={dishForm.price}
          onChange={(e) =>
            setDishForm((prev) => ({ ...prev, price: e.target.value }))
          }
          placeholder="1500"
        />
        {validationErrors.price && (
          <p className="mt-1 text-xs text-red-600">{validationErrors.price}</p>
        )}
      </div>

      {/* DESCRIPTION */}
      <div>
        <Label>Description</Label>
        <Textarea
          value={dishForm.description}
          onChange={(e) =>
            setDishForm((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
        />
        {validationErrors.description && (
          <p className="mt-1 text-xs text-red-600">
            {validationErrors.description}
          </p>
        )}
      </div>

      {/* CATEGORY */}
      <div>
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

          {!fetchCategoriesError &&
            !fetchCategoriesLoading &&
            allDataCategory.length === 0 && (
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
              onChange={(e) =>
                setDishForm((prev) => ({
                  ...prev,
                  category_id: e.target.value,
                }))
              }
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
        {validationErrors.category_id && (
          <p className="mt-1 text-xs text-red-600">
            {validationErrors.category_id}
          </p>
        )}
      </div>

      {/* INGREDIENTS */}
      <div className="space-y-3">
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

          {!inventoryError &&
            !inventoryLoading &&
            inventoryData.length === 0 && (
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
                            (i, iIdx) =>
                              i.inventory_item === String(item.id) && iIdx !== idx
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
                    value={String(ing.quantity)}
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
                        ingredients_data: prev.ingredients_data.filter(
                          (_, i) => i !== idx
                        ),
                      }))
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>

        {validationErrors.ingredients && (
          <p className="text-xs text-red-600">{validationErrors.ingredients}</p>
        )}

        <Button
          variant="outline"
          onClick={() =>
            setDishForm((prev) => ({
              ...prev,
              ingredients_data: [
                ...prev.ingredients_data,
                { inventory_item: "", quantity: 1 },
              ],
            }))
          }
        >
          + Add Ingredient
        </Button>
      </div>

      {/* PREP TIME */}
      <div>
        <Label>Preparation Time</Label>
        <Input
          value={dishForm.prep_time}
          onChange={(e) =>
            setDishForm((prev) => ({ ...prev, prep_time: e.target.value }))
          }
          placeholder="00:30:00"
        />
        {validationErrors.prep_time && (
          <p className="mt-1 text-xs text-red-600">
            {validationErrors.prep_time}
          </p>
        )}
      </div>

      {/* IMAGE UPLOAD */}
      <div>
        <Label>Dish Image</Label>
        <Input type="file" accept="image/*" onChange={handleFileChange} />

        {validationErrors.image && (
          <p className="mt-1 text-xs text-red-600">{validationErrors.image}</p>
        )}

        {imagePreview && (
          <div className="mt-3 flex flex-col items-start gap-2">
            <img
              src={imagePreview}
              alt="preview"
              className="h-32 w-32 rounded-md border object-cover"
            />
            <Button variant="destructive" size="sm" onClick={clearImage}>
              Remove Image
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* SUBMIT */}
      <Button className="w-full bg-[#2542e3]" onClick={handleSubmit}>
        Add Dish
      </Button>
    </div>
  );
};
