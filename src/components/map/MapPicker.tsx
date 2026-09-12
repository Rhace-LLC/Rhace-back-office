import { lazy, Suspense, useState } from "react";
import { MapPin } from "lucide-react";
import { MapProviderMenu } from "./MapProviderMenu";
import { MapLoading } from "./MapUI";
import type { MapPickerProps, MapProvider } from "./types";

const MapboxPicker = lazy(() => import("./providers/MapboxPicker"));
const GooglePicker = lazy(() => import("./providers/GooglePicker"));

export const MapPicker = ({ onConfirm }: MapPickerProps) => {
  const [provider, setProvider] = useState<MapProvider | null>(null);

  if (!provider) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 bg-white p-8">
        <div className="rounded-3xl bg-gray-50 p-4">
          <MapPin size={32} strokeWidth={1.5} className="text-gray-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            Choose a map provider
          </h2>
          <p className="mt-1 max-w-[260px] text-[14px] text-gray-400">
            Pick the map you would like to use to set your restaurant location.
          </p>
        </div>
        <MapProviderMenu
          value={provider}
          onChange={setProvider}
          className="w-[240px]"
        />
      </div>
    );
  }

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
