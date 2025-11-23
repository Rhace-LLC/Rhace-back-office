import { RestaurantProfile } from "@/api-services/restaurantProfile";
import { Button } from "@/components/ui/button";

// Fallback images (assuming these paths are correct)
const fallbackCover = "/images/fallback-cover.png";
const fallbackAvatar = "/images/fallback-avatar.png";
const gallery = [
  "https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?q=80&w=889&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

export default function ViewMyRestaurant({
  profile,
  onEdit,
}: {
  profile: RestaurantProfile;
  onEdit: (isEdit: boolean) => void;
}) {
  const display = (
    value: string | number | null | undefined,
    fallback = "Not yet added"
  ) => value ?? fallback;

  // Keep 24-hour format "HH:mm" as is, but validate/fix formatting
  const formatTime12 = (time24: string) => {
    if (!time24) return "";
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // convert 0 -> 12, 13 -> 1, etc.
    return `${hour}:${minute} ${ampm}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="hover:shadow-3xl relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-300">
        <img
          src={profile.cover_image_url || fallbackCover}
          alt="Restaurant Cover"
          className="aspect-video h-64 w-full object-cover md:h-80 lg:h-96"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Content positioned at the bottom left */}
        <div className="absolute bottom-0 left-0 flex w-full items-end p-6 md:p-10">
          <div className="flex w-full items-end gap-6">
            {/* Logo/Avatar */}
            <div className="relative -mt-24 flex-shrink-0">
              <div className="h-32 w-32 overflow-hidden rounded-xl border-4 border-white bg-white/20 shadow-xl backdrop-blur-sm md:h-40 md:w-40">
                <img
                  src={profile.logo_url || fallbackAvatar}
                  alt="Restaurant Logo"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            {/* Title and Info Block */}
            <div className="flex-grow text-white drop-shadow-md">
              {/* Name and Slogan */}
              <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
                {display(profile.name)}
              </h1>
              <p className="mt-1 text-lg font-light opacity-95">
                {display(profile.slogan)}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm">
                  {display(profile.city)}, {display(profile.state)}
                </span>

                {/* Rating and Status */}
                <div className="flex items-center gap-3 text-lg font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 fill-current text-amber-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847 1.416 8.255L12 19.771l-7.416 4.079L6 15.595 0 9.748l8.332-1.73L12 .587z" />
                  </svg>
                  <span>{display(profile.avg_rating)}</span>
                  <span className="text-sm opacity-80">
                    ({profile.rating_count ?? 0} reviews)
                  </span>

                  {/* Open/Closed Status - Clear distinction */}
                  <span
                    className={`ml-2 border-l border-white/40 pl-3 text-sm font-semibold ${profile.is_open ? "text-green-300" : "text-red-300"}`}
                  >
                    {profile.is_open ? "Open Now" : "Currently Closed"}
                  </span>
                </div>
              </div>

              {/* Edit Button - Clear call to action, moved out of the info block */}
              <div className="mt-6">
                <Button
                  onClick={() => onEdit(true)}
                  // Modern button styling: rounded, slightly larger, impactful color
                  className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-gray-900 shadow-lg transition duration-200 hover:bg-gray-100 hover:shadow-xl"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Left Column: Overview, Tags, Hours (2/3 width on desktop) */}
      <div className="space-y-8">
        {/* Overview Card */}
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg md:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">
            Overview
          </h2>
          <p className="mt-2 text-base text-gray-500">
            Key information and background about your restaurant.
          </p>

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">Description</h3>
            <p className="mt-2 text-base leading-relaxed text-gray-600">
              {display(profile.description)}
            </p>
          </div>

          {/* Tags/Cuisines */}
          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-700">
              Cuisine & Tags
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {(profile.tags && profile.tags.length > 0
                ? profile.tags
                : ["Not yet added"]
              ).map((tag, idx) => (
                <span
                  key={idx}
                  // Updated tag styling: pill shape, subtle color
                  className="rounded-full border border-blue-100 bg-blue-50/70 px-4 py-1.5 text-sm font-medium text-blue-700 transition duration-150 hover:bg-blue-100"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Opening Hours */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Operating Hours
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4 lg:grid-cols-5">
              {(profile.opening_hours && profile.opening_hours.length > 0
                ? profile.opening_hours
                : [{ day: "Not yet added", open_time: "", close_time: "" }]
              ).map((h, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-gray-50/50 p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="font-semibold text-gray-800">
                    {h.day || "Not yet added"}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {h.open_time && h.close_time
                      ? `${formatTime12(h.open_time)} - ${formatTime12(h.close_time)}`
                      : "Not yet added"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Contact Info (1/3 width on desktop) */}
        <div className="">
          <section className="sticky top-8 rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
            <h3 className="text-xl font-bold tracking-tight text-gray-800">
              Contact Information
            </h3>

            <div className="mt-4 space-y-3 text-base text-gray-600">
              <div className="flex items-start">
                <span className="mt-1 mr-3 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                <div>
                  <strong className="block text-gray-800">Address</strong>
                  <span>
                    {display(profile.address)}, {display(profile.city)},{" "}
                    {display(profile.state)}
                  </span>
                </div>
              </div>

              <div className="flex items-start">
                <span className="mt-1 mr-3 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <div>
                  <strong className="block text-gray-800">Email</strong>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-blue-500 hover:underline"
                  >
                    {display(profile.email)}
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <span className="mt-1 mr-3 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2 2h-4.92c-1.07 0-2.12-.2-3.04-.6-2.6-1.1-4.7-3.2-5.8-5.8-.4-.92-.6-1.97-.6-3.04V4a2 2 0 0 1 2-2h3"></path>
                    <line x1="12" y1="12" x2="16" y2="16"></line>
                    <line x1="16" y1="8" x2="12" y2="12"></line>
                    <line x1="8" y1="16" x2="12" y2="12"></line>
                  </svg>
                </span>
                <div>
                  <strong className="block text-gray-800">Phone</strong>
                  <a
                    href={`tel:${profile.phone}`}
                    className="text-blue-500 hover:underline"
                  >
                    {display(profile.phone)}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Gallery Card */}
        <section className="hidden rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg md:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">
            Gallery
          </h2>
          <p className="mt-2 text-base text-gray-500">
            Key photos and visual assets used across your listing.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.map((img, i) => (
              <div
                key={i}
                // Aspect ratio maintained for images, added hover effect
                className="group aspect-square w-full cursor-pointer overflow-hidden rounded-xl border bg-gray-100 shadow-inner"
              >
                <img
                  src={img || fallbackCover}
                  alt={`gallery-${i}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
          {/* Optional: Add a note if more images are needed */}
          <p className="mt-4 text-sm text-gray-400 italic">
            Showing Cover, Logo, and a Gallery image (if available).
          </p>
        </section>
      </div>
    </div>
  );
}
