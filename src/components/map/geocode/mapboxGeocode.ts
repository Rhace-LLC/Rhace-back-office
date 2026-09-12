import type { MapLocation, Suggestion } from "../types";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapboxContextItem {
  id: string;
  text: string;
}

interface MapboxFeature {
  place_name: string;
  address?: string;
  text: string;
  place_type?: string[];
  center: [number, number];
  context?: MapboxContextItem[];
}

interface MapboxResponse {
  features?: MapboxFeature[];
}

const getContextValue = (feature: MapboxFeature, type: string) =>
  (feature.context ?? []).find((c) => c.id.startsWith(type))?.text ?? null;

export const forwardGeocode = async (query: string): Promise<Suggestion[]> => {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=address,place,locality,neighborhood&limit=5`
    );
    const data: MapboxResponse = await res.json();
    return (data.features || []).map((f) => ({
      placeName: f.place_name,
      address: f.address ? `${f.address}, ${f.text}` : f.text,
      city: f.place_type?.includes("place")
        ? f.text
        : getContextValue(f, "place"),
      state: getContextValue(f, "region"),
      country: getContextValue(f, "country"),
      lat: f.center[1],
      lng: f.center[0],
    }));
  } catch {
    return [];
  }
};

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<MapLocation | null> => {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
    );

    const data: MapboxResponse = await res.json();
    const feature = data.features?.[0];

    if (!feature) return null;

    return {
      fullAddress: feature.place_name ?? null,
      city: feature.place_type?.includes("place")
        ? feature.text
        : getContextValue(feature, "place"),
      state: getContextValue(feature, "region"),
      country: getContextValue(feature, "country"),
      lat,
      lng,
    };
  } catch {
    return null;
  }
};
