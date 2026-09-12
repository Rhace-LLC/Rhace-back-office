import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MapProvider } from "./types";

const PROVIDERS: { value: MapProvider; label: string }[] = [
  { value: "mapbox", label: "Mapbox" },
  { value: "google", label: "Google Maps" },
];

export const MapProviderMenu = ({
  value,
  onChange,
  className,
}: {
  value: MapProvider | null;
  onChange: (provider: MapProvider) => void;
  className?: string;
}) => (
  <Select
    value={value ?? undefined}
    onValueChange={(next) => onChange(next as MapProvider)}
  >
    <SelectTrigger className={className}>
      <SelectValue placeholder="Choose a map provider" />
    </SelectTrigger>
    <SelectContent>
      {PROVIDERS.map((provider) => (
        <SelectItem key={provider.value} value={provider.value}>
          {provider.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
