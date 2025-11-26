// api-services/tableService.ts
import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";

export interface Table {
  id: string;
  restaurant_name: string;
  table_number: string;
  qr_code_image: string;
  max_party_size: number;
  is_available: boolean;
  created: string;
  updated: string;
  status: "free" | "occupied" | "reserved";
  restaurant: string;
}

// GET /menu/restaurant/{restaurant_id}/tables/ - Get all tables
export const getAllTables = async (
  token: string,
  restaurantId: string
): Promise<Table[]> => {
  const config = getConfig(
    `/menu/restaurant/${restaurantId}/tables/`,
    "GET",
    token
  );
  const response = await bookiesAxiosInstance(config);

  // ✅ FIX: The response itself is the array, not response.data
  let tablesData = response.data;

  // If response.data is not an array but response itself might be
  if (!Array.isArray(tablesData) && Array.isArray(response)) {
    tablesData = response;
  }

  // If we still don't have an array, try to extract from nested properties
  if (!Array.isArray(tablesData)) {
    if (tablesData && Array.isArray(tablesData.results)) {
      tablesData = tablesData.results;
    } else if (tablesData && Array.isArray(tablesData.data)) {
      tablesData = tablesData.data;
    } else if (tablesData && Array.isArray(tablesData.tables)) {
      tablesData = tablesData.tables;
    }
  }

  // Final check - ensure we return an array
  if (Array.isArray(tablesData)) {
    return tablesData;
  }

  return [];
};

// Get available tables - FIXED: Use status as primary indicator since is_available seems unreliable
export const getAvailableTables = async (
  token: string,
  restaurantId: string
): Promise<Table[]> => {
  const allTables = await getAllTables(token, restaurantId);

  console.log(
    "🔧 All tables:",
    allTables.map((t) => ({
      number: t.table_number,
      status: t.status,
      is_available: t.is_available,
    }))
  );

  // Use status='free' as the primary indicator since is_available seems inconsistent
  const availableTables = allTables.filter((table) => table.status === "free");

  console.log(`✅ Available tables (status='free'):`, availableTables.length);
  console.log(
    "✅ Available table numbers:",
    availableTables.map((t) => t.table_number)
  );

  return availableTables;
};
