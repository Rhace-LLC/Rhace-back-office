import { RestaurantProfile } from "@/api-services/restaurantProfile";
import { Button } from "@/components/ui/button";

// Fallback images (assuming these paths are correct)
const fallbackCover = "https://res.cloudinary.com/mixam/image/upload/v1784977017/z0bqqxe3yxx48mhwiydx.png";
const fallbackAvatar = "https://res.cloudinary.com/mixam/image/upload/v1784976263/za3wvroai7ramqo0bip5.png";
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
  {/* Cover Image */}
  <img
    src={profile.cover_image_url || fallbackCover}
    alt="Restaurant Cover"
    className="aspect-video  h-120 w-full object-cover md:h-100 lg:h-80"
  />

  {/* Overlay Gradient */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

  {/* Content Area */}
  <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-10">
    <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:gap-6">
      
      {/* Circular Logo/Avatar */}
      <div className="flex-shrink-0">
        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white/20 shadow-xl backdrop-blur-sm md:h-32 md:w-32">
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
        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          {display(profile.name)}
        </h1>
        <p className="mt-1 text-base font-light opacity-90 sm:text-lg">
          {display(profile.slogan)}
        </p>

        {/* Badges & Rating */}
        <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm sm:text-sm">
            {display(profile.city)}, {display(profile.state)}
          </span>

          {/* Rating and Status */}
          <div className="flex items-center gap-2 text-sm font-medium sm:text-base">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 fill-current text-amber-300 sm:h-5 sm:w-5"
              viewBox="0 0 24 24"
            >
              <path d="M12 .587l3.668 7.431L24 9.748l-6 5.847 1.416 8.255L12 19.771l-7.416 4.079L6 15.595 0 9.748l8.332-1.73L12 .587z" />
            </svg>
            <span>{display(profile.avg_rating)}</span>
            <span className="text-xs opacity-80 sm:text-sm">
              ({profile.rating_count ?? 0} reviews)
            </span>

            {/* Open/Closed Status */}
            <span
              className={`ml-1 border-l border-white/40 pl-2 text-xs font-semibold sm:ml-2 sm:pl-3 sm:text-sm ${
                profile.is_open ? "text-green-300" : "text-red-300"
              }`}
            >
              {profile.is_open ? "Open Now" : "Currently Closed"}
            </span>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-4 sm:mt-6">
          <Button
            onClick={() => onEdit(true)}
            className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-gray-900 shadow-lg transition duration-200 hover:bg-gray-100 hover:shadow-xl sm:px-8 sm:py-3 sm:text-base"
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
          
            {/* Selected Value Indicator */}
            <div className="flex items-center gap-2 mt-5 p-1">
              <span className="text-base font-medium text-gray-600">Brand Color:</span>
              <span
                className="inline-block h-5 w-5 rounded-full border border-gray-300"
                style={{ backgroundColor: profile?.brand_color || "#ffffff" }}
              />
              <span className="font-mono text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                {profile?.brand_color || "Not yet added"}
              </span>
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
                    {display(profile.address)}
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
