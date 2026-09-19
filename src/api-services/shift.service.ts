import { getConfig } from "./utils/reqConfig";
import { bookiesAxiosInstance } from "./utils/baseUrl";

export interface ShiftLog {
  id: number;
  clock_in: string;
  clock_out: string | null;
  total_sales: string;
  user: string;
  restaurant: string;
}

/**
 * GET /shifts/
 * Fetches all shift logs for the current user, or for the entire restaurant if the user is an owner.
 */
const getShiftLogs = async (token?: string): Promise<ShiftLog[]> => {
  const config = getConfig("/shifts/", "GET", token);
  return bookiesAxiosInstance.request(config);
};

/**
 * POST /shifts/clock-in/
 * Clocks in the user to start a new shift.
 */
const clockInShift = async (data?: any, token?: string): Promise<ShiftLog> => {
  const config = getConfig("/shifts/clock-in/", "POST", token, data);
  return bookiesAxiosInstance.request(config);
};

/**
 * POST /shifts/clock-out/
 * Clocks out the user to end their current shift.
 */
const clockOutShift = async (data?: any, token?: string): Promise<ShiftLog> => {
  const config = getConfig("/shifts/clock-out/", "POST", token, data);
  return bookiesAxiosInstance.request(config);
};

export { getShiftLogs, clockInShift, clockOutShift };