"use client";
import { useState } from "react";
import { ImagePlus, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, StepActions, StepHeader } from "./ui";
import { obField, obLabel, obTextarea } from "./tokens";
import { RestaurantInfo } from "./types";
import { AutocompleteAddress } from "@/pages/myRestaurant/AutocompleteAddress";
import { PickAddressFromMap } from "@/pages/myRestaurant/PickAddrFromMap";
import { ReverseGeocodeResult, Suggestion } from "@/utils/geocode";

const FEATURES = [
  "Café",
  "Bar",
  "Lounge",
  "Bakery",
  "Fast Food",
  "Catering",
  "Takeaway counter",
  "Outdoor seating",
  "Rooftop",
  "Private dining room",
  "Delivery / cloud kitchen",
  "Drive-through",
  "Live music / entertainment",
  "Coffee & dessert bar",
  "Shisha lounge",
  "Event / party hosting",
];

function ImageDrop({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (dataUrl?: string) => void;
}) {
  const pick = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium leading-5 text-ink-secondary">
        {label}
      </span>
      {value ? (
        <div className="relative overflow-hidden rounded-[16px] border border-line">
          <img src={value} alt="" className="h-28 w-full object-cover" />
          <button
            type="button"
            aria-label={`Remove ${label}`}
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink/60 text-white transition-colors hover:bg-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex h-24 cursor-pointer items-center justify-center gap-2 rounded-[16px] border border-dashed border-line bg-cardfill text-sm text-ink-muted transition-colors hover:border-brand hover:text-brand">
          <ImagePlus className="h-5 w-5" />
          Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </label>
      )}
    </div>
  );
}

export function Step1Restaurant({
  onContinue,
}: {
  onContinue: (data: RestaurantInfo) => void;
}) {
  const [pickAddrFromMap, setPickAddrFromMap] = useState(false);
  const [form, setForm] = useState<RestaurantInfo>({
    name: "",
    description: "",
    features: [],
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    website: "",
    instagram: "",
  });

  const set = <K extends keyof RestaurantInfo>(key: K, value: RestaurantInfo[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /** Apply a resolved location (map confirm / autocomplete select). */
  const applyLocation = (loc: {
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
  }) => {
    setForm((prev) => ({
      ...prev,
      address: (loc.address ?? prev.address) || "",
      city: (loc.city ?? prev.city) || "",
      state: (loc.state ?? prev.state) || "",
      country: (loc.country ?? prev.country) || prev.country,
    }));
  };

  const toggleFeature = (feature: string) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));

  const requiredOk =
    form.name.trim() !== "" &&
    form.phone.trim() !== "" &&
    (form.city.trim() !== "" || form.state.trim() !== "");

  return (
    <>
      <StepHeader
        step="01"
        title="Let's set up your restaurant"
        subtitle="Tell us a little about your restaurant. You can change these details later."
      />

      <div className="space-y-5">
        {/* Name — full width */}
        <Field id="ob-name" label="Restaurant name" required>
          <input
            id="ob-name"
            className={obField}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Rhace Kitchen"
          />
        </Field>

        {/* Description — right after the name */}
        <Field id="ob-desc" label="Short description">
          <textarea
            id="ob-desc"
            className={obTextarea}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A sentence about your restaurant…"
          />
        </Field>

        {/* Additional features — multi-select */}
        <Field
          id="ob-features"
          label="What other features does your restaurant have?"
          hint="Select all that apply. A restaurant can be any combination of these."
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FEATURES.map((feature) => {
              const active = form.features.includes(feature);
              return (
                <button
                  key={feature}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleFeature(feature)}
                  className={cn(
                    "rounded-[10px] border px-3 py-2.5 text-sm leading-5 transition-colors duration-150",
                    active
                      ? "border-brand bg-brand/[0.04] font-medium text-brand ring-1 ring-brand"
                      : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
                  )}
                >
                  {feature}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Phone + email */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="ob-phone" label="Phone number" required>
            <input
              id="ob-phone"
              type="tel"
              className={obField}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+234 800 000 0000"
            />
          </Field>
          <Field id="ob-email" label="Email address">
            <input
              id="ob-email"
              type="email"
              className={obField}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@restaurant.com"
            />
          </Field>
        </div>

        {/* ------- Location & Contact ------- */}
        <div className="rounded-[16px] border border-line bg-cardfill p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium leading-5 text-ink">
                Where is your restaurant?
              </p>
              <p className="mt-0.5 text-xs leading-[17px] text-ink-subtle">
                Add the full address or pick a spot on the map — it helps
                customers find you.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPickAddrFromMap((prev) => !prev)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150",
                pickAddrFromMap
                  ? "border-brand bg-brand/[0.06] text-brand"
                  : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
              )}
            >
              {pickAddrFromMap ? (
                <>
                  <X className="h-4 w-4" />
                  Close Map View
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Choose On Map
                </>
              )}
            </button>
          </div>

          {/* Map chooser (reuses profile-page picker) */}
          {pickAddrFromMap && (
            <div className="mb-5 overflow-hidden rounded-[16px] border border-line bg-surface">
              <PickAddressFromMap
                onConfirm={(data: ReverseGeocodeResult) => {
                  applyLocation({
                    address: data.fullAddress,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                  });
                  setPickAddrFromMap(false);
                }}
              />
            </div>
          )}

          {/* Full address with autocomplete */}
          <div className="space-y-1">
            <span className={obLabel}>Full Address</span>
            <AutocompleteAddress
              value={form.address}
              onChange={(val) => set("address", val)}
              onSelect={(suggestion: Suggestion) => {
                applyLocation({
                  address: suggestion.placeName,
                  city: suggestion.city,
                  state: suggestion.state,
                  country: suggestion.country,
                });
              }}
            />
          </div>

          {/* City / State / Country */}
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field id="ob-city" label="City" required>
              <input
                id="ob-city"
                className={obField}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Lagos"
              />
            </Field>
            <Field id="ob-state" label="State / Province">
              <input
                id="ob-state"
                className={obField}
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                placeholder="e.g. Lagos State"
              />
            </Field>
            <Field id="ob-country" label="Country">
              <input
                id="ob-country"
                className={obField}
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Logo + cover */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ImageDrop
            label="Restaurant logo"
            value={form.logoUrl}
            onChange={(url) => set("logoUrl", url)}
          />
          <ImageDrop
            label="Cover image"
            value={form.coverUrl}
            onChange={(url) => set("coverUrl", url)}
          />
        </div>

        {/* Optional extras */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="ob-website" label="Website">
            <input
              id="ob-website"
              className={obField}
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field id="ob-ig" label="Instagram handle">
            <input
              id="ob-ig"
              className={obField}
              value={form.instagram}
              onChange={(e) => set("instagram", e.target.value)}
              placeholder="@yourrestaurant"
            />
          </Field>
        </div>
      </div>

      <StepActions
        onContinue={() => onContinue(form)}
        continueDisabled={!requiredOk}
      />
    </>
  );
}
