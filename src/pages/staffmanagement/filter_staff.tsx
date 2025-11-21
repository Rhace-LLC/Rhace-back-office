import React from "react";
import { LucideSearch, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export type UserRole =
  | "admin"
  | "restaurant_owner"
  | "waiter"
  | "kitchen"
  | "inventory_mgr"
  | "driver";

interface StaffFilters {
  searchTerm: string;
  role: UserRole | "all";
}

interface StaffFiltersProps {
  filters: StaffFilters;
  setFilters: React.Dispatch<React.SetStateAction<StaffFilters>>;
  onSearch: () => void;
}

const StaffFilters: React.FC<StaffFiltersProps> = ({
  filters,
  setFilters,
  onSearch,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 md:flex-row md:items-center md:gap-4">
      {/* Search */}
      <div className="flex w-full items-center gap-2 md:w-1/3">
        <LucideSearch className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or email..."
          value={filters.searchTerm}
          onChange={(e) =>
            setFilters({ ...filters, searchTerm: e.target.value })
          }
        />
        <Button onClick={onSearch} variant="default">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Role Filter */}
      <Select
        value={filters.role}
        onValueChange={(value) =>
          setFilters({ ...filters, role: value as UserRole | "all" })
        }
      >
        <SelectTrigger className="w-full bg-white md:w-1/4">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="restaurant_owner">Restaurant Owner</SelectItem>
          <SelectItem value="waiter">Waiter</SelectItem>
          <SelectItem value="kitchen">Kitchen</SelectItem>
          <SelectItem value="inventory_mgr">Inventory Manager</SelectItem>
          <SelectItem value="driver">Driver</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default StaffFilters;
