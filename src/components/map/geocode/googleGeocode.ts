import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import type { MapLocation, Suggestion } from "../types";

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  v: "weekly",
});

let geocoderPromise: Promise<google.maps.Geocoder> | null = null;

const getGeocoder = () => {
  if (!geocoderPromise) {
    geocoderPromise = (async () => {
      await importLibrary("geocoding");
      return new google.maps.Geocoder();
    })();
  }
  return geocoderPromise;
};

const component = (
  result: google.maps.GeocoderResult,
  type: string
): string | null =>
  result.address_components.find((c) => c.types.includes(type))?.long_name ??
  null;

const cityOf = (result: google.maps.GeocoderResult): string | null =>
  component(result, "locality") ??
  component(result, "postal_town") ??
  component(result, "administrative_area_level_2");

const latOf = (result: google.maps.GeocoderResult): number =>
  result.geometry.location.lat();

const lngOf = (result: google.maps.GeocoderResult): number =>
  result.geometry.location.lng();

const toSuggestion = (r: google.maps.GeocoderResult): Suggestion => ({
  placeName: r.formatted_address ?? "",
  address: r.formatted_address ?? "",
  city: cityOf(r),
  state: component(r, "administrative_area_level_1"),
  country: component(r, "country"),
  lat: latOf(r),
  lng: lngOf(r),
});

export const forwardGeocode = async (query: string): Promise<Suggestion[]> => {
  if (!query.trim()) return [];
  try {
    const geocoder = await getGeocoder();
    const { results } = await geocoder.geocode({ address: query });
    return (results || []).slice(0, 5).map(toSuggestion);
  } catch {
    return [];
  }
};

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<MapLocation | null> => {
  try {
    const geocoder = await getGeocoder();
    const { results } = await geocoder.geocode({ location: { lat, lng } });
    const feature = results?.[0];

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
