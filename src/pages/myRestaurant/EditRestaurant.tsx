import { useState, ChangeEvent, memo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Calendar, Clock, Map } from "lucide-react"; // Added useful icons
import {
  OpeningHour,
  RestaurantProfile,
} from "@/api-services/restaurantProfile";
import { PickAddressFromMap } from "./PickAddrFromMap";
import { cn } from "@/lib/utils";
import { ReverseGeocodeResult } from "@/utils/geocode";
//import { PickAddressFromMap } from "./PickAddrFromMap";

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

    // Clean up previous blob URL if it exists (good practice)
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
      // Remove tag
      updateField(
        "tags",
        tags.filter((t) => t !== normalizedTag)
      );
    } else {
      // Add tag, ensuring max length/count might be useful here in a real app
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

  // Memoized FormField to prevent losing focus
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
        <label className="text-sm font-semibold tracking-wide text-gray-800">
          {label}
        </label>
        {description && (
          <p className="mb-2 text-xs text-gray-500">{description}</p>
        )}
        {children}
      </div>
    )
  );
  // --------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
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
      <section className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-lg md:p-8">
        <h3 className="text-xl font-bold text-gray-800">Basic Details</h3>
        <p className="text-sm text-gray-500">
          Provide the fundamental information about your restaurant.
        </p>

        {/* Restaurant Name */}
        <div className="space-y-1">
          <label className="text-sm font-semibold tracking-wide text-gray-800">
            Restaurant Name
          </label>
          <Input
            className="h-11 border-gray-300 transition-colors duration-150 focus:border-indigo-500 focus:ring-indigo-500"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        {/* Slogan */}
        <div className="space-y-1">
          <label className="text-sm font-semibold tracking-wide text-gray-800">
            Slogan
          </label>
          <p className="mb-2 text-xs text-gray-500">
            A short, catchy phrase for marketing.
          </p>
          <Input
            className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={form.slogan ?? ""}
            onChange={(e) => updateField("slogan", e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-semibold tracking-wide text-gray-800">
            Description
          </label>
          <p className="mb-2 text-xs text-gray-500">
            A detailed overview of your restaurant, cuisine, and atmosphere.
          </p>
          <Textarea
            className="h-[120px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={form.description ?? ""}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
      </section>

      {/* --- SECTION: LOCATION & CONTACT --- */}
      <section className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-lg md:p-8">
        {/* --- SECTION: LOCATION & CONTACT --- */}
        <section className="space-y-8 border-t border-gray-50 pt-10">
          {/* HEADER: CLEAN HIERARCHY */}
          <div className="flex justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-[22px] font-bold tracking-tight text-gray-900">
                Location & Contact
              </h3>
              <p className="max-w-md text-[14px] leading-relaxed font-medium text-gray-400">
                Define your physical presence so customers can navigate to you
                effortlessly.
              </p>
            </div>

            {/* MINIMALIST MODE SWITCHER */}
            <button
              type="button"
              onClick={() => setPickAddrFromMap((prev) => !prev)}
              className={cn(
                "group flex items-center gap-2 rounded-full px-5 transition-all duration-500 ease-out active:scale-95",
                pickAddrFromMap
                  ? "bg-black text-white shadow-xl shadow-black/10"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
              )}
            >
              {/* ICON BOX: Transitions color and rotation */}
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full transition-all duration-500",
                  pickAddrFromMap
                    ? "rotate-0 bg-white/20"
                    : "-rotate-90 bg-gray-200"
                )}
              >
                {pickAddrFromMap ? (
                  <X size={12} strokeWidth={3} />
                ) : (
                  <Map size={12} strokeWidth={3} />
                )}
              </div>

              {/* TEXT LABEL: Changes based on state */}
              <span className="text-[13px] font-bold tracking-tight">
                {pickAddrFromMap ? "Close Map View" : "Choose On Map"}
              </span>

              {/* STATUS DOT: Only visible when map is inactive to prompt action */}
              {!pickAddrFromMap && (
                <div className="relative ml-1 flex h-2 w-2">
                  <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <div className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </div>
              )}
            </button>
          </div>

          {/* CONTENT AREA: OVERFLOW CONTROL */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-50/50 ring-1 ring-gray-100">
            {pickAddrFromMap && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <PickAddressFromMap
                  onConfirm={(data: ReverseGeocodeResult) => {
                    updateField("address", data.fullAddress);
                    updateField("city", data.city);
                    updateField("state", data.state);
                    updateField("country", data.country);
                  }}
                />
              </div>
            )}
          </div>
        </section>

        <div className="space-y-1">
          <label className="text-sm font-semibold tracking-wide text-gray-800">
            Full Address
          </label>
          <Input
            className="h-11"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Street address, building name, etc."
          />
        </div>

        {/* City / State / Country */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-semibold tracking-wide text-gray-800">
              City
            </label>
            <Input
              className="h-11"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold tracking-wide text-gray-800">
              State/Province
            </label>
            <Input
              className="h-11"
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold tracking-wide text-gray-800">
              Country
            </label>
            <Input
              className="h-11"
              value={form.country}
              onChange={(e) => updateField("country", e.target.value)}
            />
          </div>
        </div>

        {/* Email / Phone */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold tracking-wide text-gray-800">
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
            <label className="text-sm font-semibold tracking-wide text-gray-800">
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
      <section className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-lg md:p-8">
        <h3 className="text-xl font-bold text-gray-800">Branding & Media</h3>
        <p className="text-sm text-gray-500">
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
                className="h-24 w-24 flex-shrink-0 rounded-xl border-4 border-white object-cover shadow-md"
              />
            )}
            <Input
              type="file"
              accept="image/*"
              className="h-12 cursor-pointer p-2 file:rounded-md file:border-0 file:bg-gray-100 file:text-sm file:font-medium"
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
                className="h-48 w-full rounded-xl border object-cover shadow-md"
              />
            )}
            <Input
              type="file"
              accept="image/*"
              className="h-12 cursor-pointer p-2 file:rounded-md file:border-0 file:bg-gray-100 file:text-sm file:font-medium"
              onChange={(e) => handleImageUpload(e, "cover")}
            />
          </div>
        </FormField>
      </section>

      {/* --- SECTION: TAGS --- */}
      <section className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-lg md:p-8">
        <h3 className="text-xl font-bold text-gray-800">Tags & Categories</h3>
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

        {/* Display Tags - Modernized Style */}
        <div className="flex flex-wrap gap-2 pt-2">
          {(form.tags ?? []).map((tag: string) => (
            <div
              key={tag}
              // Enhanced pill styling with indigo theme and transition
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
      <section className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-lg md:p-8">
        <h3 className="text-xl font-bold text-gray-800">Operating Hours</h3>
        <p className="text-sm text-gray-500">
          <Calendar size={16} className="mr-2 inline-block text-gray-500" />
          Select the days your restaurant is open, then specify the operating
          times for each.
        </p>

        {/* Capsule Day Selector - Modernized Blue */}
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
                    // Remove the day
                    updated = updated.filter((h) => h.day !== day);
                  } else {
                    // Add the day with blank fields, preserving order (important for display

                    if (!isActive) {
                      updated.push({
                        day,
                        open_time: "07:00",
                        close_time: "20:00",
                      });
                    }
                    // Sort updated array by DAYS index to keep them in order
                    updated.sort(
                      (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)
                    );
                  }

                  updateField("opening_hours", updated);
                }}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition duration-200 ${
                  isActive
                    ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                } `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Render inputs ONLY for active (selected) days */}
        <div className="space-y-4 pt-4">
          {(form.opening_hours ?? []).map((hour, idx) => (
            <div
              key={hour.day}
              className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-inner md:flex-row"
            >
              <p className="w-full flex-shrink-0 self-center font-semibold text-gray-800 md:w-1/4">
                {hour.day}
              </p>

              <div className="flex-1 space-y-2 md:flex md:gap-4 md:space-y-0">
                <div className="relative flex-1">
                  <Clock
                    size={16}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    className="h-11 bg-white pl-10"
                    placeholder="Open Time (e.g. 09:00)"
                    value={hour.open_time}
                    onChange={(e) =>
                      updateOpeningHour(idx, "open_time", e.target.value)
                    }
                    type="time" // Use HTML5 time input for better mobile experience
                  />
                </div>

                <div className="relative flex-1">
                  <Clock
                    size={16}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    className="h-11 bg-white pl-10"
                    placeholder="Close Time (e.g. 22:00)"
                    value={hour.close_time}
                    onChange={(e) =>
                      updateOpeningHour(idx, "close_time", e.target.value)
                    }
                    type="time" // Use HTML5 time input
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
          className="h-12 w-full rounded-lg bg-indigo-600 text-base font-semibold shadow-lg transition duration-200 hover:bg-indigo-700"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>

      <div className="py-[50px]" />
    </div>
  );
}
