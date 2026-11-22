import { createContext, useContext } from "react";

// Context object, types and hook live here so MapLocationContext.tsx only
// exports a component (required for React Fast Refresh).

export type PermissionStatus = "granted" | "denied" | "prompt";

export interface MapLocationContextState {
  permissionStatus: PermissionStatus;
  locationEnabled: boolean;
  requestPermission: () => Promise<void>;
  checkLocationEnabled: () => void;
}

export const MapLocationContext = createContext<MapLocationContextState | null>(null);

export const useMapLocationContext = () => {
  const ctx = useContext(MapLocationContext);
  if (!ctx) {
    throw new Error(
      "useMapLocationContext must be used inside MapLocationProvider"
    );
  }
  return ctx;
};
