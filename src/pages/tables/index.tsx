import { useEffect, useMemo, useState } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import GenericSheet from "@/components/generic_sheet_overlay";
import { AddTable } from "./AddTable";
import { TableCard } from "./TableCard";
import { ContentHOC } from "@/components/nocontent";
import { Pagination } from "@/components/pagination";
import { useTableData } from "./useTableData";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import {
  Assignment,
  assignWaitersForTheDay,
  getWaitersTableAssignments,
} from "@/api-services/menu.service";
import { useAuth } from "@/contexts/AuthContext";
//import { getStaffByRole, Staff } from "@/api-services/staffService";
import { parseError } from "@/api-services/utils/parseError";

export function TablesPage() {
  const auth = useAuth();
  const [isWaiterManagement, setIsWaiterManagement] = useState(false);
  const [addTableOpen, setAddTableOpen] = useState(false);

  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const page_size = 8;
  const total_pages = Math.ceil(totalItems / page_size);

  const dataStore = useSelector((state: RootState) => state.table);
  const allData = dataStore.data;

  // Normal Mode
  const toShow = useMemo(() => allData[String(page)] ?? [], [allData, page]);

  const { fetchLoading, fetchError, fetchAllData } = useTableData({
    page,
    page_size,
  });

  const [waiterAssignmentReqLoading, setWaiterAssignmentReqLoading] =
    useState(false);
  const [waiterAssignmentReqError, setWaiterAssignmentReqError] = useState<
    string | null
  >(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const fetchWaiterAssignment = async () => {
    setWaiterAssignmentReqLoading(true);
    setWaiterAssignmentReqError(null);

    try {
      const response = await getWaitersTableAssignments({}, {}, auth?.token);
      setAssignments(response.assignments);
      if (response.assignments.length === 0) {
        setUpForToday();
      }
    } catch (error: any) {
      const errorMessage = parseError(error);
      setWaiterAssignmentReqError(
        errorMessage || "Unable to fetch waiters at the moment"
      );
      throw error;
    } finally {
      setWaiterAssignmentReqLoading(false);
    }
  };
/*


  const [waiters, setWaiters] = useState<Staff[]>([]);
  const [waiterReqLoading, setWaiterReqLoading] = useState(false);
  const [waiterReqError, setWaiterReqError] = useState<string | null>(null);

  const fetchWaiters = async () => {
    setWaiterReqLoading(true);
    setWaiterReqError(null);

    try {
      const byRole = await getStaffByRole(auth.token, "waiter");

      setWaiters(byRole);
    } catch (error: any) {
      const errorMessage = parseError(error);
      setWaiterReqError(
        errorMessage || "Unable to fetch waiters at the moment"
      );
    } finally {
      setWaiterReqLoading(false);
    }
  };
*/

  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const setUpForToday = async () => {
    setSetupLoading(true);
    setSetupError(null);

    try {
      await assignWaitersForTheDay({}, {}, auth.token);
      fetchWaiterAssignment();
    } catch (error: any) {
      console.error("Failed to setup waiters for today", error);
      setSetupError(error?.message || "Unable to assign waiters for today");
      throw error; // rethrow if caller wants to handle it
    } finally {
      setSetupLoading(false);
    }
  };

  useEffect(() => setTotalItems(dataStore?.data_total || 0), [dataStore]);

  useEffect(() => {
    if (!toShow || toShow.length === 0) {
      fetchAllData();
    }
  }, []);

  useEffect(() => {
    if (isWaiterManagement && assignments.length == 0) {
      fetchWaiterAssignment();
    }
  }, [isWaiterManagement]);

  return (
    <div className="space-y-6 p-5 md:mt-0">
      {!isWaiterManagement && (
        <>
          <div className="mb-6 flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Manage your daily waiter assignments to tables. Assign waiters
                efficiently and keep track of service flow.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  setIsWaiterManagement(true);
                }}
                className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Go to Waiter Assignment
              </button>
            </div>
          </div>
          <div className="items-center justify-between sm:flex">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Restaurant Floor Layout
              </h1>
              <p className="text-muted-foreground text-sm">
                Click on any table to view details and manage assignments
              </p>
            </div>
            <div className="mt-5 flex items-center gap-4 sm:mt-0">
              <button
                className="cursor-pointer rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
                onClick={() => setAddTableOpen(true)} // or whatever opens your AddTable modal/sheet
              >
                + Add Table
              </button>
              <Button
                className="w-max cursor-pointer bg-blue-600 px-4 text-white"
                variant="outline"
                size="icon"
                onClick={fetchAllData}
              >
                <RefreshCcw className="h-4 w-4" /> Refresh
              </Button>
            </div>
          </div>

          <ContentHOC
            loading={fetchLoading}
            error={!!fetchError}
            noContent={toShow.length === 0}
            loadingText="Fetching Tables. Please Wait."
            noContentMessage="Reload Table List"
            noContentBtnText="Reload Tables"
            noContentAction={fetchAllData}
            errMessage={fetchError || "Failed to load borrowers."}
            actionFn={fetchAllData}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {toShow.map((table) => (
                <TableCard table={table} />
              ))}
            </div>
          </ContentHOC>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={total_pages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}

      {isWaiterManagement && (
        <>
          <div className="mb-6 flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Go back to managing tables and the restaurant floor layout. View
                table details and continue assignments.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  setIsWaiterManagement(false);
                }}
                className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Back to Table Management
              </button>
            </div>
          </div>
          <div
            className="mb-6 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            id="waiter-assignment"
          >
            {/* Header and Subheading */}
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                Manage Waiters
              </h3>
              <p className="text-muted-foreground text-sm">
                Assign waiters to tables, track shifts, and prepare for today’s
                service.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-shrink-0 gap-2">
              {/* Setup for Today */}
              {/* Setup for Today */}
              <button
                onClick={setUpForToday}
                disabled={setupLoading || assignments.length > 0}
                className={`relative flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50`}
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
              {/* Error message */}
              <p className="text-sm text-red-600">{setupError}</p>

              {/* Retry button */}
              <button
                onClick={async () => {
                  try {
                    await setUpForToday();
                  } catch (err) {
                    // error state is already handled in setUpForToday
                  }
                }}
                className="flex-shrink-0 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          <div className="space-y-3">
            {/* Loading state */}
            {waiterAssignmentReqLoading && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
                Loading waiter assignments…
              </div>
            )}

            {/* Error state */}
            {!waiterAssignmentReqLoading && waiterAssignmentReqError && (
              <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-red-600">
                  {waiterAssignmentReqError}
                </p>
                <button
                  onClick={fetchWaiterAssignment}
                  className="flex-shrink-0 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Waiter assignments list */}
            {!waiterAssignmentReqLoading && !waiterAssignmentReqError && (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-4">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm text-gray-700">
                      <th className="px-4 py-2">Waiter Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Phone</th>
                      <th className="px-4 py-2">Assigned Tables</th>
                      <th className="px-4 py-2">Table Count</th>
                      <th className="px-4 py-2">Notes</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
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
                              .map((t) => t.table_number)
                              .join(", ")}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {assignment.table_count}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {assignment.notes || "-"}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => {
                                // logic to change assigned table for this waiter
                              }}
                              className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                              Change Assigned Table
                            </button>
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

      <GenericSheet
        title="Table"
        subtitle="Add new Table"
        open={addTableOpen}
        onOpenChange={setAddTableOpen}
      >
        <AddTable />
      </GenericSheet>
    </div>
  );
}
