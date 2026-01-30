const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export interface ReverseGeocodeResult {
  fullAddress: string | null;
  state: string | null;
  city: string | null;
  country: string | null;
}

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> => {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
    );

    const data = await res.json();
    const feature = data.features?.[0];

    if (!feature) return null;

    const context = feature.context || [];

    const getContextValue = (type: string) =>
      context.find((c: any) => c.id.startsWith(type))?.text ?? null;

    return {
      fullAddress: feature.place_name ?? null,
      city: feature.place_type?.includes("place")
        ? feature.text
        : getContextValue("place"),
      state: getContextValue("region"),
      country: getContextValue("country"),
    };
  } catch {
    return null;
  }
};
