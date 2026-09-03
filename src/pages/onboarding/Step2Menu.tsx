"use client";
import { useMemo, useState } from "react";
import {
  ClipboardList,
  FileUp,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, StepActions, StepHeader } from "./ui";
import { obField } from "./tokens";
import { MenuData, MenuDraftItem } from "./types";
import { MENU_CATEGORIES, SAMPLE_MENU } from "./data_/menu-data";

const MODES = [
  {
    key: "sample" as const,
    icon: Sparkles,
    title: "Use a sample menu",
    description: "Pick your dishes and we'll set up the matching categories.",
  },
  {
    key: "manual" as const,
    icon: ClipboardList,
    title: "Add manually",
    description: "Type in your dishes, drinks and prices one by one.",
  },
  {
    key: "import" as const,
    icon: FileUp,
    title: "Bulk upload",
    description: "Upload a PDF, Excel, CSV or image and we'll process it.",
  },
];

const CATEGORY_LABELS = MENU_CATEGORIES.map((c) => c.label);
const CATEGORY_ORDER = new Map(CATEGORY_LABELS.map((label, i) => [label, i]));

export function Step2Menu({
  onContinue,
}: {
  onContinue: (data: MenuData) => void;
}) {
  const [mode, setMode] = useState<MenuData["mode"]>("sample");
  const [chosen, setChosen] = useState<string[]>([]);

  // Manual flow
  const [items, setItems] = useState<MenuDraftItem[]>([]);
  const [draft, setDraft] = useState<MenuDraftItem>({
    name: "",
    category: CATEGORY_LABELS[0],
    price: "",
    description: "",
    available: true,
  });

  /** Categories derived from whichever dishes were picked. */
  const categories = useMemo(() => {
    const set = new Set<string>();
    chosen.forEach((name) => {
      const dish = SAMPLE_MENU.find((d) => d.name === name);
      if (dish) set.add(dish.category);
    });
    return [...set];
  }, [chosen]);

  /** Sample dishes grouped by category, in menu-category order. */
  const grouped = useMemo(() => {
    const groups = new Map<string, (typeof SAMPLE_MENU)[number][]>();
    SAMPLE_MENU.forEach((dish) => {
      const list = groups.get(dish.category) ?? [];
      list.push(dish);
      groups.set(dish.category, list);
    });
    return [...groups.entries()].sort((a, b) => {
      const ia = CATEGORY_ORDER.get(a[0]) ?? Number.MAX_SAFE_INTEGER;
      const ib = CATEGORY_ORDER.get(b[0]) ?? Number.MAX_SAFE_INTEGER;
      return ia - ib;
    });
  }, []);

  const toggleDish = (name: string) =>
    setChosen((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );

  const addItem = () => {
    if (!draft.name.trim() || !draft.price.trim()) return;
    setItems((prev) => [...prev, { ...draft }]);
    setDraft({
      name: "",
      category: CATEGORY_LABELS[0],
      price: "",
      description: "",
      available: true,
    });
  };

  const selectedDrafts = useMemo(
    () =>
      chosen
        .map((name) => SAMPLE_MENU.find((d) => d.name === name))
        .filter((d): d is (typeof SAMPLE_MENU)[number] => Boolean(d))
        .map((d) => ({
          name: d.name,
          category: d.category,
          price: String(d.price),
          description: d.description,
          available: d.available ?? true,
        })),
    [chosen]
  );

  const handlePrimary = () => {
    if (mode === "sample") {
      onContinue({ mode: "sample", categories, items: selectedDrafts });
      return;
    }
    if (mode === "manual") {
      onContinue({ mode: "manual", categories, items });
      return;
    }
    onContinue({ mode: "import", categories: [], items: [] });
  };

  const handleLater = () =>
    onContinue({ mode: "later", categories: [], items: [] });

  return (
    <>
      <StepHeader
        step="02"
        title="Let's add your menu"
        subtitle="Add your dishes, drinks and other items. You can edit everything later."
      />

      {/* Three ways to start — sample first */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MODES.map(({ key, icon: Icon, title, description }) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
            className={cn(
              "flex flex-col items-start gap-3 rounded-[16px] border p-4 text-left transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none",
              mode === key
                ? "border-brand bg-brand/[0.04] ring-1 ring-brand"
                : "border-line bg-surface hover:border-line-strong"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-[10px] transition-colors",
                mode === key ? "bg-brand text-white" : "bg-cardfill text-ink-muted"
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm leading-5 font-medium text-ink">
                {title}
              </span>
              <span className="mt-0.5 block text-sm leading-5 text-ink-muted">
                {description}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* ---------- SAMPLE FLOW: pick dishes, categories auto-follow ---------- */}
      {mode === "sample" && (
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <p className="text-sm font-medium leading-5 text-ink-secondary">
              Select the dishes you'd like on your menu
            </p>
            <span className="shrink-0 rounded-[8px] bg-cardfill px-2.5 py-1 text-xs font-medium text-ink-secondary ring-1 ring-line">
              {chosen.length} selected
            </span>
          </div>
          <p className="mb-4 text-xs leading-[17px] text-ink-subtle">
            We'll add each dish's category to your menu automatically. Pick the
            ones you serve — you can edit everything later.
          </p>

          {/* Derived categories preview */}
          {categories.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-brand bg-cardfill px-3 py-1.5 text-sm text-brand"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* All dishes, grouped by category */}
          <div className="space-y-5">
            {grouped.map(([category, dishes]) => (
              <div key={category}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-[6px] bg-cardfill px-2 py-0.5 text-[11px] leading-[15px] font-medium tracking-wide text-ink-secondary uppercase">
                    {category}
                  </span>
                  <span className="h-px flex-1 bg-line-subtle" />
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {dishes.map((dish) => {
                    const active = chosen.includes(dish.name);
                    return (
                      <button
                        key={dish.name}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleDish(dish.name)}
                        className={cn(
                          "flex items-start gap-3 rounded-[16px] border p-3.5 text-left transition-colors duration-150",
                          active
                            ? "border-brand bg-brand/[0.04] ring-1 ring-brand"
                            : "border-line bg-surface hover:border-line-strong"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors",
                            active
                              ? "border-brand bg-brand"
                              : "border-line-strong bg-surface"
                          )}
                        >
                          {active && (
                            <svg
                              viewBox="0 0 12 12"
                              className="h-3 w-3 text-white"
                              fill="none"
                            >
                              <path
                                d="M2.5 6.5 5 9l4.5-6"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="text-sm leading-5 font-medium text-ink">
                              {dish.name}
                            </span>
                            <span className="shrink-0 text-sm leading-5 font-medium text-ink-secondary">
                              ₦{dish.price.toLocaleString()}
                            </span>
                          </span>
                          {dish.description && (
                            <span className="mt-0.5 block text-sm leading-5 text-ink-muted">
                              {dish.description}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- MANUAL FLOW ---------- */}
      {mode === "manual" && (
        <div className="mt-6 space-y-4 rounded-[16px] border border-line bg-cardfill p-4 sm:p-5">
          <p className="text-sm font-medium text-ink">Add a menu item</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="ob-item-name" label="Item name">
              <input
                id="ob-item-name"
                className={`${obField} bg-surface`}
                value={draft.name}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Jollof Rice & Chicken"
              />
            </Field>
            <Field id="ob-item-cat" label="Category">
              <select
                id="ob-item-cat"
                className={`${obField} bg-surface`}
                value={draft.category}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, category: e.target.value }))
                }
              >
                {CATEGORY_LABELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="ob-item-price" label="Price">
              <input
                id="ob-item-price"
                className={`${obField} bg-surface`}
                value={draft.price}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, price: e.target.value }))
                }
                placeholder="₦ 0.00"
                inputMode="decimal"
              />
            </Field>
            <Field id="ob-item-desc" label="Description (optional)">
              <input
                id="ob-item-desc"
                className={`${obField} bg-surface`}
                value={draft.description ?? ""}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="A short description"
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={addItem}
            disabled={!draft.name.trim() || !draft.price.trim()}
            className="inline-flex items-center gap-2 rounded-[10px] bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-secondary disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Menu Item
          </button>

          {items.length > 0 && (
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-line bg-surface px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {item.name}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {item.category} · ₦{item.price}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() =>
                      setItems((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-subtle transition-colors hover:bg-line-subtle hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ---------- BULK UPLOAD (placeholder until backend) ---------- */}
      {mode === "import" && (
        <div className="mt-6 rounded-[16px] border border-line bg-cardfill p-6 text-center">
          <FileUp className="mx-auto mb-2 h-8 w-8 text-brand" />
          <p className="text-sm text-ink-muted">
            Upload a{" "}
            <span className="font-medium text-ink">PDF, Excel, CSV or image</span>{" "}
            menu. We'll process it into categories, items, prices and modifiers.
          </p>
          <button
            type="button"
            className="mx-auto mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-cardfill"
          >
            <FileUp className="h-4 w-4" />
            Upload Menu
          </button>
        </div>
      )}

      <StepActions
        onContinue={handlePrimary}
        continueDisabled={mode === "sample" ? chosen.length === 0 : false}
        onSecondary={handleLater}
        secondaryLabel="I'll do this later"
      />
    </>
  );
}
