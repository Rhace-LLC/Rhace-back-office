import React, { useCallback, useEffect, useState } from "react";
import {
  MapLocationContext,
  type PermissionStatus,
} from "./useMapLocation";



export const MapLocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>("prompt");
  const [locationEnabled, setLocationEnabled] = useState(false);

  const requestPermission = useCallback(async () => {
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
  }, []);

  // Stable identity so consumers can list it as an effect dependency.
  const checkLocationEnabled = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationEnabled(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => setLocationEnabled(true),
      () => setLocationEnabled(false)
    );
  }, []);

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
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
