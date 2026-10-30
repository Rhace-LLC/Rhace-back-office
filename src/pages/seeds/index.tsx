import { useCallback, useState } from "react";
import {
  Sprout,
  Loader2,
  Save,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  createSeedCategory,
  createSeedInventoryItem,
  createSeedMenuItem,
  listSeedCategories,
  listSeedInventoryItems,
  listSeedMenuItems,
  deleteSeedCategory,
  deleteSeedMenuItem,
} from "@/api-services/seeds";
import { parseError } from "@/api-services/utils/parseError";
import { MENU_CATEGORIES, SAMPLE_MENU } from "@/pages/onboarding/data_/menu-data";
import { SeedCategoriesSection } from "./SeedCategoriesSection";
import { SeedInventorySection } from "./SeedInventorySection";
import { SeedMenuItemsSection } from "./SeedMenuItemsSection";

const TABS = [
  { key: "categories", label: "Categories" },
  { key: "menu-items", label: "Menu items" },
  { key: "inventory", label: "Inventory items" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type ItemStatus = "pending" | "success" | "failed";

interface ImportRow {
  name: string;
  category: string;
  status: ItemStatus;
  error?: string;
  attempts: number;
}

const MAX_RETRIES = 3;

export default function SeedsPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<TabKey>("categories");
  const [saving, setSaving] = useState(false);
  const [flushing, setFlushing] = useState(false);
  const [rows, setRows] = useState<ImportRow[]>([]);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const importStaticSample = useCallback(async () => {
    if (!token) {
      toast.error("No session token.");
      return;
    }
    setSaving(true);
    setRows([]);
    try {
      // Clear existing seed data so the import is clean.
      const [existingCats, existingItems] = await Promise.all([
        listSeedCategories(token),
        listSeedMenuItems(token),
      ]);
      for (const c of (Array.isArray(existingCats) ? existingCats : [])) {
        try {
          await deleteSeedCategory(c.id, token);
        } catch {
          // ignore
        }
      }
      for (const i of (Array.isArray(existingItems) ? existingItems : [])) {
        try {
          await deleteSeedMenuItem(i.id, token);
        } catch {
          // ignore
        }
      }

      // Import static categories, capturing returned IDs by label.
      const categoryIdMap = new Map<string, number>();
      for (const cat of MENU_CATEGORIES) {
        try {
          const created = await createSeedCategory(
            { name: cat.label, description: `Sample ${cat.label} category` },
            token
          );
          categoryIdMap.set(cat.label, Number((created as any)?.id));
        } catch (err) {
          console.warn("Seed category import skipped:", cat.label, err);
        }
      }

      // Ensure a placeholder inventory item exists (backend requires at least
      // one ingredient per menu item).
      let placeholderId: number | null = null;
      const existingInv = await listSeedInventoryItems(token);
      const invList = Array.isArray(existingInv) ? existingInv : [];
      if (invList.length > 0) {
        placeholderId = invList[0].id;
      } else {
        try {
          const created = await createSeedInventoryItem(
            {
              name: "General ingredient",
              unit: "portion",
              threshold: 0,
              available: true,
            },
            token
          );
          placeholderId = Number((created as any)?.id);
        } catch (err) {
          console.warn("Failed to create placeholder ingredient:", err);
        }
      }

      // Import static sample menu items with retry + per-item tracking.
      const newRows: ImportRow[] = SAMPLE_MENU.map((dish) => ({
        name: dish.name,
        category: dish.category,
        status: "pending",
        attempts: 0,
      }));
      setRows(newRows);

      let imported = 0;
      for (let i = 0; i < SAMPLE_MENU.length; i++) {
        const dish = SAMPLE_MENU[i];
        const categoryId = categoryIdMap.get(dish.category);
        if (!categoryId) {
          setRows((prev) =>
            prev.map((r) =>
              r.name === dish.name
                ? { ...r, status: "failed", error: "No category match" }
                : r
            )
          );
          continue;
        }

        const ingredients_data =
          placeholderId != null
            ? [{ inventory_item: placeholderId, quantity: 1 }]
            : [];

        let lastErr: unknown = null;
        let success = false;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          setRows((prev) =>
            prev.map((r) =>
              r.name === dish.name
                ? { ...r, attempts: attempt + 1 }
                : r
            )
          );
          try {
            await createSeedMenuItem(
              {
                name: dish.name,
                category_id: categoryId,
                description: dish.description,
                price: String(dish.price),
                ingredients_data,
                prep_time: "00:15:00",
                available: dish.available ?? true,
                is_special: false,
              },
              token
            );
            success = true;
            imported += 1;
            break;
          } catch (err) {
            lastErr = err;
            await sleep(800 * (attempt + 1));
          }
        }

        setRows((prev) =>
          prev.map((r) =>
            r.name === dish.name
              ? {
                  ...r,
                  status: success ? "success" : "failed",
                  error: success
                    ? undefined
                    : parseError(lastErr) || "Import failed.",
                }
              : r
          )
        );
      }

      toast.success(
        imported > 0
          ? `Imported ${imported} of ${SAMPLE_MENU.length} sample dishes into seed data.`
          : "No dishes were imported."
      );
    } catch (err) {
      toast.error(parseError(err) || "Failed to import static sample data.");
    } finally {
      setSaving(false);
    }
  }, [token]);

  const flushSeedData = useCallback(async () => {
    if (!token) {
      toast.error("No session token.");
      return;
    }
    if (!window.confirm("Delete all seed categories and menu items? This cannot be undone."))
      return;
    setFlushing(true);
    setRows([]);
    try {
      const [existingCats, existingItems] = await Promise.all([
        listSeedCategories(token),
        listSeedMenuItems(token),
      ]);
      const cats = Array.isArray(existingCats) ? existingCats : [];
      const items = Array.isArray(existingItems) ? existingItems : [];

      // Delete menu items first (they reference categories).
      for (const i of items) {
        try {
          await deleteSeedMenuItem(i.id, token);
        } catch {
          // ignore individual failures
        }
      }
      // Then delete categories.
      for (const c of cats) {
        try {
          await deleteSeedCategory(c.id, token);
        } catch {
          // ignore individual failures
        }
      }

      toast.success(`Flushed ${items.length} menu item(s) and ${cats.length} category(ies).`);
    } catch (err) {
      toast.error(parseError(err) || "Failed to flush seed data.");
    } finally {
      setFlushing(false);
    }
  }, [token]);

  const retryRow = async (row: ImportRow) => {
    if (!token) return;
    setRows((prev) =>
      prev.map((r) =>
        r.name === row.name ? { ...r, status: "pending", attempts: 0 } : r
      )
    );
    const dish = SAMPLE_MENU.find((d) => d.name === row.name);
    if (!dish) return;
    // Re-fetch category map (categories should already exist).
    const existingCats = await listSeedCategories(token);
    const catList = Array.isArray(existingCats) ? existingCats : [];
    const categoryIdMap = new Map(
      catList.map((c) => [c.name, c.id])
    );
    const categoryId = categoryIdMap.get(dish.category);
    if (!categoryId) {
      setRows((prev) =>
        prev.map((r) =>
          r.name === dish.name
            ? { ...r, status: "failed", error: "No category match" }
            : r
        )
      );
      return;
    }

    const existingInv = await listSeedInventoryItems(token);
    const invList = Array.isArray(existingInv) ? existingInv : [];
    const placeholderId =
      invList.length > 0 ? invList[0].id : null;

    const ingredients_data =
      placeholderId != null
        ? [{ inventory_item: placeholderId, quantity: 1 }]
        : [];

    let lastErr: unknown = null;
    let success = false;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      setRows((prev) =>
        prev.map((r) =>
          r.name === dish.name ? { ...r, attempts: attempt + 1 } : r
        )
      );
      try {
        await createSeedMenuItem(
          {
            name: dish.name,
            category_id: categoryId,
            description: dish.description,
            price: String(dish.price),
            ingredients_data,
            prep_time: "00:15:00",
            available: dish.available ?? true,
            is_special: false,
          },
          token
        );
        success = true;
        break;
      } catch (err) {
        lastErr = err;
        await sleep(800 * (attempt + 1));
      }
    }

    setRows((prev) =>
      prev.map((r) =>
        r.name === dish.name
          ? {
              ...r,
              status: success ? "success" : "failed",
              error: success ? undefined : parseError(lastErr) || "Import failed.",
            }
          : r
      )
    );
  };

  const successCount = rows.filter((r) => r.status === "success").length;
  const failedCount = rows.filter((r) => r.status === "failed").length;
  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 md:px-8 lg:px-12">
      <header className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cardfill text-brand">
          <Sprout className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
            Seed Data
          </h1>
          <p className="mt-1 text-sm leading-5 text-ink-muted">
            Local-only tools. Not available in production.
          </p>
        </div>
      </header>

      <div className="py-4" />

      {/* Import static onboarding sample data into seed */}
      <div
        className="rounded-[20px] border border-line bg-cardfill p-4 sm:p-5 mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <p className="text-sm font-medium text-ink">
              Import static sample menu into seed
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Copies the built-in sample categories and dishes (from the
              onboarding menu step) into your seed data. Once imported, the
              onboarding sample step fetches from this seed endpoint instead
              of static data. Images can be added later via the edit
              interface on this page.
            </p>
          </div>
          <div className="flex gap-3 sm:gap-4">
            <button
              type="button"
              onClick={importStaticSample}
              disabled={saving}
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-medium leading-5 text-white shadow-button transition-colors duration-150 hover:bg-brand-hover active:bg-brand-active disabled:pointer-events-none disabled:opacity-50",
                saving && "opacity-70"
              )}
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span className="leading-5">{saving ? "Importing…" : "Import static sample"}</span>
            </button>
            <button
              type="button"
              onClick={flushSeedData}
              disabled={flushing}
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-destructive bg-surface px-6 text-sm font-medium leading-5 text-destructive transition-colors duration-150 hover:bg-destructive/5 active:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50",
                flushing && "opacity-70"
              )}
            >
              {flushing ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
              <span className="leading-5">
                {flushing ? "Flushing…" : "Flush Seed Data"}
              </span>
            </button>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="mt-4 rounded-[16px] border border-line bg-surface p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-ink-secondary">
                Import status
              </span>
              <span className={`ml-auto text-xs ${successCount > 0 ? "text-green-600" : "text-ink-muted"}`}>
                {successCount} saved
              </span>
              {failedCount > 0 && (
                <span className="text-xs text-destructive">{failedCount} failed</span>
              )}
              {pendingCount > 0 && (
                <span className="text-xs text-ink-muted">{pendingCount} pending</span>
              )}
            </div>
            <ul className="divide-y divide-line-subtle max-h-40 overflow-y-auto">
              {rows.map((row) => (
                <li
                  key={row.name}
                  className="flex items-center justify-between gap-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {row.status === "success" && (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    )}
                    {row.status === "failed" && (
                      <XCircle className="h-3 w-3 text-destructive" />
                    )}
                    {row.status === "pending" && (
                      <Loader2 className="h-3 w-3 animate-spin text-ink-muted" />
                    )}
                    <span className="truncate text-sm leading-5 text-ink">
                      {row.name}
                    </span>
                    <span className="text-[10px] leading-none text-ink-subtle">
                      · {row.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {row.status === "failed" && (
                      <button
                        type="button"
                        onClick={() => retryRow(row)}
                        disabled={row.attempts >= MAX_RETRIES}
                        className="flex h-6 w-6 items-center justify-center rounded-xl border border-line bg-surface text-ink-subtle hover:bg-line-subtle disabled:opacity-50"
                        title="Retry"
                      >
                        <RefreshCcw className="h-3 w-3" />
                      </button>
                    )}
                    {row.error && (
                      <span className="text-[10px] leading-none text-destructive truncate max-w-[140px]" title={row.error}>
                        {row.error}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Seed data sections"
        className="mb-5 flex w-max max-w-full gap-1 overflow-x-auto rounded-[12px] border border-line bg-cardfill p-1"
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-2xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              tab === key
                ? "bg-surface text-ink shadow-sm ring-1 ring-line"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "categories" && <SeedCategoriesSection />}
      {tab === "menu-items" && <SeedMenuItemsSection />}
      {tab === "inventory" && <SeedInventorySection />}
    </div>
  );
}
