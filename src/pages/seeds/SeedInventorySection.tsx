import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, RefreshCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  createSeedInventoryItem,
  deleteSeedInventoryItem,
  listSeedInventoryItems,
  patchSeedInventoryItem,
  type SeedInventoryItem,
} from "@/api-services/seeds";
import { parseError } from "@/api-services/utils/parseError";
import { cn } from "@/lib/utils";

const emptyForm = {
  name: "",
  unit: "",
  threshold: "0",
  quantity: "0",
  available: true,
  is_allergen: false,
};

const inputClass =
  "h-11 w-full rounded-[10px] border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-subtle focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none";

export function SeedInventorySection() {
  const { token } = useAuth();
  const [items, setItems] = useState<SeedInventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const res = await listSeedInventoryItems(token);
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(parseError(err) || "Failed to load seed inventory items.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (item: SeedInventoryItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      unit: item.unit,
      threshold: String(item.threshold),
      quantity: String(item.quantity),
      available: item.available,
      is_allergen: item.is_allergen,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.unit.trim()) {
      toast.error("Name and unit are required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId == null) {
        await createSeedInventoryItem(
          {
            name: form.name.trim(),
            unit: form.unit.trim(),
            threshold: Number(form.threshold) || 0,
            available: form.available,
          },
          token
        );
        toast.success("Seed inventory item created.");
      } else {
        await patchSeedInventoryItem(
          editingId,
          {
            name: form.name.trim(),
            unit: form.unit.trim(),
            threshold: Number(form.threshold) || 0,
            quantity: Number(form.quantity) || 0,
            available: form.available,
            is_allergen: form.is_allergen,
          },
          token
        );
        toast.success("Seed inventory item updated.");
      }
      setShowForm(false);
      fetchItems();
    } catch (err) {
      toast.error(parseError(err) || "Could not save the inventory item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: SeedInventoryItem) => {
    if (!window.confirm(`Delete seed inventory item "${item.name}"?`)) return;
    setDeletingId(item.id);
    try {
      await deleteSeedInventoryItem(item.id, token);
      toast.success("Seed inventory item deleted.");
      fetchItems();
    } catch (err) {
      toast.error(parseError(err) || "Could not delete the inventory item.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section aria-label="Seed inventory items" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {items.length} item{items.length === 1 ? "" : "s"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchItems}
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
            New item
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
              Name *
              <input
                className={cn(inputClass, "mt-1.5")}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Carrot"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Unit *
              <input
                className={cn(inputClass, "mt-1.5")}
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                placeholder="e.g. kg, pcs, litres"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Threshold
              <input
                type="number"
                className={cn(inputClass, "mt-1.5")}
                value={form.threshold}
                onChange={(e) =>
                  setForm((p) => ({ ...p, threshold: e.target.value }))
                }
              />
            </label>
            {editingId != null && (
              <label className="block text-sm font-medium text-ink">
                Quantity
                <input
                  type="number"
                  className={cn(inputClass, "mt-1.5")}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                />
              </label>
            )}
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
            {editingId != null && (
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.is_allergen}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, is_allergen: e.target.checked }))
                  }
                  className="h-4 w-4 accent-black"
                />
                Allergen
              </label>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center rounded-[10px] bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink-secondary disabled:opacity-50"
            >
              {saving ? "Saving…" : editingId == null ? "Create" : "Save changes"}
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
          No seed inventory items yet. Create the first one above.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-[16px] border border-line bg-cardfill p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {item.name}{" "}
                  <span className="font-mono text-xs text-ink-subtle">
                    #{item.id}
                  </span>
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {item.quantity} {item.unit} · threshold {item.threshold}
                  {item.is_allergen ? " · allergen" : ""}
                  {item.available ? "" : " · unavailable"}
                  {item.is_default ? " · default" : ""}
                </p>
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
