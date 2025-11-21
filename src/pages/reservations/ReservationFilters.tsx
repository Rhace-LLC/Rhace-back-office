import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "recharts";

// ---------------------- Reservation Filters Component ----------------------
interface ReservationFiltersProps {
  filters: { searchTerm: string; status: string; date?: string };
  setFilters: (f: any) => void;
  onSearch: () => void;
}

export const ReservationFilters: React.FC<ReservationFiltersProps> = ({
  filters,
  setFilters,
  onSearch,
}) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
      <div className="flex-1">
        <Label>Search</Label>
        <Input
          placeholder="Search by name, phone or email"
          value={filters.searchTerm}
          onChange={(e) =>
            setFilters({ ...filters, searchTerm: e.target.value })
          }
        />
      </div>

      <div className="w-48">
        <Label>Status</Label>
        <select
          className="mt-1 w-full rounded border p-2"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <Button onClick={onSearch} className="mt-1">
          Search
        </Button>
      </div>
    </div>
  );
};
