import { useState } from "react";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeedCategoriesSection } from "./SeedCategoriesSection";
import { SeedInventorySection } from "./SeedInventorySection";
import { SeedMenuItemsSection } from "./SeedMenuItemsSection";

const TABS = [
  { key: "categories", label: "Categories" },
  { key: "menu-items", label: "Menu items" },
  { key: "inventory", label: "Inventory items" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SeedsPage() {
  const [tab, setTab] = useState<TabKey>("categories");

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 md:px-8 lg:px-12">
      <header className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-cardfill text-brand">
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
              "rounded-[8px] px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
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
