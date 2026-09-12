import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigation, ShieldCheck } from "lucide-react";
import { useMapLocationContext } from "@/contexts/MapLocationContext";
import { MapCentered, MapLoading } from "./MapUI";
import type { LatLng } from "./types";

export const MapLocationGate = ({
  children,
}: {
  children: (coords: LatLng) => ReactNode;
}) => {
  const {
    permissionStatus,
    locationEnabled,
    requestPermission,
    checkLocationEnabled,
  } = useMapLocationContext();

  const [coords, setCoords] = useState<LatLng | null>(null);

  useEffect(() => {
    checkLocationEnabled();
  }, []);

  useEffect(() => {
    if (permissionStatus === "granted" && locationEnabled) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }
  }, [permissionStatus, locationEnabled]);

  if (permissionStatus !== "granted") {
    return (
      <MapCentered>
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
      </MapCentered>
    );
  }

  if (!locationEnabled) {
    return (
      <MapCentered>
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
      </MapCentered>
    );
  }

  if (!coords) return <MapLoading />;

  return <>{children(coords)}</>;
};
