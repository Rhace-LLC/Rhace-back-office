import { useState, useEffect } from "react";
import { getShiftLogs, clockInShift, clockOutShift, ShiftLog } from "@/api-services/shift.service";
import { useAuth } from "@/contexts/AuthContext";


export const StaffShiftWidget = () => {
  
      const auth = useAuth()
      const token = auth?.token;
  const [activeShift, setActiveShift] = useState<ShiftLog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch shift logs on mount to determine current clock-in state
  const fetchCurrentStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getShiftLogs(token);
      const shifts: ShiftLog[] = response as ShiftLog[]; // Ensure correct typing
      
      // Find shift where user is currently clocked in (clock_out is null or equals clock_in)
      const current = shifts.find((shift) => !shift.clock_out) || null;
      setActiveShift(current);
    } catch (err: any) {
      setError("Failed to fetch shift status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentStatus();
  }, [token]);

  const handleClockIn = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await clockInShift({}, token);
      setActiveShift(res);
    } catch (err: any) {
      setError("Failed to clock in");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await clockOutShift({}, token);
      setActiveShift(null);
    } catch (err: any) {
      setError("Failed to clock out");
    } finally {
      setActionLoading(false);
    }
  };

  const isClockedIn = !!activeShift;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isClockedIn ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Shift Status</h2>
          <p className="text-sm text-gray-500">
            {loading
              ? "Checking status..."
              : isClockedIn
              ? `Clocked in since ${new Date(activeShift.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : "Currently off the clock"}
          </p>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={isClockedIn ? handleClockOut : handleClockIn}
        disabled={loading || actionLoading}
        className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm ${
          isClockedIn
            ? "bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300"
            : "bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-300"
        }`}
      >
        {actionLoading
          ? "Processing..."
          : isClockedIn
          ? "Clock Out"
          : "Clock In"}
      </button>
    </div>
  );
};