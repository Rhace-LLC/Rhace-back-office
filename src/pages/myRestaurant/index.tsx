import React, { useEffect, useState } from "react";

// This component is designed as a single-file React + TypeScript page
// tailored for an admin panel "Restaurant Profile" view.
// Styling assumes Tailwind CSS is available. It also uses shadcn-style
// component names (Button, Input, Textarea, Sheet) — replace with your
// app's actual components if different.

// ---------------- Types ----------------
type OperatingHour = {
  day: string; // e.g. "Mon"
  open: string; // e.g. "09:00"
  close: string; // e.g. "21:00"
};

type Restaurant = {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  category: string[]; // cuisines
  address: string;
  city: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number; // 0-5
  coverImage?: string | null;
  logo?: string | null;
  gallery: (string | null)[];
  hours: OperatingHour[];
  isOpen?: boolean;
};

// ---------------- Helpers ----------------
const fallbackCover =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='400' viewBox='0 0 1200 400'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='28' fill='%2371717a'%3ENo Cover Image%3C/text%3E%3C/svg%3E";
const fallbackAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='100%25' height='100%25' fill='%23ffffff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

const generateId = () => Math.random().toString(36).slice(2, 9);

// ---------------- Mock initial data (would normally come from API) ----------------
const initialRestaurant: Restaurant = {
  id: generateId(),
  name: "Maison Delish",
  tagline: "A modern twist on classic flavours",
  description:
    "Maison Delish is a cozy modern restaurant serving seasonal dishes crafted from locally-sourced ingredients. We focus on bold flavors and relaxed hospitality.",
  category: ["Contemporary", "French", "Fusion"],
  address: "12 Riverside Avenue",
  city: "Lagos",
  state: "Lagos State",
  country: "Nigeria",
  phone: "+234 801 234 5678",
  email: "hello@maisondelish.example",
  website: "https://maisondelish.example",
  rating: 4.6,
  coverImage: null,
  logo: null,
  gallery: [null, null, null],
  hours: [
    { day: "Mon", open: "09:00", close: "21:00" },
    { day: "Tue", open: "09:00", close: "21:00" },
    { day: "Wed", open: "09:00", close: "21:00" },
    { day: "Thu", open: "09:00", close: "22:00" },
    { day: "Fri", open: "09:00", close: "23:00" },
    { day: "Sat", open: "10:00", close: "23:00" },
    { day: "Sun", open: "10:00", close: "20:00" },
  ],
  isOpen: true,
};

