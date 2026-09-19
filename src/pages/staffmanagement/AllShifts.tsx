import { useState, useEffect } from "react";
import { getShiftLogs, ShiftLog } from "@/api-services/shift.service";
import { useAuth } from "@/contexts/AuthContext";

export const AllShiftsAdmin = () => {
    const auth = useAuth()
    const token = auth?.token;
  const [shifts, setShifts] = useState<ShiftLog[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<ShiftLog[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const fetchShifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getShiftLogs(token);
      setShifts(response || []);
      setFilteredShifts(response || []);
    } catch (err: any) {
      setError("Failed to load shift records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [token]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredShifts(shifts);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredShifts(
        shifts.filter(
          (s) =>
            s.user.toLowerCase().includes(lower) ||
            s.id.toString().includes(lower)
        )
      );
    }
  }, [searchTerm, shifts]);

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">All Restaurant Shift Logs</h1>
          <p className="text-sm text-gray-500">
            View and monitor all staff clock-ins, clock-outs, and logged sales.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search user ID or shift ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={fetchShifts}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Content area */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading shift logs...</div>
      ) : error ? (
        <div className="p-12 text-center text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3">Shift ID</th>
                <th className="px-6 py-3">User ID</th>
                <th className="px-6 py-3">Clock In</th>
                <th className="px-6 py-3">Clock Out</th>
                <th className="px-6 py-3 text-right">Total Sales ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredShifts.length > 0 ? (
                filteredShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">#{shift.id}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{shift.user}</td>
                    <td className="px-6 py-4">{formatDate(shift.clock_in)}</td>
                    <td className="px-6 py-4">
                      {shift.clock_out ? (
                        formatDate(shift.clock_out)
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      ${Number(shift.total_sales).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No shift logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};