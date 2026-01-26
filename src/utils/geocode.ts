const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
    );
    const data = await res.json();
    return data.features?.[0]?.place_name ?? null;
  } catch {
    return null;
  }
};
