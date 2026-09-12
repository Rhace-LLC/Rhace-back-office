import { MapPin, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import type { MapLocation } from "./types";

export const MapCentered = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full flex-col items-center justify-center bg-white p-8">
    {children}
  </div>
);

export const MapStatusBadge = () => (
  <div className="pointer-events-none absolute top-6 right-6 left-6 flex justify-center">
    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
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
    <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-black/5">
      <div className="flex items-start gap-4">
        <div className="mt-1 rounded-2xl bg-gray-100 p-3">
          <MapPin size={20} className="text-gray-900" />
        </div>
        <div className="flex-1">
          <p className="mb-1 text-[11px] font-extrabold tracking-widest text-gray-300 uppercase">
            Selected Destination
          </p>
          <p className="text-[15px] leading-snug font-bold text-gray-900">
            {address.fullAddress}
          </p>
        </div>
      </div>

      <button
        onClick={() => onConfirm(address)}
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[1.5rem] bg-black font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
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
      <div className="mb-4 h-1 w-12 rounded-full bg-gray-100" />
      <p className="text-[13px] font-bold tracking-widest text-gray-300 uppercase">
        Initializing Map
      </p>
    </div>
  </MapCentered>
);