// ---------------- Main Component ----------------
export default function RestaurantProfilePage() {
  const [restaurant, setRestaurant] = useState<Restaurant>(initialRestaurant);
  const [isEditing, setIsEditing] = useState(false);
  const [localDraft, setLocalDraft] = useState<Restaurant | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<(string | null)[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // sync previews from restaurant
    setCoverPreview(restaurant.coverImage || null);
    setLogoPreview(restaurant.logo || null);
    setGalleryPreviews(restaurant.gallery || []);
  }, [restaurant]);

  const startEdit = () => {
    setLocalDraft({ ...restaurant });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setLocalDraft(null);
    // reset previews from original restaurant
    setCoverPreview(restaurant.coverImage || null);
    setLogoPreview(restaurant.logo || null);
    setGalleryPreviews(restaurant.gallery || []);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!localDraft) return;
    setSaving(true);

    // Simulate upload/save delay
    await new Promise((r) => setTimeout(r, 900));

    // In real app, you would upload images to your CDN/Storage and then
    // call an API to persist the restaurant details. For now we just
    // commit the local draft to the main restaurant state.
    setRestaurant(localDraft);
    setIsEditing(false);
    setLocalDraft(null);
    setSaving(false);
  };

  // ---------------- Image Handlers (preview only) ----------------
  const onFileToDataUrl = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCoverUpload = async (file?: File) => {
    if (!file || !localDraft) return;
    const dataUrl = await onFileToDataUrl(file);
    setCoverPreview(dataUrl);
    setLocalDraft({ ...localDraft, coverImage: dataUrl });
  };

  const handleLogoUpload = async (file?: File) => {
    if (!file || !localDraft) return;
    const dataUrl = await onFileToDataUrl(file);
    setLogoPreview(dataUrl);
    setLocalDraft({ ...localDraft, logo: dataUrl });
  };

  const handleGalleryUpload = async (index: number, file?: File) => {
    if (!file || !localDraft) return;
    const dataUrl = await onFileToDataUrl(file);
    const newGallery = [...(localDraft.gallery || [])];
    newGallery[index] = dataUrl;
    setGalleryPreviews(newGallery);
    setLocalDraft({ ...localDraft, gallery: newGallery });
  };

  const removeGalleryImage = (index: number) => {
    if (!localDraft) return;
    const newGallery = [...localDraft.gallery];
    newGallery[index] = null;
    setGalleryPreviews(newGallery);
    setLocalDraft({ ...localDraft, gallery: newGallery });
  };

  // ---------------- Field helpers ----------------
  const updateDraftField = (key: keyof Restaurant, value: any) => {
    if (!localDraft) return;
    setLocalDraft({ ...localDraft, [key]: value });
  };

  const updateHour = (idx: number, partial: Partial<OperatingHour>) => {
    if (!localDraft) return;
    const newHours = localDraft.hours.map((h, i) =>
      i === idx ? { ...h, ...partial } : h
    );
    setLocalDraft({ ...localDraft, hours: newHours });
  };

  // ---------------- Small UI subcomponents ----------------
  function Pill({ children }: { children: React.ReactNode }) {
    return (
      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-rose-50 to-amber-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-100">
        {children}
      </span>
    );
  }

  function MutedEditButton({ onClick }: { onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white/60 px-3 py-2 text-sm text-gray-700 transition hover:bg-white/80"
        title="Edit"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11 5h6M4 13v7h7l9-9-7-7-9 9z"
          />
        </svg>
        <span className="text-xs">Edit</span>
      </button>
    );
  }

  // ---------------- Render ----------------
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Cover */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        <img
          src={coverPreview || fallbackCover}
          alt="cover"
          className="h-56 w-full object-cover grayscale-0 md:h-72 lg:h-96"
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <div className="absolute bottom-6 left-6 flex items-end gap-5">
          <div className="flex items-center gap-4">
            <div className="relative -mt-16">
              <div className="h-32 w-32 overflow-hidden rounded-xl border-4 border-white shadow">
                <img
                  src={logoPreview || fallbackAvatar}
                  alt="logo"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute -right-2 -bottom-2">
                <MutedEditButton onClick={startEdit} />
              </div>
            </div>

            <div className="text-white drop-shadow">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {restaurant.name}
              </h2>
              <p className="text-sm opacity-90">{restaurant.tagline}</p>

              <div className="mt-2 flex items-center gap-3">
                <Pill>
                  {restaurant.city}, {restaurant.state}
                </Pill>
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-yellow-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847 1.416 8.255L12 19.771l-7.416 4.079L6 15.595 0 9.748l8.332-1.73L12 .587z" />
                  </svg>
                  <span className="font-medium">
                    {restaurant.rating ?? "—"}
                  </span>
                  <span className="text-xs opacity-80">
                    · {restaurant.isOpen ? "Open" : "Closed"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Overview card */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Overview</h3>
                <p className="text-sm text-gray-500">
                  Key information about your restaurant
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={startEdit}
                  className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-slate-50 to-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-100 transition hover:translate-y-[-1px]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 5h6M4 13v7h7l9-9-7-7-9 9z"
                    />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Description
                </h4>
                <p className="mt-2 text-sm text-gray-600">
                  {restaurant.description}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Contact</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div>
                    <strong>Email:</strong> {restaurant.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {restaurant.phone}
                  </div>
                  <div>
                    <strong>Website:</strong>{" "}
                    <a
                      className="text-indigo-600 underline"
                      href={restaurant.website}
                    >
                      {restaurant.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* tags & hours */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {restaurant.category.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700">
                Operating Hours
              </h4>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                {restaurant.hours.map((h) => (
                  <div
                    key={h.day}
                    className="rounded-md border bg-white px-3 py-2"
                  >
                    <div className="font-medium">{h.day}</div>
                    <div className="text-xs text-gray-500">
                      {h.open} — {h.close}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Gallery</h3>
                <p className="text-sm text-gray-500">
                  Photos used across the listing and menu.
                </p>
              </div>

              <div className="text-sm text-gray-500">
                Tip: Click edit to swap images
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {galleryPreviews.length === 0
                ? [0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex h-40 w-full items-center justify-center rounded-lg border bg-gray-50"
                    >
                      <img
                        src={fallbackCover}
                        alt="fallback"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))
                : galleryPreviews.map((g, i) => (
                    <div
                      key={i}
                      className="h-40 w-full overflow-hidden rounded-lg border bg-gray-50"
                    >
                      <img
                        src={g || fallbackCover}
                        alt={`gallery-${i}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Right column: Quick stats & actions */}
        <aside className="space-y-6">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Listings Score</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="rounded-full bg-amber-100 px-3 py-2 text-sm font-semibold">
                    {restaurant.rating}
                  </div>
                  <div className="text-xs text-gray-500">Verified</div>
                </div>
              </div>

              <div>
                <button className="rounded-md border bg-white px-3 py-2 text-sm hover:shadow">
                  Share
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h4 className="text-sm font-medium">Quick Actions</h4>
            <div className="mt-3 flex flex-col gap-3">
              <button className="w-full rounded-md border px-3 py-2 text-sm">
                Preview Listing
              </button>
              <button className="w-full rounded-md border px-3 py-2 text-sm">
                Manage Menus
              </button>
              <button className="w-full rounded-md border px-3 py-2 text-sm">
                View Orders
              </button>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h4 className="text-sm font-medium">Contact Info</h4>
            <div className="mt-2 text-sm text-gray-600">
              <div>
                <strong>Address:</strong> {restaurant.address},{" "}
                {restaurant.city}
              </div>
              <div>
                <strong>Email:</strong> {restaurant.email}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ---------------- Edit Drawer / Sheet ---------------- */}
      {isEditing && localDraft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={cancelEdit} />

          <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 md:w-4/5 md:rounded-2xl lg:w-3/4 xl:w-2/3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Restaurant Profile</h3>

              <div className="flex items-center gap-3">
                <button onClick={cancelEdit} className="text-sm text-gray-600">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left: Visuals */}
              <div className="space-y-4 lg:col-span-1">
                <div>
                  <label className="text-sm font-medium">Cover Image</label>
                  <div className="mt-2 overflow-hidden rounded-lg border">
                    <img
                      src={coverPreview || fallbackCover}
                      alt="cover-preview"
                      className="h-40 w-full object-cover"
                    />
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <label className="cursor-pointer rounded-md bg-gray-100 px-3 py-2 text-sm">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          await handleCoverUpload(f);
                        }}
                      />
                    </label>
                    <button
                      onClick={() => {
                        if (!localDraft) return;
                        setCoverPreview(null);
                        setLocalDraft({ ...localDraft, coverImage: null });
                      }}
                      className="text-sm text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Logo</label>
                  <div className="mt-2 h-32 w-32 overflow-hidden rounded-lg border">
                    <img
                      src={logoPreview || fallbackAvatar}
                      alt="logo-preview"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <label className="cursor-pointer rounded-md bg-gray-100 px-3 py-2 text-sm">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          await handleLogoUpload(f);
                        }}
                      />
                    </label>
                    <button
                      onClick={() => {
                        if (!localDraft) return;
                        setLogoPreview(null);
                        setLocalDraft({ ...localDraft, logo: null });
                      }}
                      className="text-sm text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Gallery</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {localDraft.gallery.map((g, i) => (
                      <div
                        key={i}
                        className="relative h-24 overflow-hidden rounded-lg border"
                      >
                        <img
                          src={g || fallbackCover}
                          alt={`g-${i}`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-1 right-1 flex gap-1">
                          <label className="cursor-pointer rounded bg-white/80 p-1">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const f = e.target.files?.[0];
                                await handleGalleryUpload(i, f);
                              }}
                            />
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 20h9"
                              />
                            </svg>
                          </label>
                          <button
                            onClick={() => removeGalleryImage(i)}
                            className="rounded bg-white/80 p-1 text-red-500"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: fields */}
              <div className="space-y-4 lg:col-span-2">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={localDraft.name}
                      onChange={(e) => updateDraftField("name", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tagline</label>
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={localDraft.tagline}
                      onChange={(e) =>
                        updateDraftField("tagline", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="mt-1 min-h-[110px] w-full rounded-md border p-3 text-sm"
                    value={localDraft.description}
                    onChange={(e) =>
                      updateDraftField("description", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={localDraft.phone}
                      onChange={(e) =>
                        updateDraftField("phone", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={localDraft.email}
                      onChange={(e) =>
                        updateDraftField("email", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Website</label>
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={localDraft.website}
                      onChange={(e) =>
                        updateDraftField("website", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Address</label>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    value={localDraft.address}
                    onChange={(e) =>
                      updateDraftField("address", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div>
                    <label className="text-sm font-medium">City</label>
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={localDraft.city}
                      onChange={(e) => updateDraftField("city", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">State</label>
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={localDraft.state}
                      onChange={(e) =>
                        updateDraftField("state", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Country</label>
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={localDraft.country}
                      onChange={(e) =>
                        updateDraftField("country", e.target.value)
                      }
                    />
                  </div>

                  <div />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Categories (comma separated)
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    value={localDraft.category.join(", ")}
                    onChange={(e) =>
                      updateDraftField(
                        "category",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Operating Hours</label>
                  <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {localDraft.hours.map((h, i) => (
                      <div key={h.day} className="flex items-center gap-2">
                        <div className="w-16 text-sm font-medium">{h.day}</div>
                        <input
                          className="w-28 rounded-md border px-2 py-1 text-sm"
                          value={h.open}
                          onChange={(e) =>
                            updateHour(i, { open: e.target.value })
                          }
                        />
                        <div className="text-sm">—</div>
                        <input
                          className="w-28 rounded-md border px-2 py-1 text-sm"
                          value={h.close}
                          onChange={(e) =>
                            updateHour(i, { close: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={localDraft.isOpen}
                      onChange={(e) =>
                        updateDraftField("isOpen", e.target.checked)
                      }
                    />
                    <span>Is Open Now</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelEdit}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
