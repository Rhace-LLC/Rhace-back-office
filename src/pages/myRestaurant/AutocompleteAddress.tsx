import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { forwardGeocode, Suggestion } from "@/utils/geocode";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect: (suggestion: Suggestion) => void;
}

export const AutocompleteAddress = ({ value, onChange, onSelect }: Props) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    if (timer.current) clearTimeout(timer.current);
    if (val.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      const results = await forwardGeocode(val);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 300);
  };

  const handleSelect = (s: Suggestion) => {
    onChange(s.placeName);
    onSelect(s);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <Input
        className="h-11"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Street address, building name, etc."
      />
      {open && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => handleSelect(s)}
              className="cursor-pointer px-4 py-3 text-sm hover:bg-gray-100"
            >
              <span className="block font-medium">{s.address}</span>
              {s.city && (
                <span className="block text-xs text-gray-500">
                  {[s.city, s.state, s.country].filter(Boolean).join(", ")}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
