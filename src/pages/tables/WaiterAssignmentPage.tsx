import { ListSkeleton } from "@/components/ui/loading-skeletons";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTableAssignments } from "./useTableAssignments";
import { WaiterAssignmentView } from "./WaiterAssignmentView";

/**
 * Waiter assignment page — decoupled from table management.
 * Reachable at `/tables/waiter-assignment`.
 */
export function WaiterAssignmentPage() {
  const auth = useAuth();

  const {
    assignments,
    loading,
    error,
    setupLoading,
    setupError,
    userAssignment,
    fetchAssignments,
    setUpForToday,
  } = useTableAssignments({ autoAssignOnEmpty: true });

  const canManage = auth.isOwner || auth.isAdmin;

  return (
    <PageContainer>
      <PageHeader
        title={canManage ? "Waiter Assignment" : "My Table Assignment"}
        description={
          canManage
            ? "Assign waiters to tables, track shifts, and prepare for today’s service."
            : "The tables you are looking after today."
        }
        actions={
          canManage && (
            <Button
              onClick={setUpForToday}
              disabled={setupLoading || assignments.length > 0}
            >
              {setupLoading && <Loader2 className="animate-spin" />}
              {setupLoading ? "Setting up..." : "Setup for Today"}
            </Button>
          )
        }
      />

      {/* Waiters only see their own shift. */}
      {auth.isWaiter && (
        <WaiterAssignmentView
          onRefresh={() => fetchAssignments(true)}
          assignment={userAssignment}
          isLoading={loading}
        />
      )}

      {/* Owners/admins manage everyone. */}
      {canManage && (
        <>

          {setupError && (
            <div className="flex flex-col gap-3 rounded-md border border-danger-line bg-danger-soft p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-danger">{setupError}</p>
              <button
                onClick={setUpForToday}
                className="flex-shrink-0 cursor-pointer rounded-md bg-danger px-4 py-2 text-sm font-medium text-white transition hover:bg-danger-strong"
              >
                Retry
              </button>
            </div>
          )}

          <div className="space-y-3">
            {loading && (
              <ListSkeleton rows={3} label="Loading waiter assignments…" />
            )}

            {!loading && error && (
              <div className="flex flex-col gap-3 rounded-md border border-danger-line bg-danger-soft p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-danger">{error}</p>
                <button
                  onClick={() => fetchAssignments(true)}
                  className="flex-shrink-0 cursor-pointer rounded-md bg-danger px-4 py-2 text-sm font-medium text-white transition hover:bg-danger-strong"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="overflow-x-auto rounded-md border border-line bg-surface p-4">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-inset text-left text-sm text-ink-secondary">
                      <th className="px-4 py-2">Waiter Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Phone</th>
                      <th className="px-4 py-2">Assigned Tables</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center text-sm text-ink-muted"
                        >
                          No assignments yet
                        </td>
                      </tr>
                    ) : (
                      assignments.map((assignment) => (
                        <tr
                          key={assignment.id}
                          className="border-t border-line"
                        >
                          <td className="px-4 py-2 font-medium text-ink">
                            {assignment.waiter.name}
                          </td>
                          <td className="px-4 py-2 text-ink-secondary">
                            {assignment.waiter.email}
                          </td>
                          <td className="px-4 py-2 text-ink-secondary">
                            {assignment.waiter.phone}
                          </td>
                          <td className="px-4 py-2 text-ink-secondary">
                            {assignment.tables
                              .map((t) => `Table ${t.table_number}`)
                              .join(", ")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </PageContainer>
  );
}

export default WaiterAssignmentPage;
