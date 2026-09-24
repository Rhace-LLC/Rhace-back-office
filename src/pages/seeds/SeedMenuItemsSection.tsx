import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Pencil, Plus, RefreshCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import {
  createSeedMenuItem,
  deleteSeedMenuItem,
  listSeedCategories,
  listSeedInventoryItems,
  listSeedMenuItems,
  patchSeedMenuItem,
  type SeedCategory,
  type SeedIngredientInput,
  type SeedInventoryItem,
  type SeedMenuItem,
} from "@/api-services/seeds";
import { parseError } from "@/api-services/utils/parseError";
import { cn } from "@/lib/utils";

interface IngredientRow {
  inventory_item: string;
  quantity: string;
}

const emptyForm = {
  name: "",
  category_id: "",
  description: "",
  price: "",
  prep_time: "",
  image: "",
  available: true,
  is_special: false,
};

const inputClass =
  "h-11 w-full rounded-[10px] border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-subtle focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none";

export function SeedMenuItemsSection() {
  const { token } = useAuth();
  const [items, setItems] = useState<SeedMenuItem[]>([]);
  const [categories, setCategories] = useState<SeedCategory[]>([]);
  const [inventory, setInventory] = useState<SeedInventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const [menuRes, catRes, invRes] = await Promise.all([
        listSeedMenuItems(token),
        listSeedCategories(token),
        listSeedInventoryItems(token),
      ]);
      setItems(Array.isArray(menuRes) ? menuRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setInventory(Array.isArray(invRes) ? invRes : []);
    } catch (err) {
      setError(parseError(err) || "Failed to load seed menu items.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIngredients([]);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const startEdit = (item: SeedMenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category_id: String(item.category?.id ?? ""),
      description: item.description ?? "",
      price: item.price ?? "",
      prep_time: item.prep_time ?? "",
      image: item.image_url ?? "",
      available: item.available,
      is_special: item.is_special,
    });
    setImageFile(null);
    setImagePreview(null);
    setIngredients(
      (item.ingredients ?? []).map((ing) => ({
        inventory_item: String(ing.inventory_item),
        quantity: String(ing.quantity),
      }))
    );
    setShowForm(true);
  };

  const buildIngredients = (): SeedIngredientInput[] =>
    ingredients
      .filter((row) => row.inventory_item !== "")
      .map((row) => ({
        inventory_item: Number(row.inventory_item),
        quantity: Number(row.quantity) || 0,
      }));

  const handleImagePick = (file?: File) => {
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setForm((p) => ({ ...p, image: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Dish name is required.");
      return;
    }
    if (!form.category_id) {
      toast.error("Pick a category first (create one in the Categories tab).");
      return;
    }
    setSaving(true);
    try {
      // Upload a newly picked image first so the record stores the URL.
      let imageUrl = form.image.trim();
      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImageToCloudinary(imageFile);
        } catch (err) {
          toast.error(parseError(err) || "Image upload failed.");
          return;
        } finally {
          setUploadingImage(false);
        }
      }
      // The seed endpoints require the full object on write.
      const payload = {
        name: form.name.trim(),
        category_id: Number(form.category_id),
        description: form.description.trim(),
        price: form.price.trim(),
        ingredients_data: buildIngredients(),
        prep_time: form.prep_time.trim(),
        available: form.available,
        is_special: form.is_special,
        ...(imageUrl ? { image: imageUrl } : {}),
      };
      if (editingId == null) {
        await createSeedMenuItem(payload, token);
        toast.success("Seed menu item created.");
      } else {
        await patchSeedMenuItem(editingId, payload, token);
        toast.success("Seed menu item updated.");
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      toast.error(parseError(err) || "Could not save the seed menu item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: SeedMenuItem) => {
    if (!window.confirm(`Delete seed menu item "${item.name}"?`)) return;
    setDeletingId(item.id);
    try {
      await deleteSeedMenuItem(item.id, token);
      toast.success("Seed menu item deleted.");
      fetchAll();
    } catch (err) {
      toast.error(parseError(err) || "Could not delete the seed menu item.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section aria-label="Seed menu items" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {items.length} dish{items.length === 1 ? "" : "es"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchAll}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-line-strong disabled:opacity-50"
          >
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-ink-secondary"
          >
            <Plus className="h-4 w-4" />
            New dish
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-[16px] border border-line bg-cardfill p-4 sm:p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Dish name *
              <input
                className={cn(inputClass, "mt-1.5")}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Jollof Rice"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Category *
              <select
                className={cn(inputClass, "mt-1.5")}
                value={form.category_id}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category_id: e.target.value }))
                }
              >
                <option value="">Select a category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-ink">
              Price
              <input
                className={cn(inputClass, "mt-1.5")}
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="e.g. 2500"
                inputMode="decimal"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Prep time
              <input
                className={cn(inputClass, "mt-1.5")}
                value={form.prep_time}
                onChange={(e) =>
                  setForm((p) => ({ ...p, prep_time: e.target.value }))
                }
                placeholder="e.g. 00:15:00"
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-ink">
            Description
            <textarea
              className={cn(inputClass, "mt-1.5 h-auto min-h-[80px] py-2.5")}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="A short description"
            />
          </label>

          <div>
            <p className="text-sm font-medium text-ink">Dish image</p>
            {imagePreview || form.image ? (
              <div className="relative mt-1.5 overflow-hidden rounded-[10px] border border-line">
                <img
                  src={imagePreview ?? form.image}
                  alt=""
                  className="h-36 w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={clearImage}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink/60 text-white transition-colors hover:bg-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="mt-1.5 flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-line bg-surface text-sm text-ink-muted transition-colors hover:border-brand hover:text-brand">
                <ImagePlus className="h-5 w-5" />
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImagePick(e.target.files?.[0])}
                />
              </label>
            )}
            {(imagePreview || form.image) && (
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-muted hover:text-ink">
                <ImagePlus className="h-4 w-4" />
                Replace image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImagePick(e.target.files?.[0])}
                />
              </label>
            )}
            <input
              className={cn(inputClass, "mt-2")}
              value={form.image}
              onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
              placeholder="…or paste an image URL"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Ingredients</p>
            {ingredients.length === 0 ? (
              <p className="mt-1.5 text-xs text-ink-subtle">
                No ingredients yet — the backend requires at least one.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {ingredients.map((row, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <select
                      aria-label="Inventory item"
                      className={cn(inputClass, "flex-1")}
                      value={row.inventory_item}
                      onChange={(e) =>
                        setIngredients((prev) =>
                          prev.map((r, idx) =>
                            idx === i
                              ? { ...r, inventory_item: e.target.value }
                              : r
                          )
                        )
                      }
                    >
                      <option value="">Select ingredient…</option>
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} ({inv.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      aria-label="Quantity"
                      type="number"
                      min="0"
                      className={cn(inputClass, "w-24")}
                      value={row.quantity}
                      onChange={(e) =>
                        setIngredients((prev) =>
                          prev.map((r, idx) =>
                            idx === i ? { ...r, quantity: e.target.value } : r
                          )
                        )
                      }
                    />
                    <button
                      type="button"
                      aria-label="Remove ingredient"
                      onClick={() =>
                        setIngredients((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        )
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-ink-subtle transition-colors hover:bg-line-subtle hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() =>
                setIngredients((prev) => [
                  ...prev,
                  { inventory_item: "", quantity: "1" },
                ])
              }
              className="mt-2 inline-flex h-9 items-center gap-2 rounded-[10px] border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:border-line-strong"
            >
              <Plus className="h-4 w-4" />
              Add ingredient
            </button>
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) =>
                  setForm((p) => ({ ...p, available: e.target.checked }))
                }
                className="h-4 w-4 accent-black"
              />
              Available
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.is_special}
                onChange={(e) =>
                  setForm((p) => ({ ...p, is_special: e.target.checked }))
                }
                className="h-4 w-4 accent-black"
              />
              Special
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="inline-flex h-10 items-center rounded-[10px] bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink-secondary disabled:opacity-50"
            >
              {uploadingImage
                ? "Uploading image…"
                : saving
                  ? "Saving…"
                  : editingId == null
                    ? "Create"
                    : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-line-strong"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading && items.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-[16px] border border-dashed border-line py-10 text-center text-sm text-ink-muted">
          No seed dishes yet. Create the first one above.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-[16px] border border-line bg-cardfill p-4"
            >
              <div className="flex min-w-0 items-start gap-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-[10px] border border-line object-cover"
                  />
                )}
                <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {item.name}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {item.category?.name ?? "—"} · ₦{item.price}
                  {item.display_ingredients?.length
                    ? ` · ${item.display_ingredients.join(", ")}`
                    : ""}
                </p>
                {item.description && (
                  <p className="mt-0.5 line-clamp-2 text-sm text-ink-muted">
                    {item.description}
                  </p>
                )}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  aria-label={`Edit ${item.name}`}
                  onClick={() => startEdit(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-subtle transition-colors hover:bg-line-subtle hover:text-ink"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-subtle transition-colors hover:bg-line-subtle hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
