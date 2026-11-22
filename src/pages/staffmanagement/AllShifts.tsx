import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import formatPrice from "@/utils/formatPrice";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { useCallback, useEffect, useState } from "react";
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


  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getShiftLogs(token);
      setShifts(response || []);
      setFilteredShifts(response || []);
    } catch {
      setError("Failed to load shift records");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

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
    <PageContainer>
      <PageHeader
        title="Shift Logs"
        description="View and monitor all staff clock-ins, clock-outs, and logged sales."
        actions={
          <>
            <Input
              type="text"
              placeholder="Search user ID or shift ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" onClick={fetchShifts} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">

      {/* Content area */}
      {loading ? (
        <div className="p-12 text-center text-ink-muted">Loading shift logs...</div>
      ) : error ? (
        <div className="p-12 text-center text-danger">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-inset text-xs font-semibold uppercase text-ink-muted border-b border-line-subtle">
                <th className="px-6 py-3">Shift ID</th>
                <th className="px-6 py-3">User ID</th>
                <th className="px-6 py-3">Clock In</th>
                <th className="px-6 py-3">Clock Out</th>
                <th className="px-6 py-3 text-right">Total Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle text-sm text-ink-secondary">
              {filteredShifts.length > 0 ? (
                filteredShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-inset">
                    <td className="px-6 py-4 font-medium text-ink">#{shift.id}</td>
                    <td className="px-6 py-4 font-mono text-xs text-ink-secondary">{shift.user}</td>
                    <td className="px-6 py-4">{formatDate(shift.clock_in)}</td>
                    <td className="px-6 py-4">
                      {shift.clock_out ? (
                        formatDate(shift.clock_out)
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold text-success bg-success-soft rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-ink">
                      {formatPrice(shift.total_sales ?? 0)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-ink-subtle">
                    No shift logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </PageContainer>
  );
};