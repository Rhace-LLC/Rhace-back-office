export type MapProvider = "mapbox" | "google";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapLocation {
  fullAddress: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lat: number;
  lng: number;
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

export interface MapPickerProps {
  onConfirm: (data: MapLocation) => void;
}
