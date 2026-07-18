"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLoading } from "@/contexts/LoadingContext";
import { createMenuItem, createCategory } from "@/api-services/menu.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";
import { useCategoryData } from "../category/useCategoryData";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useInventory } from "../inventory/useInventory";
import { appendMenuItemToPage } from "@/store/menu.slice";
import { appendCategoryToPage } from "@/store/category.slice";
import { createInventoryItem } from "@/api-services/inventory.service";
import { appendInventoryItem } from "@/store/inventory.slice";

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
    ingredients_data: [],
  });

  const [tempIngredient, setTempIngredient] = useState({
    inventory_item: "",
    quantity: 1,
  });

  // ---------------- INLINE ADD STATES ----------------
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const [showAddInventory, setShowAddInventory] = useState(false);
  const [newInvName, setNewInvName] = useState("");
  const [newInvQty, setNewInvQty] = useState(0);
  const [newInvUnit, setNewInvUnit] = useState("");
  const [newInvThreshold, setNewInvThreshold] = useState(0);
  const [newInvAllergen, setNewInvAllergen] = useState(false);
  const [addingInventory, setAddingInventory] = useState(false);

  // ---------------- INLINE ADD HANDLERS ----------------
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required.");
      return;
    }
    setAddingCategory(true);
    try {
      const formData = new FormData();
      formData.append("name", newCategoryName.trim());
      formData.append("description", newCategoryDesc.trim());
      const res = await createCategory(
        auth.restaurants[0].id,
        formData,
        auth.token
      );
      dispatch(appendCategoryToPage({ key: "1", item: res }));
      setDishForm((prev) => ({ ...prev, category_id: String(res.id) }));
      toast.success("Category added!");
      setShowAddCategory(false);
      setNewCategoryName("");
      setNewCategoryDesc("");
    } catch (err: any) {
      toast.error(parseError(err) || "Failed to add category.");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleAddInventory = async () => {
    if (!newInvName.trim() || !newInvUnit.trim()) {
      toast.error("Item name and unit are required.");
      return;
    }
    setAddingInventory(true);
    try {
      const payload = {
        name: newInvName.trim(),
        is_allergen: newInvAllergen,
        unit: newInvUnit.trim(),
        threshold: newInvThreshold,
        restaurant: auth.restaurants[0].id,
      };
      const newItem = await createInventoryItem(payload, auth.token);
      dispatch(appendInventoryItem({ key: "1", item: newItem }));
      toast.success("Inventory item added!");
      setShowAddInventory(false);
      setNewInvName("");
      setNewInvQty(0);
      setNewInvUnit("");
      setNewInvThreshold(0);
      setNewInvAllergen(false);
    } catch (err: any) {
      toast.error(parseError(err) || "Failed to add inventory item.");
    } finally {
      setAddingInventory(false);
    }
  };

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

    // General dish validations
    if (!dishForm.name.trim()) errors.name = "Dish name is required.";
    if (!dishForm.price || Number(dishForm.price) <= 0)
      errors.price = "Valid price is required.";
    if (!dishForm.description.trim())
      errors.description = "Description is required.";
    if (!dishForm.category_id) errors.category_id = "Category is required.";
    if (!dishForm.prep_time.trim()) errors.prep_time = "Prep time is required.";
    if (!dishForm.image) errors.image = "Dish image is required.";

    // Ingredient validations
    if (dishForm.ingredients_data.length === 0) {
      errors.ingredients = "At least one ingredient is required.";
    } else {
      dishForm.ingredients_data.forEach((ing, idx) => {
        // Inventory item required
        if (!ing.inventory_item || ing.inventory_item.trim() === "") {
          errors[`ing_${idx}`] = "Select an inventory item.";
        }

        // Quantity required
        const qty = Number(ing.quantity);

        if (!ing.quantity || isNaN(qty) || qty <= 0) {
          errors[`ing_qty_${idx}`] = "Quantity must be greater than 0.";
        }
      });

      // Detect duplicates (only if items exist)
      const ids = dishForm.ingredients_data.map((i) => i.inventory_item);
      const duplicates = ids.filter(
        (item, index) => item && ids.indexOf(item) !== index
      );

      if (duplicates.length > 0) {
        errors.ingredients_duplicate = "Duplicate ingredients are not allowed.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  console.log("validationError", validationErrors);
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="category">Category</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="text-blue-600 hover:text-blue-800"
            >
              + Add Category
            </Button>
          </div>

          {showAddCategory && (
            <div className="rounded-lg border bg-gray-50 p-3 space-y-2">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddCategory}
                  disabled={addingCategory}
                >
                  {addingCategory ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategoryName("");
                    setNewCategoryDesc("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

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
                <p>No categories found. Add one above.</p>
              </div>
            )}

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
        </div>
        {validationErrors.category_id && (
          <p className="mt-1 text-xs text-red-600">
            {validationErrors.category_id}
          </p>
        )}
      </div>

      {/* INGREDIENTS */}
      <div className="space-y-3">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Ingredients</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddInventory(!showAddInventory)}
              className="text-blue-600 hover:text-blue-800"
            >
              + Add Inventory Item
            </Button>
          </div>

          {showAddInventory && (
            <div className="rounded-lg border bg-gray-50 p-3 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Item Name</label>
                <Input
                  placeholder="e.g. Chicken breast"
                  value={newInvName}
                  onChange={(e) => setNewInvName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Quantity</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newInvQty}
                    onChange={(e) => setNewInvQty(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Unit</label>
                  <Input
                    placeholder="kg, pcs, litres"
                    value={newInvUnit}
                    onChange={(e) => setNewInvUnit(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Low Stock Threshold</label>
                <Input
                  type="number"
                  placeholder="Minimum before reorder"
                  value={newInvThreshold}
                  onChange={(e) => setNewInvThreshold(Number(e.target.value))}
                />
              </div>
              <label className="flex items-center gap-2 text-sm pt-1">
                <input
                  type="checkbox"
                  checked={newInvAllergen}
                  onChange={(e) => setNewInvAllergen(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-xs font-medium text-red-600">Mark as Allergen</span>
              </label>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={handleAddInventory}
                  disabled={addingInventory}
                >
                  {addingInventory ? "Saving..." : "Save Item"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAddInventory(false);
                    setNewInvName("");
                    setNewInvQty(0);
                    setNewInvUnit("");
                    setNewInvThreshold(0);
                    setNewInvAllergen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

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
            inventoryData.length === 0 && !showAddInventory && (
              <div className="flex flex-col items-start gap-2 text-gray-600">
                <p>No inventory items found. Add one above.</p>
              </div>
            )}

          {/* ------------------- SELECTED INGREDIENTS ------------------- */}
          {dishForm.ingredients_data.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="font-semibold">Selected Ingredients</p>

              {dishForm.ingredients_data.map((ing, idx) => {
                const itemData = inventoryData.find(
                  (inv) => String(inv.id) === ing.inventory_item
                );

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md border bg-gray-50 p-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {itemData ? itemData.name : "Unknown Item"}
                      </span>
                      <span className="text-sm text-gray-500">
                        Qty: {ing.quantity}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setDishForm((prev) => ({
                          ...prev,
                          ingredients_data: prev.ingredients_data.filter(
                            (_, i) => i !== idx
                          ),
                        }))
                      }
                      className="font-bold text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {/* ------------------- SELECTED INGREDIENTS (EMPTY STATE) ------------------- */}
          {dishForm.ingredients_data.length === 0 && (
            <div className="mb-4 rounded-md bg-gray-100 p-4 text-center text-sm text-gray-600">
              <p className="font-medium">No ingredients added yet.</p>
              <p className="mt-1">
                Use the form below to add ingredients to this dish.
              </p>
            </div>
          )}

          {/* ------------------- ADD INGREDIENT SECTION ------------------- */}
          <div
            className={`mt-0 space-y-4 rounded-xl bg-gray-100 p-4 ${validationErrors.ingredients && "border-1 border-red-300"}`}
          >
            {/* Label with improved typography */}
            <label className="w-full text-center text-sm font-medium tracking-tight text-slate-700">
              Add Ingredient
            </label>

            <div className="flex items-center gap-3">
              {/* ITEM SELECT - Refined with subtle border and focus ring */}
              <div className="relative flex-1">
                <select
                  value={tempIngredient.inventory_item}
                  onChange={(e) => {
                    setTempIngredient((prev) => ({
                      ...prev,
                      inventory_item: e.target.value,
                    }));
                    setValidationErrors({});
                  }}
                  className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="">Select an item...</option>
                  {inventoryData
                    .filter(
                      (item) =>
                        !dishForm.ingredients_data.some(
                          (sel) => sel.inventory_item === String(item.id)
                        )
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {item.quantity} {item.unit} available
                      </option>
                    ))}
                </select>
              </div>

              {/* QUANTITY INPUT - Styled to match select height */}
              <div className="w-24">
                <Input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={String(tempIngredient.quantity)}
                  onChange={(e) =>
                    setTempIngredient((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value),
                    }))
                  }
                  className="h-10 rounded-lg border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* ADD BUTTON - Minimalist but high contrast */}
              <Button
                size="sm"
                className="flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-white transition-colors hover:bg-slate-800"
                onClick={() => {
                  if (!tempIngredient.inventory_item) return;
                  setDishForm((prev) => ({
                    ...prev,
                    ingredients_data: [
                      ...prev.ingredients_data,
                      tempIngredient,
                    ],
                  }));
                  setTempIngredient({ inventory_item: "", quantity: 1 });
                }}
              >
                <span className="text-lg">+</span>
                <span>Add</span>
              </Button>
            </div>
          </div>
        </div>

        {validationErrors.ingredients && (
          <p className="text-xs text-red-600">{validationErrors.ingredients}</p>
        )}
      </div>

      {/* PREP TIME */}
      <div>
        <Label>Preparation Time</Label>
        <Input
          type="time"
          value={dishForm.prep_time ? dishForm.prep_time.slice(0, 5) : ""}
          onChange={(e) =>
            setDishForm((prev) => ({ ...prev, prep_time: e.target.value ? e.target.value + ":00" : "" }))
          }
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
