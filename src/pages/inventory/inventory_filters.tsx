import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  filters: { searchTerm: string; category: string };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  onSearch: () => void;
}

const InventoryFilters: React.FC<Props> = ({ filters, setFilters, onSearch }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div>
        <Label>Search</Label>
        <Input
          value={filters.searchTerm}
          onChange={(e) => setFilters((prev: any) => ({ ...prev, searchTerm: e.target.value }))}
          placeholder="Search inventory"
        />
      </div>
      <div>
        <Label>Category</Label>
        <Input
          value={filters.category}
          onChange={(e) => setFilters((prev: any) => ({ ...prev, category: e.target.value }))}
          placeholder="Category"
        />
      </div>
      <Button className="self-end" onClick={onSearch}>
        Search
      </Button>
    </div>
  );
};

export default InventoryFilters;
