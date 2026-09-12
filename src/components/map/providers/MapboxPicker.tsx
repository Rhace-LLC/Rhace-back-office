import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { reverseGeocode } from "../geocode/mapboxGeocode";
import { MapLocationGate } from "../MapLocationGate";
import { MapStatusBadge, SelectedAddressCard } from "../MapUI";
import type { LatLng, MapLocation, MapPickerProps } from "../types";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxMap = ({
  coords,
  onConfirm,
}: {
  coords: LatLng;
  onConfirm: (data: MapLocation) => void;
}) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [address, setAddress] = useState<MapLocation | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [coords.lng, coords.lat],
      zoom: 15,
    });
    mapRef.current = map;

    const marker = new mapboxgl.Marker({ color: "#000000" })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map);
    markerRef.current = marker;

    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      marker.setLngLat([lng, lat]);
      setAddress(await reverseGeocode(lat, lng));
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [coords.lat, coords.lng]);

  return (
    <div className="relative h-[50vh] w-full bg-gray-50">
      <div ref={containerRef} className="h-full w-full grayscale-[0.2]" />
      <MapStatusBadge />
      {address && (
        <SelectedAddressCard address={address} onConfirm={onConfirm} />
      )}
    </div>
  );
};

export default function MapboxPicker({ onConfirm }: MapPickerProps) {
  return (
    <MapLocationGate>
      {(coords) => <MapboxMap coords={coords} onConfirm={onConfirm} />}
    </MapLocationGate>
  );
}
