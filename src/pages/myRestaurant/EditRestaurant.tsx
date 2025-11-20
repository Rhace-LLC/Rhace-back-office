import { useState, ChangeEvent, memo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Calendar, Clock } from "lucide-react"; // Added useful icons
import { OpeningHour, RestaurantProfile } from "@/api-services/restaurantProfile";

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
    if (type === "logo" && logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    } else if (type === "cover" && coverPreview && coverPreview.startsWith('blob:')) {
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
      <label className="text-sm font-semibold text-gray-800 tracking-wide">{label}</label>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      {children}
    </div>
  )
);
  // --------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Edit Restaurant Profile
        </h2>
        <Button variant="outline" onClick={() => onEdit(false)} className="px-6">
          Cancel
        </Button>
      </div>


{/* --- SECTION: BASIC INFORMATION --- */}
<section className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
  <h3 className="text-xl font-bold text-gray-800">Basic Details</h3>
  <p className="text-sm text-gray-500">Provide the fundamental information about your restaurant.</p>

  {/* Restaurant Name */}
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-800 tracking-wide">Restaurant Name</label>
    <Input
      className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-150"
      value={form.name}
      onChange={(e) => updateField("name", e.target.value)}
    />
  </div>

  {/* Slogan */}
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-800 tracking-wide">Slogan</label>
    <p className="text-xs text-gray-500 mb-2">A short, catchy phrase for marketing.</p>
    <Input
      className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
      value={form.slogan ?? ""}
      onChange={(e) => updateField("slogan", e.target.value)}
    />
  </div>

  {/* Description */}
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-800 tracking-wide">Description</label>
    <p className="text-xs text-gray-500 mb-2">A detailed overview of your restaurant, cuisine, and atmosphere.</p>
    <Textarea
      className="h-[120px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
      value={form.description ?? ""}
      onChange={(e) => updateField("description", e.target.value)}
    />
  </div>
</section>

{/* --- SECTION: LOCATION & CONTACT --- */}
<section className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
  <h3 className="text-xl font-bold text-gray-800">Location & Contact</h3>
  <p className="text-sm text-gray-500">Ensure your customers can easily find and reach you.</p>

  {/* Full Address */}
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-800 tracking-wide">Full Address</label>
    <Input
      className="h-11"
      value={form.address}
      onChange={(e) => updateField("address", e.target.value)}
      placeholder="Street address, building name, etc."
    />
  </div>

  {/* City / State / Country */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="space-y-1">
      <label className="text-sm font-semibold text-gray-800 tracking-wide">City</label>
      <Input
        className="h-11"
        value={form.city}
        onChange={(e) => updateField("city", e.target.value)}
      />
    </div>
    <div className="space-y-1">
      <label className="text-sm font-semibold text-gray-800 tracking-wide">State/Province</label>
      <Input
        className="h-11"
        value={form.state}
        onChange={(e) => updateField("state", e.target.value)}
      />
    </div>
    <div className="space-y-1">
      <label className="text-sm font-semibold text-gray-800 tracking-wide">Country</label>
      <Input
        className="h-11"
        value={form.country}
        onChange={(e) => updateField("country", e.target.value)}
      />
    </div>
  </div>

  {/* Email / Phone */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-1">
      <label className="text-sm font-semibold text-gray-800 tracking-wide">Email Address</label>
      <Input
        className="h-11"
        value={form.email}
        onChange={(e) => updateField("email", e.target.value)}
        type="email"
      />
    </div>
    <div className="space-y-1">
      <label className="text-sm font-semibold text-gray-800 tracking-wide">Phone Number</label>
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
      <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
        <h3 className="text-xl font-bold text-gray-800">Branding & Media</h3>
        <p className="text-sm text-gray-500">Upload high-quality images to attract visitors.</p>

        {/* LOGO UPLOAD */}
        <FormField label="Restaurant Logo" description="Recommended: Square aspect ratio, minimum 256x256 pixels.">
          <div className="flex items-center gap-4">
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="h-24 w-24 rounded-xl border-4 border-white shadow-md object-cover flex-shrink-0"
              />
            )}
            <Input
              type="file"
              accept="image/*"
              className="h-12 cursor-pointer p-2 file:text-sm file:font-medium file:bg-gray-100 file:rounded-md file:border-0"
              onChange={(e) => handleImageUpload(e, "logo")}
            />
          </div>
        </FormField>

        {/* COVER UPLOAD */}
        <FormField label="Cover Image" description="Recommended: Wide aspect ratio (16:9), minimum 1280x720 pixels.">
          <div className="space-y-3">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover Preview"
                className="h-48 w-full rounded-xl border shadow-md object-cover"
              />
            )}
            <Input
              type="file"
              accept="image/*"
              className="h-12 cursor-pointer p-2 file:text-sm file:font-medium file:bg-gray-100 file:rounded-md file:border-0"
              onChange={(e) => handleImageUpload(e, "cover")}
            />
          </div>
        </FormField>
      </section>

      {/* --- SECTION: TAGS --- */}
      <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
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
              className="flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-sm font-medium transition duration-200 hover:bg-indigo-100 cursor-default"
            >
              <span>{tag}</span>
              <X
                size={12}
                className="cursor-pointer text-indigo-500 hover:text-indigo-700 transition"
                onClick={() => updateTag(tag)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* --- SECTION: OPENING HOURS --- */}
      <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
        <h3 className="text-xl font-bold text-gray-800">Operating Hours</h3>
        <p className="text-sm text-gray-500">
          <Calendar size={16} className="inline-block mr-2 text-gray-500" />
          Select the days your restaurant is open, then specify the operating times for each.
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
                            open_time: "",
                            close_time: "",
                        });
                    }
                    // Sort updated array by DAYS index to keep them in order
                    updated.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
                  }

                  updateField("opening_hours", updated);
                }}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition duration-200 shadow-sm ${
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
              className="flex flex-col md:flex-row gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-inner"
            >
              <p className="font-semibold w-full md:w-1/4 flex-shrink-0 text-gray-800 self-center">{hour.day}</p>

              <div className="flex-1 space-y-2 md:space-y-0 md:flex md:gap-4">
                  <div className="relative flex-1">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      className="h-11 pl-10 bg-white"
                      placeholder="Open Time (e.g. 09:00)"
                      value={hour.open_time}
                      onChange={(e) =>
                        updateOpeningHour(idx, "open_time", e.target.value)
                      }
                      type="time" // Use HTML5 time input for better mobile experience
                    />
                  </div>

                  <div className="relative flex-1">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      className="h-11 pl-10 bg-white"
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
      <div className="pt-6 border-t">
        <Button
          className="h-12 w-full text-base font-semibold bg-indigo-600 hover:bg-indigo-700 transition duration-200 rounded-lg shadow-lg"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}