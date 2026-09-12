import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";
import { reverseGeocode } from "../geocode/googleGeocode";
import { MapLocationGate } from "../MapLocationGate";
import { MapCentered, MapStatusBadge, SelectedAddressCard } from "../MapUI";
import type { LatLng, MapLocation, MapPickerProps } from "../types";

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  v: "weekly",
});

const GoogleMap = ({
  coords,
  onConfirm,
}: {
  coords: LatLng;
  onConfirm: (data: MapLocation) => void;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [address, setAddress] = useState<MapLocation | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let map: google.maps.Map | null = null;
    let listener: google.maps.MapsEventListener | null = null;

    (async () => {
      try {
        await importLibrary("maps");
        if (cancelled || !containerRef.current) return;

        map = new google.maps.Map(containerRef.current, {
          center: { lat: coords.lat, lng: coords.lng },
          zoom: 15,
        });

        const marker = new google.maps.Marker({
          map,
          position: { lat: coords.lat, lng: coords.lng },
        });

        listener = map.addListener(
          "click",
          async (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;
            marker.setPosition(e.latLng);
            setAddress(
              await reverseGeocode(e.latLng.lat(), e.latLng.lng())
            );
          }
        );
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
      listener?.remove();
      map = null;
    };
  }, [coords.lat, coords.lng]);

  if (error) {
    return (
      <MapCentered>
        <p className="text-[14px] font-medium text-gray-400">
          Unable to load Google Maps. Check the API key and enabled APIs.
        </p>
      </MapCentered>
    );
  }

  return (
    <div className="relative h-[50vh] w-full bg-gray-50">
      <div ref={containerRef} className="h-full w-full" />
      <MapStatusBadge />
      {address && (
        <SelectedAddressCard address={address} onConfirm={onConfirm} />
      )}
    </div>
  );
};

export default function GooglePicker({ onConfirm }: MapPickerProps) {
  return (
    <MapLocationGate>
      {(coords) => <GoogleMap coords={coords} onConfirm={onConfirm} />}
    </MapLocationGate>
  );
}
