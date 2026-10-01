import { MapPin, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import type { MapLocation } from "./types";

export const MapCentered = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full flex-col items-center justify-center bg-surface p-8">
    {children}
  </div>
);

export const MapStatusBadge = () => (
  <div className="pointer-events-none absolute top-6 right-6 left-6 flex justify-center">
    <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 shadow-md">
      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      <span className="text-[11px] font-bold tracking-wider text-ink-muted uppercase">
        Live GPS Active
      </span>
    </div>
  </div>
);

export const SelectedAddressCard = ({
  address,
  onConfirm,
}: {
  address: MapLocation;
  onConfirm: (data: MapLocation) => void;
}) => (
  <div className="animate-in slide-in-from-bottom-4 absolute right-6 bottom-10 left-6 mx-auto max-w-[500px] duration-500">
    <div className="rounded-[28px] border border-line bg-surface p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="mt-1 rounded-2xl bg-inset p-3">
          <MapPin size={20} className="text-ink" />
        </div>
        <div className="flex-1">
          <p className="mb-1 text-[11px] font-extrabold tracking-widest text-ink-subtle uppercase">
            Selected Destination
          </p>
          <p className="text-[15px] leading-snug font-bold text-ink">
            {address.fullAddress}
          </p>
        </div>
      </div>

      <button
        onClick={() => onConfirm(address)}
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink font-bold text-white transition-all hover:bg-ink-secondary active:scale-[0.98]"
      >
        Confirm Address
        <ArrowRight size={18} />
      </button>
    </div>
  </div>
);

export const MapLoading = () => (
  <MapCentered>
    <div className="flex animate-pulse flex-col items-center">
      <div className="mb-4 h-1 w-12 rounded-full bg-inset" />
      <p className="text-[13px] font-bold tracking-widest text-ink-subtle uppercase">
        Initializing Map
      </p>
    </div>
  </MapCentered>
);
