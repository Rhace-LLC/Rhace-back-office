import { lazy, Suspense, useState } from "react";
import { MapProviderMenu } from "./MapProviderMenu";
import { MapLoading } from "./MapUI";
import type { MapPickerProps, MapProvider } from "./types";

const MapboxPicker = lazy(() => import("./providers/MapboxPicker"));
const GooglePicker = lazy(() => import("./providers/GooglePicker"));

export const MapPicker = ({ onConfirm }: MapPickerProps) => {
  // Google Maps is the default provider; the menu above the map still lets
  // the user switch to Mapbox.
  const [provider, setProvider] = useState<MapProvider>("google");

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <span className="text-[11px] font-bold tracking-widest text-ink-muted uppercase">
          Map provider
        </span>
        <MapProviderMenu
          value={provider}
          onChange={setProvider}
          className="h-9 w-[180px]"
        />
      </div>

      <Suspense fallback={<MapLoading />}>
        {provider === "mapbox" ? (
          <MapboxPicker onConfirm={onConfirm} />
        ) : (
          <GooglePicker onConfirm={onConfirm} />
        )}
      </Suspense>
    </div>
  );
};
