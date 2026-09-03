"use client";
import { useState } from "react";
import {
  ClipboardList,
  FileUp,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, StepActions, StepHeader } from "./ui";
import { obCtaGhost, obField } from "./tokens";
import { MenuData, MenuDraftItem } from "./types";

const MODES = [
  {
    key: "manual" as const,
    icon: ClipboardList,
    title: "Add manually",
    description: "Type in your dishes, drinks and prices one by one.",
  },
  {
    key: "import" as const,
    icon: FileUp,
    title: "Import your menu",
    description: "Upload a PDF, Excel, CSV or image and we'll process it.",
  },
  {
    key: "sample" as const,
    icon: Sparkles,
    title: "Use a sample menu",
    description: "Start with a ready-made menu to explore the platform.",
  },
];

const CATEGORIES = ["Starters", "Mains", "Drinks", "Desserts"];

export function Step2Menu({
  onContinue,
}: {
  onContinue: (data: MenuData) => void;
}) {
  const [mode, setMode] = useState<MenuData["mode"]>("manual");
  const [items, setItems] = useState<MenuDraftItem[]>([]);
  const [draft, setDraft] = useState<MenuDraftItem>({
    name: "",
    category: CATEGORIES[0],
    price: "",
    description: "",
    available: true,
  });

  const addItem = () => {
    if (!draft.name.trim() || !draft.price.trim()) return;
    setItems((prev) => [...prev, { ...draft }]);
    setDraft({
      name: "",
      category: CATEGORIES[0],
      price: "",
      description: "",
      available: true,
    });
  };

  const chosen = MODES.find((m) => m.key === mode);

  return (
    <>
      <StepHeader
        step="02"
        title="Let's add your menu"
        subtitle="Add your dishes, drinks and other items. You can edit everything later."
      />

      {/* Three ways to start */}
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

      {/* Manual builder */}
      {chosen?.key === "manual" && (
        <div className="mt-6 space-y-4 rounded-[16px] border border-line bg-cardfill p-4 sm:p-5">
          <p className="text-sm font-medium text-ink">
            Add a menu item
          </p>
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
                {CATEGORIES.map((c) => (
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

      {/* Import info */}
      {chosen?.key === "import" && (
        <div className="mt-6 rounded-[16px] border border-line bg-cardfill p-6 text-center">
          <FileUp className="mx-auto mb-2 h-8 w-8 text-brand" />
          <p className="text-sm text-ink-muted">
            Upload a <span className="font-medium text-ink">PDF, Excel, CSV or image</span>{" "}
            menu. We'll process it into categories, items, prices and modifiers.
          </p>
          <button
            type="button"
            className={cn(obCtaGhost, "mx-auto mt-4 h-11 w-auto")}
          >
            Upload Menu
          </button>
        </div>
      )}

      {/* Sample info */}
      {chosen?.key === "sample" && (
        <div className="mt-6 rounded-[16px] border border-line bg-cardfill p-6 text-center">
          <Sparkles className="mx-auto mb-2 h-8 w-8 text-brand" />
          <p className="text-sm text-ink-muted">
            We'll load a sample menu so you can explore the platform right
            away. You can replace everything later.
          </p>
        </div>
      )}

      <StepActions
        onContinue={() =>
          onContinue({
            mode,
            items,
          })
        }
        onSecondary={() =>
          onContinue({
            mode: "later",
            items: [],
          })
        }
        secondaryLabel="I'll do this later"
      />
    </>
  );
}
