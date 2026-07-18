const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export interface ReverseGeocodeResult {
  fullAddress: string | null;
  state: string | null;
  city: string | null;
  country: string | null;
}

export interface Suggestion {
  placeName: string;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  lat: number;
  lng: number;
}

export const forwardGeocode = async (query: string): Promise<Suggestion[]> => {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=address,place,locality,neighborhood&limit=5`
    );
    const data = await res.json();
    return (data.features || []).map((f: any) => {
      const context = f.context || [];
      const get = (type: string) =>
        context.find((c: any) => c.id.startsWith(type))?.text ?? null;
      return {
        placeName: f.place_name,
        address: f.address ? `${f.address}, ${f.text}` : f.text,
        city: f.place_type?.includes("place") ? f.text : get("place"),
        state: get("region"),
        country: get("country"),
        lat: f.center[1],
        lng: f.center[0],
      };
    });
  } catch {
    return [];
  }
};

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
