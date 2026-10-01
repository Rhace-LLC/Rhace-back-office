import { useState, ChangeEvent, memo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Calendar, Clock, Map, Pipette } from "lucide-react";
import {
  OpeningHour,
  RestaurantProfile,
} from "@/api-services/restaurantProfile";
import { MapPicker } from "@/components/map/MapPicker";
import { cn } from "@/lib/utils";
import { Suggestion } from "@/utils/geocode";
import type { MapLocation } from "@/components/map/types";
import { AutocompleteAddress } from "./AutocompleteAddress";

interface Props {
  profile: RestaurantProfile;
  onEdit: (val: boolean) => void;
  onSave: (data: RestaurantProfile) => void;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Moving this OUTSIDE the main component block stops it from re-creating 
// on every state change and breaking the HTML5 color picker window focus.
const FormField = memo(
  ({
    label,
    children,
    description,
  }: {
    label: string;
    children: React.ReactNode;
    description?: string;
  }) => (
    <div className="space-y-1">
      <label className="text-sm font-semibold tracking-wide text-ink">
        {label}
      </label>
      {description && (
        <p className="mb-2 text-xs text-ink-muted">{description}</p>
      )}
      {children}
    </div>
  )
);
FormField.displayName = "FormField";

export default function EditRestaurantProfile({
  profile,
  onEdit,
  onSave,
}: Props) {
  const [pickAddrFromMap, setPickAddrFromMap] = useState(false);
  const [form, setForm] = useState<RestaurantProfile>(profile);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    profile.logo_url
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(
    profile.cover_image_url
  );

  /** Update text fields */
  const updateField = (key: keyof RestaurantProfile, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /** Handle image upload */
  const handleImageUpload = (
    e: ChangeEvent<HTMLInputElement>,
    type: "logo" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "logo" && logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    } else if (
      type === "cover" &&
      coverPreview &&
      coverPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(coverPreview);
    }

    const url = URL.createObjectURL(file);

    if (type === "logo") {
      setLogoPreview(url);
      updateField("logo", file as any);
    } else {
      setCoverPreview(url);
      updateField("cover_image", file as any);
    }
  };

  /** Handle tag update */
  const updateTag = (tag: string) => {
    const tags = form.tags ?? [];
    const normalizedTag = tag.trim().toLowerCase();

    if (tags.includes(normalizedTag)) {
      updateField(
        "tags",
        tags.filter((t) => t !== normalizedTag)
      );
    } else {
      updateField("tags", [...tags, normalizedTag]);
    }
  };

  /** Update opening hours */
  const updateOpeningHour = (
    index: number,
    key: keyof OpeningHour,
    value: string
  ) => {
    const newHours = [...(form.opening_hours ?? [])];
    newHours[index] = { ...newHours[index], [key]: value };
    updateField("opening_hours", newHours);
  };

  /** Save */
  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-3xl font-bold tracking-tight text-ink">
          Edit Restaurant Profile
        </h2>
        <Button
          variant="outline"
          onClick={() => onEdit(false)}
          className="px-6"
        >
          Cancel
        </Button>
      </div>

      {/* --- SECTION: BASIC INFORMATION --- */}
      <section className="space-y-6 rounded-3xl border border-line-subtle bg-surface p-6 shadow-lg md:p-8">
        <h3 className="text-xl font-bold text-ink">Basic Details</h3>
        <p className="text-sm text-ink-muted">
          Provide the fundamental information about your restaurant.
        </p>

        {/* Restaurant Name */}
        <div className="space-y-1">
          <label className="text-sm font-semibold tracking-wide text-ink">
            Restaurant Name
          </label>
          <Input
            className="h-11 border-line transition-colors duration-150 focus:border-brand focus:ring-focus-ring"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        {/* Slogan */}
        <div className="space-y-1">
          <label className="text-sm font-semibold tracking-wide text-ink">
            Slogan
          </label>
          <p className="mb-2 text-xs text-ink-muted">
            A short, catchy phrase for marketing.
          </p>
          <Input
            className="h-11 border-line focus:border-brand focus:ring-focus-ring"
            value={form.slogan ?? ""}
            onChange={(e) => updateField("slogan", e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-semibold tracking-wide text-ink">
            Description
          </label>
          <p className="mb-2 text-xs text-ink-muted">
            A detailed overview of your restaurant, cuisine, and atmosphere.
          </p>
          <Textarea
            className="h-[120px] border-line focus:border-brand focus:ring-focus-ring"
            value={form.description ?? ""}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
      </section>

      {/* --- SECTION: LOCATION & CONTACT --- */}
      <section className="space-y-6 rounded-3xl border border-line-subtle bg-surface p-6 shadow-lg md:p-8">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-[22px] font-bold tracking-tight text-ink">
              Location & Contact
            </h3>
            <p className="max-w-md text-[14px] leading-relaxed font-medium text-ink-subtle">
              Define your physical presence so customers can navigate to you
              effortlessly.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPickAddrFromMap((prev) => !prev)}
            className={cn(
              "group flex items-center gap-2 rounded-full bg-inset px-5 transition-all duration-500 ease-out active:scale-95",
              pickAddrFromMap
                ? "bg-ink text-white shadow-lg"
                : "text-ink-muted hover:bg-inset-accent hover:text-ink"
            )}
          >
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full transition-all duration-500",
                pickAddrFromMap
                  ? "rotate-0 bg-surface text-ink"
                  : "-rotate-90 bg-surface text-ink-muted"
              )}
            >
              {pickAddrFromMap ? (
                <X size={12} strokeWidth={3} />
              ) : (
                <Map size={12} strokeWidth={3} />
              )}
            </div>

