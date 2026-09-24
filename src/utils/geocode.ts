// Address search defaults to Google Maps. Mapbox remains available through
// the map provider switcher (see getGeocoder in components/map/geocode).
export {
  forwardGeocode,
  reverseGeocode,
} from "@/components/map/geocode/googleGeocode";
export type {
  MapLocation as ReverseGeocodeResult,
  Suggestion,
} from "@/components/map/types";
