import { useEffect, useMemo, useState } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import GenericSheet from "@/components/generic_sheet_overlay";
import { AddTable } from "./AddTable";
import { TableCard } from "./TableCard";
import { ContentHOC } from "@/components/nocontent";
import { Pagination } from "@/components/pagination";
import { useTableData } from "./useTableData";

export function TablesPage() {
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

  useEffect(() => setTotalItems(dataStore?.data_total || 0), [dataStore]);

  useEffect(() => {
    if (!toShow || toShow.length === 0) {
      fetchAllData();
    }
  }, []);

  return (
    <div className="mt-15 space-y-6 p-5 md:mt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Restaurant Floor Layout
          </h1>
          <p className="text-muted-foreground text-sm">
            Click on any table to view details and manage assignments
          </p>
        </div>

        <button
          className="cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
          onClick={() => setAddTableOpen(true)} // or whatever opens your AddTable modal/sheet
        >
          + Add Table
        </button>
      </div>

      {/*
        <TableStats tables={tables} occupiedTables={occupiedTables} totalRevenue={totalRevenue} />
       
        
        */}
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
