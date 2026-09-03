"use client";
import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, StepActions, StepHeader } from "./ui";
import { obField, obTextarea } from "./tokens";
import { RestaurantInfo } from "./types";

const BUSINESS_TYPES = [
  "Restaurant",
  "Café",
  "Bar",
  "Lounge",
  "Bakery",
  "Fast Food",
  "Catering",
  "Other",
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
  const [form, setForm] = useState<RestaurantInfo>({
    name: "",
    businessType: "",
    phone: "",
    email: "",
    country: "Nigeria",
    stateCity: "",
    address: "",
    website: "",
    instagram: "",
    description: "",
  });

  const set = <K extends keyof RestaurantInfo>(key: K, value: RestaurantInfo[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const requiredOk =
    form.name.trim() !== "" &&
    form.businessType !== "" &&
    form.phone.trim() !== "" &&
    form.stateCity.trim() !== "";

  return (
    <>
      <StepHeader
        step="01"
        title="Let's set up your restaurant"
        subtitle="Tell us a little about your restaurant. You can change these details later."
      />

      <div className="space-y-5">
        {/* Name + type */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="ob-name" label="Restaurant name" required>
            <input
              id="ob-name"
              className={obField}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Rhace Kitchen"
            />
          </Field>
          <Field id="ob-type" label="Business type" required>
            <div className="grid grid-cols-2 gap-2">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={form.businessType === type}
                  onClick={() => set("businessType", type)}
                  className={cn(
                    "rounded-[10px] border px-3 py-2.5 text-sm leading-5 transition-colors duration-150",
                    form.businessType === type
                      ? "border-brand bg-brand/[0.04] font-medium text-brand ring-1 ring-brand"
                      : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </Field>
        </div>

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

        {/* Country + state */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="ob-country" label="Country">
            <input
              id="ob-country"
              className={obField}
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
            />
          </Field>
          <Field id="ob-state" label="State / City" required>
            <input
              id="ob-state"
              className={obField}
              value={form.stateCity}
              onChange={(e) => set("stateCity", e.target.value)}
              placeholder="e.g. Lagos"
            />
          </Field>
        </div>

        {/* Address */}
        <Field id="ob-address" label="Restaurant address">
          <input
            id="ob-address"
            className={obField}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Street, area, city"
          />
        </Field>

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

        <Field id="ob-desc" label="Short description">
          <textarea
            id="ob-desc"
            className={obTextarea}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A sentence about your restaurant…"
          />
        </Field>
      </div>

      <StepActions
        onContinue={() => onContinue(form)}
        continueDisabled={!requiredOk}
      />
    </>
  );
}
