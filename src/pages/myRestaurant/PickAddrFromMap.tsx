import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import { useMapLocationContext } from "@/contexts/MapLocationContext";
import { reverseGeocode, ReverseGeocodeResult } from "@/utils/geocode";
import { MapPin, Navigation, ArrowRight, ShieldCheck } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export const PickAddressFromMap = ({
  onConfirm,
}: {
  onConfirm: (data: ReverseGeocodeResult) => void;
}) => {
  const {
    permissionStatus,
    locationEnabled,
    requestPermission,
    checkLocationEnabled,
  } = useMapLocationContext();

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  const [address, setAddress] = useState<ReverseGeocodeResult | null>(null);

  useEffect(() => {
    checkLocationEnabled();
  }, []);

  useEffect(() => {
    if (permissionStatus === "granted" && locationEnabled) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords([pos.coords.longitude, pos.coords.latitude]);
      });
    }
  }, [permissionStatus, locationEnabled]);

  useEffect(() => {
    if (!mapContainerRef.current || !userCoords) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v10", // Updated to a cleaner, light style
      center: userCoords,
      zoom: 15,
    });

    const marker = new mapboxgl.Marker({ color: "#000000" }) // Minimalist black marker
      .setLngLat(userCoords)
      .addTo(mapRef.current);

    mapRef.current.on("click", async (e: any) => {
      const { lng, lat } = e.lngLat;
      marker.setLngLat([lng, lat]);
      const addr = await reverseGeocode(lat, lng);
      setAddress(addr);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, [userCoords]);

  // ❌ Permission not granted
  if (permissionStatus !== "granted") {
    return (
      <Centered>
        <div className="mb-4 rounded-3xl bg-gray-50 p-4">
          <ShieldCheck size={32} strokeWidth={1.5} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900">
          Location Access
        </h2>
        <p className="mb-6 max-w-[240px] text-center text-[14px] text-gray-400">
          We need your permission to show nearby addresses on the map.
        </p>
        <button
          onClick={requestPermission}
          className="h-12 rounded-2xl bg-black px-8 text-[14px] font-bold text-white transition-all active:scale-95"
        >
          Allow Access
        </button>
      </Centered>
    );
  }

  if (!locationEnabled) {
    return (
      <Centered>
        <div className="mb-4 rounded-3xl bg-gray-50 p-4 text-gray-400">
          <Navigation size={32} strokeWidth={1.5} />
        </div>
        <p className="mb-6 text-[14px] font-medium text-gray-400">
          GPS is currently disabled
        </p>
        <button
          onClick={checkLocationEnabled}
          className="h-12 rounded-2xl bg-black px-8 text-[14px] font-bold text-white transition-all active:scale-95"
        >
          I’ve turned it on
        </button>
      </Centered>
    );
  }

  // ⏳ Loading location
  if (!userCoords) {
    return (
      <Centered>
        <div className="flex animate-pulse flex-col items-center">
          <div className="mb-4 h-1 w-12 rounded-full bg-gray-100" />
          <p className="text-[13px] font-bold tracking-widest text-gray-300 uppercase">
            Initializing Map
          </p>
        </div>
      </Centered>
    );
  }

  // ✅ All good
  return (
    <div className="relative h-[50vh] w-full bg-gray-50">
      <div ref={mapContainerRef} className="h-full w-full grayscale-[0.2]" />

      {/* Floating Header (Search/Status Placeholder) */}
      <div className="pointer-events-none absolute top-6 right-6 left-6 flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
            Live GPS Active
          </span>
        </div>
      </div>

      {address && (
        <div className="animate-in slide-in-from-bottom-4 absolute right-6 bottom-10 left-6 mx-auto max-w-[500px] duration-500">
          <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-black/5">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-2xl bg-gray-100 p-3">
                <MapPin size={20} className="text-gray-900" />
              </div>
              <div className="flex-1">
                <p className="mb-1 text-[11px] font-extrabold tracking-widest text-gray-300 uppercase">
                  Selected Destination
                </p>
                <p className="text-[15px] leading-snug font-bold text-gray-900">
                  {address?.fullAddress}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (address) {
                  onConfirm(address);
                }
              }}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[1.5rem] bg-black font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
            >
              Confirm Address
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Centered = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-full flex-col items-center justify-center bg-white p-8">
    {children}
  </div>
);
