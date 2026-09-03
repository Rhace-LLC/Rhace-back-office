"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, NumberStepper, StepActions, StepHeader } from "./ui";
import { obChip, obChipActive, obChipIdle, obField } from "./tokens";
import { FloorData } from "./types";

const DEFAULT_AREAS = [
  "Main Dining",
  "Outdoor / Patio",
  "Upstairs",
  "Mezzanine",
  "Private Dining Room",
  "VIP Lounge",
  "Bar & Lounge",
  "Chef's Table",
  "Counter Seating",
  "Rooftop"
];
const METHODS = ["Dine-in", "Takeaway", "Online ordering", "Delivery", "Reservations"];

export function Step3Tables({
  onContinue,
}: {
  onContinue: (data: FloorData) => void;
}) {
  const [tableCount, setTableCount] = useState(8);
  const [areas, setAreas] = useState<string[]>([]);
  const [methods, setMethods] = useState<string[]>(["Dine-in"]);
  const [newArea, setNewArea] = useState("");

  const toggleArea = (area: string) =>
    setAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );

  const addArea = () => {
    const val = newArea.trim();
    if (!val || areas.includes(val)) return;
    setAreas((prev) => [...prev, val]);
    setNewArea("");
  };

  const toggleMethod = (method: string) =>
    setMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );

  return (
    <>
      <StepHeader
        step="03"
        title="Set up your restaurant"
        subtitle="Tell us how your dining space works so we can configure your tables and ordering experience."
      />

      {/* Table count */}
      <Field id="ob-tables" label="How many tables do you have?" required>
        <div className="flex items-center justify-between rounded-[16px] border border-line bg-cardfill px-5 py-4">
          <NumberStepper value={tableCount} onChange={setTableCount} min={0} />
          <span className="text-sm leading-5 text-ink-muted">
            tables in total
          </span>
        </div>
      </Field>

      {/* Areas */}
      <div className="mt-6">
        <span className="mb-1.5 block text-sm font-medium leading-5 text-ink-secondary">
          How are your tables organized?
        </span>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              aria-pressed={areas.includes(area)}
              onClick={() => toggleArea(area)}
              className={cn(
                obChip,
                areas.includes(area) ? obChipActive : obChipIdle
              )}
            >
              {area}
            </button>
          ))}
        </div>

        <div className="mt-3 flex max-w-sm items-center gap-2">
          <input
            className={obField}
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            placeholder="Add a custom area"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addArea();
              }
            }}
          />
          <button
            type="button"
            aria-label="Add area"
            onClick={addArea}
            disabled={!newArea.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] border border-line bg-surface text-ink transition-colors hover:border-line-strong hover:bg-cardfill disabled:pointer-events-none disabled:opacity-40"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {areas.filter((a) => !DEFAULT_AREAS.includes(a)).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {areas
              .filter((a) => !DEFAULT_AREAS.includes(a))
              .map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-brand bg-cardfill px-3 py-2 text-sm text-brand"
                >
                  {area}
                  <button
                    type="button"
                    aria-label={`Remove ${area}`}
                    onClick={() => toggleArea(area)}
                    className="text-brand transition-opacity hover:opacity-70"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Ordering methods */}
      <div className="mt-6">
        <span className="mb-1.5 block text-sm font-medium leading-5 text-ink-secondary">
          How do customers order?
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {METHODS.map((method) => {
            const active = methods.includes(method);
            return (
              <button
                key={method}
                type="button"
                aria-pressed={active}
                onClick={() => toggleMethod(method)}
                className={cn(
                  "flex items-center justify-between rounded-[16px] border p-4 text-left transition-colors duration-150",
                  active
                    ? "border-brand bg-brand/[0.04] ring-1 ring-brand"
                    : "border-line bg-surface hover:border-line-strong"
                )}
              >
                <span className="text-sm leading-5 font-medium text-ink">
                  {method}
                </span>
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-[6px] border transition-colors",
                    active ? "border-brand bg-brand" : "border-line-strong bg-surface"
                  )}
                >
                  {active && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none">
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
              </button>
            );
          })}
        </div>
      </div>

      <StepActions
        onContinue={() => onContinue({ tableCount, areas, methods })}
        continueDisabled={methods.length === 0}
      />
    </>
  );
}