            <span className="text-[13px] font-bold tracking-tight">
              {pickAddrFromMap ? "Close Map View" : "Choose On Map"}
            </span>

            {!pickAddrFromMap && (
              <div className="relative ml-1 flex h-2 w-2">
                <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <div className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </div>
            )}
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] bg-inset/50 ring-1 ring-gray-100">
          {pickAddrFromMap && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <MapPicker
                onConfirm={(data: MapLocation) => {
                  updateField("address", data.fullAddress);
                  updateField("city", data.city);
                  updateField("state", data.state);
                  updateField("country", data.country);
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold tracking-wide text-ink">
            Full Address
          </label>
          <AutocompleteAddress
            value={form.address}
            onChange={(val) => updateField("address", val)}
            onSelect={(suggestion: Suggestion) => {
              updateField("address", suggestion.placeName);
              updateField("city", suggestion.city ?? "");
              updateField("state", suggestion.state ?? "");
              updateField("country", suggestion.country ?? "");
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-semibold tracking-wide text-ink">
              City
            </label>
            <Input
              className="h-11"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold tracking-wide text-ink">
              State/Province
            </label>
            <Input
              className="h-11"
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold tracking-wide text-ink">
              Country
            </label>
            <Input
              className="h-11"
              value={form.country}
              onChange={(e) => updateField("country", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold tracking-wide text-ink">
              Email Address
            </label>
            <Input
              className="h-11"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              type="email"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold tracking-wide text-ink">
              Phone Number
            </label>
            <Input
              className="h-11"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              type="tel"
            />
          </div>
        </div>
      </section>

      {/* --- SECTION: BRANDING & MEDIA --- */}
      <section className="space-y-6 rounded-3xl border border-line-subtle bg-surface p-6 shadow-lg md:p-8">
        <h3 className="text-xl font-bold text-ink">Branding & Media</h3>
        <p className="text-sm text-ink-muted">
          Upload high-quality images to attract visitors.
        </p>

        {/* LOGO UPLOAD */}
        <FormField
          label="Restaurant Logo"
          description="Recommended: Square aspect ratio, minimum 256x256 pixels."
        >
          <div className="flex items-center gap-4">
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="h-24 w-24 flex-shrink-0 rounded-3xl border-4 border-white object-cover shadow-md"
              />
            )}
            <Input
              type="file"
              accept="image/*"
              className="h-12 cursor-pointer p-2 file:rounded-2xl file:border-0 file:bg-inset file:text-sm file:font-medium"
              onChange={(e) => handleImageUpload(e, "logo")}
            />
          </div>
        </FormField>

        {/* COVER UPLOAD */}
        <FormField
          label="Cover Image"
          description="Recommended: Wide aspect ratio (16:9), minimum 1280x720 pixels."
        >
          <div className="space-y-3">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover Preview"
                className="h-48 w-full rounded-3xl border object-cover shadow-md"
              />
            )}
            <Input
              type="file"
              accept="image/*"
              className="h-12 cursor-pointer p-2 file:rounded-2xl file:border-0 file:bg-inset file:text-sm file:font-medium"
              onChange={(e) => handleImageUpload(e, "cover")}
            />
          </div>
        </FormField>

        {/* BRAND COLOR */}
        <FormField
          label="Brand Color"
          description="Choose a primary color for your restaurant branding."
        >
          <div className="flex flex-col gap-3">
            {/* Swatch container - condensed to h-6 w-6 loops */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                "#000000",
                "#ffffff",
                "#2A66FF",
                "#f59e0b",
                "#ef4444",
                "#10b981",
                "#8b5cf6",
                "#ec4899",
                "#14b8a6",
                "#f97316",
              ].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateField("brand_color", color)}
                  className={`h-6 w-6 rounded-full border shadow-sm transition-all hover:scale-110 ${
                    form.brand_color === color
                      ? "border-ink ring-2 ring-ink ring-offset-1"
                      : "border-line"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}

              {/* Minimalist Color Picker Trigger Wrapper */}
              <label className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-dashed border-line bg-inset text-xs text-ink-muted hover:border-line-strong hover:bg-inset">
                <input
                  type="color"
                  value={form.brand_color || "#2A66FF"}
                  onChange={(e) => updateField("brand_color", e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <Pipette size={12} />
              </label>
            </div>

            {/* Selected Value Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-subtle">Selected Color:</span>
              <span
                className="inline-block h-5 w-5 rounded-full border border-line"
                style={{ backgroundColor: form.brand_color || "#2A66FF" }}
              />
              <span className="font-mono text-xs font-semibold text-ink-secondary uppercase tracking-wider bg-inset border border-line px-2 py-0.5 rounded-2xl">
                {form.brand_color || "#2A66FF"}
              </span>
            </div>
          </div>
        </FormField>
      </section>

      {/* --- SECTION: TAGS --- */}
      <section className="space-y-6 rounded-3xl border border-line-subtle bg-surface p-6 shadow-lg md:p-8">
        <h3 className="text-xl font-bold text-ink">Tags & Categories</h3>
        <FormField
          label="Tags"
          description="Enter keywords (e.g., cuisine, dietary, style) that describe your restaurant. Press Enter to add."
        >
          <Input
            className="h-11"
            placeholder="Type a tag and press Enter..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                updateTag(e.currentTarget.value.trim());
                e.currentTarget.value = "";
              }
            }}
          />
        </FormField>

        <div className="flex flex-wrap gap-2 pt-2">
          {(form.tags ?? []).map((tag: string) => (
            <div
              key={tag}
              className="flex cursor-default items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 transition duration-200 hover:bg-indigo-100"
            >
              <span>{tag}</span>
              <X
                size={12}
                className="cursor-pointer text-indigo-500 transition hover:text-indigo-700"
                onClick={() => updateTag(tag)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* --- SECTION: OPENING HOURS --- */}
      <section className="space-y-6 rounded-3xl border border-line-subtle bg-surface p-6 shadow-lg md:p-8">
        <h3 className="text-xl font-bold text-ink">Operating Hours</h3>
        <p className="text-sm text-ink-muted">
          <Calendar size={16} className="mr-2 inline-block text-ink-muted" />
          Select the days your restaurant is open, then specify the operating
          times for each.
        </p>

        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const isActive = form.opening_hours?.some((h) => h.day === day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  let updated = [...(form.opening_hours ?? [])];

                  if (isActive) {
                    updated = updated.filter((h) => h.day !== day);
                  } else {
                    if (!isActive) {
                      updated.push({
                        day,
                        open_time: "07:00",
                        close_time: "20:00",
                      });
                    }
                    updated.sort(
                      (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)
                    );
                  }

                  updateField("opening_hours", updated);
                }}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition duration-200 ${
                  isActive
                    ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border-line bg-inset text-ink-secondary hover:bg-inset-accent"
                } `}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="space-y-4 pt-4">
          {(form.opening_hours ?? []).map((hour, idx) => (
            <div
              key={hour.day}
              className="flex flex-col gap-4 rounded-2xl border border-line bg-inset p-4 shadow-inner md:flex-row"
            >
              <p className="w-full flex-shrink-0 self-center font-semibold text-ink md:w-1/4">
                {hour.day}
              </p>

              <div className="flex-1 space-y-2 md:flex md:gap-4 md:space-y-0">
                <div className="relative flex-1">
                  <Clock
                    size={16}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-subtle"
                  />
                  <Input
                    className="h-11 bg-surface pl-10"
                    placeholder="Open Time (e.g. 09:00)"
                    value={hour.open_time}
                    onChange={(e) =>
                      updateOpeningHour(idx, "open_time", e.target.value)
                    }
                    type="time"
                  />
                </div>

                <div className="relative flex-1">
                  <Clock
                    size={16}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-subtle"
                  />
                  <Input
                    className="h-11 bg-surface pl-10"
                    placeholder="Close Time (e.g. 22:00)"
                    value={hour.close_time}
                    onChange={(e) =>
                      updateOpeningHour(idx, "close_time", e.target.value)
                    }
                    type="time"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SAVE BUTTON */}
      <div className="border-t pt-6">
        <Button
          className="h-12 w-full rounded-2xl bg-indigo-600 text-base font-semibold shadow-lg transition duration-200 hover:bg-indigo-700"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>

      <div className="py-[50px]" />
    </div>
  );
}