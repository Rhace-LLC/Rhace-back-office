import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { useEffect, useMemo, useState } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import GenericSheet from "@/components/generic_sheet_overlay";
import { AddTable } from "./AddTable";
import { TableCard } from "./TableCard";
import { ContentHOC } from "@/components/nocontent";
import { Pagination } from "@/components/pagination";
import { TABLE_LIST_KEY, useTableData } from "./useTableData";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Plus } from "lucide-react";
import { useTableAssignments } from "./useTableAssignments";

/**
 * Table management page — floor layout only.
 * Waiter assignment lives on its own route (`/tables/waiter-assignment`).
 */
/** Tables per page (divisible by 2 and 3 so grid rows stay full). */
const PAGE_SIZE = 9;

export function TablesPage() {
  const [addTableOpen, setAddTableOpen] = useState(false);

  const [page, setPage] = useState(1);

  const dataStore = useSelector((state: RootState) => state.table);
  const allTables = dataStore.data[TABLE_LIST_KEY];

  const { fetchLoading, fetchError, fetchAllData } = useTableData({});

  // The endpoint returns every table, so paginate client-side with a real page
  // count (data_total was never set, so the old count was always 0).
  const totalPages = Math.max(
    1,
    Math.ceil((allTables?.length ?? 0) / PAGE_SIZE)
  );
  const toShow = useMemo(
    () => (allTables ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [allTables, page]
  );

  // Read-only: used to badge each table with its assigned waiter.
  const { tableWaiterMap } = useTableAssignments();

  // Fetch once; the list is kept in the store afterwards.
  useEffect(() => {
    if (!allTables) fetchAllData();
  }, [allTables, fetchAllData]);

  // Keep the current page valid if the list shrinks.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <PageContainer>
      <PageHeader
        title="Tables"
        description="Click on any table to view details and manage assignments"
        actions={
          <>
            <Button onClick={() => setAddTableOpen(true)}>
              <Plus /> Add Table
            </Button>
            <Button variant="outline" onClick={fetchAllData}>
              <RefreshCcw /> Refresh
            </Button>
          </>
        }
      />

      <ContentHOC
        skeleton="grid"
        loading={fetchLoading}
        error={!!fetchError}
        noContent={toShow.length === 0}
        loadingText="Fetching Tables. Please Wait."
        noContentMessage="Reload Table List"
        noContentBtnText="Reload Tables"
        noContentAction={fetchAllData}
        errMessage={fetchError || "Failed to load tables."}
        actionFn={fetchAllData}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {toShow.map((table) => (
            <TableCard key={table.id} table={table} waiterName={tableWaiterMap[table.id]} />
          ))}
        </div>
      </ContentHOC>

      {/* Pagination (hidden when everything fits on one page) */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      <GenericSheet
        title="Table"
        subtitle="Add new Table"
        open={addTableOpen}
        onOpenChange={setAddTableOpen}
      >
        <AddTable />
      </GenericSheet>
    </PageContainer>
  );
}
