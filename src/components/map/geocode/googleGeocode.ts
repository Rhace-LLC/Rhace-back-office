import type { MapLocation, Suggestion } from "../types";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleGeocodeResult {
  formatted_address?: string;
  address_components?: GoogleAddressComponent[];
  geometry?: { location?: { lat: number; lng: number } };
}

interface GoogleGeocodeResponse {
  results?: GoogleGeocodeResult[];
}

const component = (result: GoogleGeocodeResult, type: string) =>
  result.address_components?.find((c) => c.types.includes(type))?.long_name ??
  null;

const cityOf = (result: GoogleGeocodeResult) =>
  component(result, "locality") ??
  component(result, "postal_town") ??
  component(result, "administrative_area_level_2");

export const forwardGeocode = async (query: string): Promise<Suggestion[]> => {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        query
      )}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data: GoogleGeocodeResponse = await res.json();
    return (data.results || []).slice(0, 5).map((r) => ({
      placeName: r.formatted_address ?? "",
      address: r.formatted_address ?? "",
      city: cityOf(r),
      state: component(r, "administrative_area_level_1"),
      country: component(r, "country"),
      lat: r.geometry?.location?.lat ?? 0,
      lng: r.geometry?.location?.lng ?? 0,
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
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data: GoogleGeocodeResponse = await res.json();
    const feature = data.results?.[0];

    if (!feature) return null;

    return {
      fullAddress: feature.formatted_address ?? null,
      city: cityOf(feature),
      state: component(feature, "administrative_area_level_1"),
      country: component(feature, "country"),
      lat,
      lng,
    };
  } catch {
    return null;
  }
};
