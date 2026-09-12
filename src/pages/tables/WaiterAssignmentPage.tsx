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
    <div className="space-y-6 p-5 md:mt-0">
      {/* Waiters only see their own shift. */}
      {auth.isWaiter && (
        <WaiterAssignmentView
          onRefresh={() => fetchAssignments(true)}
          assignment={userAssignment}
        />
      )}

      {/* Owners/admins manage everyone. */}
      {canManage && (
        <>
          <div
            className="mb-6 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            id="waiter-assignment"
          >
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                Manage Waiters
              </h3>
              <p className="text-muted-foreground text-sm">
                Assign waiters to tables, track shifts, and prepare for today’s
                service.
              </p>
            </div>

            <div className="flex flex-shrink-0 gap-2">
              <button
                onClick={setUpForToday}
                disabled={setupLoading || assignments.length > 0}
                className="relative flex cursor-pointer items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {setupLoading && (
                  <svg
                    className="mr-2 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )}
                {setupLoading ? "Setting up..." : "Setup for Today"}
              </button>
            </div>
          </div>

          {setupError && (
            <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-red-600">{setupError}</p>
              <button
                onClick={setUpForToday}
                className="flex-shrink-0 cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          <div className="space-y-3">
            {loading && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
                Loading waiter assignments…
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={() => fetchAssignments(true)}
                  className="flex-shrink-0 cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-4">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm text-gray-700">
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
                          className="px-4 py-6 text-center text-sm text-gray-500"
                        >
                          No assignments yet
                        </td>
                      </tr>
                    ) : (
                      assignments.map((assignment) => (
                        <tr
                          key={assignment.id}
                          className="border-t border-gray-200"
                        >
                          <td className="px-4 py-2 font-medium text-gray-800">
                            {assignment.waiter.name}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {assignment.waiter.email}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {assignment.waiter.phone}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
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
    </div>
  );
}

export default WaiterAssignmentPage;
