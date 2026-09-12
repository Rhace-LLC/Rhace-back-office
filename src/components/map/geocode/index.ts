import type { MapProvider } from "../types";
import * as mapbox from "./mapboxGeocode";
import * as google from "./googleGeocode";

export const getGeocoder = (provider: MapProvider) =>
  provider === "google" ? google : mapbox;

export type { MapLocation, Suggestion } from "../types";
