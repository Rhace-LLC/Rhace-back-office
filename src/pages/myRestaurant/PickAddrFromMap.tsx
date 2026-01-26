import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import { useMapLocationContext } from "@/contexts/MapLocationContext";
import { reverseGeocode } from "@/utils/geocode";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export const PickAddressFromMap = () => {
  const {
    permissionStatus,
    locationEnabled,
    requestPermission,
    checkLocationEnabled,
  } = useMapLocationContext();

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [pickedCoords, setPickedCoords] = useState<[number, number] | null>(
    null
  );

  console.log("pickedCoords", pickedCoords)

  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    checkLocationEnabled();
  }, []);

  useEffect(() => {
    if (permissionStatus === "granted" && locationEnabled) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords([pos.coords.longitude, pos.coords.latitude]);
      });
    }
  }, [permissionStatus, locationEnabled]);

  useEffect(() => {
    if (!mapContainerRef.current || !userCoords) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: userCoords,
      zoom: 14,
    });

    const marker = new mapboxgl.Marker().setLngLat(userCoords).addTo(
      mapRef.current
    );

    mapRef.current.on("click", async (e: any) => {
      const { lng, lat } = e.lngLat;
      setPickedCoords([lng, lat]);

      marker.setLngLat([lng, lat]);

      const addr = await reverseGeocode(lat, lng);
      setAddress(addr);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, [userCoords]);

  // ❌ Permission not granted
  if (permissionStatus !== "granted") {
    return (
      <Centered>
        <p>Please allow location access</p>
        <button onClick={requestPermission}>Allow</button>
      </Centered>
    );
  }

  if (!locationEnabled) {
    return (
      <Centered>
        <p>Please turn on your location</p>
        <button onClick={checkLocationEnabled}>I’ve turned it on</button>
      </Centered>
    );
  }

  // ⏳ Loading location
  if (!userCoords) {
    return <Centered>Fetching your location…</Centered>;
  }

  // ✅ All good
  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <div
        ref={mapContainerRef}
        style={{ height: "100%", width: "100%" }}
      />

      {address && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            padding: 12,
            background: "white",
            borderRadius: 8,
          }}
        >
          <strong>Selected Address:</strong>
          <p>{address}</p>
        </div>
      )}
    </div>
  );
};

const Centered = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    }}
  >
    {children}
  </div>
);
