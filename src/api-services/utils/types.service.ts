import { InventoryItem } from "@/store/inventory.slice";
import { Table } from "../tableService";

export interface RegisterRestaurantResponse {
  detail: string;
  restaurant: {
    id: string;
    name: string;
    slug: string;
    access_url: string;
    access_token_url: string;
    trial_ends_at: string; // ISO date string
  };
  owner_email: string;
}

export interface InventoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: InventoryItem[];
}

export type GetTablesResponse = Table[];
