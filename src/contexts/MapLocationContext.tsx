import React, { createContext, useContext, useEffect, useState } from "react";

type PermissionStatus = "granted" | "denied" | "prompt";

interface MapLocationContextState {
  permissionStatus: PermissionStatus;
  locationEnabled: boolean;
  requestPermission: () => Promise<void>;
  checkLocationEnabled: () => void;
}

const MapLocationContext = createContext<MapLocationContextState | null>(null);

export const MapLocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>("prompt");
  const [locationEnabled, setLocationEnabled] = useState(false);

  const requestPermission = async () => {
    if (!navigator.geolocation) {
      setPermissionStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setPermissionStatus("granted");
        setLocationEnabled(true);
      },
      () => {
        setPermissionStatus("denied");
      }
    );
  };

  const checkLocationEnabled = () => {
    if (!navigator.geolocation) {
      setLocationEnabled(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => setLocationEnabled(true),
      () => setLocationEnabled(false)
    );
  };

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          setPermissionStatus(result.state as PermissionStatus);
        });
    }
  }, []);

  return (
    <MapLocationContext.Provider
      value={{
        permissionStatus,
        locationEnabled,
        requestPermission,
        checkLocationEnabled,
      }}
    >
      {children}
    </MapLocationContext.Provider>
  );
};

export const useMapLocationContext = () => {
  const ctx = useContext(MapLocationContext);
  if (!ctx) {
    throw new Error(
      "useMapLocationContext must be used inside MapLocationProvider"
    );
  }
  return ctx;
};
