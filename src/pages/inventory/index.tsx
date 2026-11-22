import { useStableCallback } from "@/hooks/useStableCallback";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { parseError } from "@/api-services/utils/parseError";
import { RootState } from "@/store/store";
import { Pagination } from "@/components/pagination";
//import InventoryFilters from "./inventory_filters";

import { ContentHOC } from "@/components/nocontent";
import {
  InventoryItem,
  //  updateInventoryTotal,
} from "@/store/inventory.slice";
import { useAuth } from "@/contexts/AuthContext";
import { getInventoryItems } from "@/api-services/inventory.service";
import RenderInventoryTableData from "./inventory_table";
import GenericSheet from "@/components/generic_sheet_overlay";
import { AddInventoryItem } from "./AddInventoryItem";
import { ViewInventoryItem } from "./ViewInventoryItem";
import { useInventory } from "./useInventory";
import { Book, RefreshCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Items per page — must match what useInventory requests from the API. */
const PAGE_SIZE = 10;

const ManageInventoryPage: React.FC = () => {
  const auth = useAuth();

  const [viewInventoryOpen, setViewInventoryOpen] = useState(false);
  const [addInventoryOpen, setAddInventoryOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Opens the view sheet for an inventory item
  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setViewInventoryOpen(true);
  };

  const [viewState, setViewState] = useState<"normal" | "search" | "filter">(
    "normal"
  );

  const [page, setPage] = useState(1);
  const page_size = PAGE_SIZE;
  // Filter/search mode keeps its own total (from the same paginated endpoint).
  const [filterTotal, setFilterTotal] = useState(0);

  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [dataDisposable, setDataDisposable] = useState<
    Record<string, InventoryItem[]>
  >({});

  const [filters, setFilters] = useState<{ searchTerm: string; category: string }>({
    searchTerm: "",
    category: "",
  });
  // Fetches the CURRENT page (it used to be hard-coded to page 1, so page 2+
  // never loaded) and re-fetches when the page changes.
  const { loading, error, fetchAllData } = useInventory({
    page,
    page_size: PAGE_SIZE,
  });
  const dataStore = useSelector((state: RootState) => state.inventory);
  const allData = dataStore.data;

  // Normal Mode
  const toShow = React.useMemo(
    () => allData[String(page)] ?? [],
    [allData, page]
  );

  // Filter/Search Mode
  const toShowWithFilters = React.useMemo(
    () => dataDisposable[String(page)] ?? [],
    [page, dataDisposable]
  );

  const fetchDataWithFiltersAndSearch = useStableCallback(async () => {
    try {
      setFetchLoading(true);
      setFetchError("");
      const res = await getInventoryItems({ page, page_size }, auth.token);
      setFilterTotal(res.count ?? res.results.length);

      setDataDisposable((prev) => {
        const existing = prev[String(page)] ?? [];
        const combined = [...existing, ...res.results];
        const unique = combined.filter(
          (item, index, self) =>
            index === self.findIndex((p) => p.id === item.id)
        );
        return { ...prev, [String(page)]: unique };
      });
    } catch (error) {
      setFetchError(parseError(error) || "Failed to fetch inventory.");
    } finally {
      setFetchLoading(false);
    }
  });

  const handleBack = () => {
    setFilters({ searchTerm: "", category: "" });
    setViewState("normal");
    setPage(1);
    //setTotalItems(dataStore.data_total);
    setDataDisposable({});
  };

  // Pagination & Effects
  // Normal mode: useInventory fetches the current page itself when it changes.

  // Real page count from the API total (it used to be `page + 1`, which
  // always offered a next page).
  const totalItems = viewState === "normal" ? dataStore.data_total : filterTotal;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  // Keep the current page valid if the total shrinks (e.g. items deleted).
  useEffect(() => {
    if (totalItems > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages, totalItems]);

  useEffect(() => {
    if (viewState !== "search" && viewState !== "filter") return;
    if (!dataDisposable[String(page)]) fetchDataWithFiltersAndSearch();
  }, [page, viewState, dataDisposable, filters, fetchDataWithFiltersAndSearch]);

  useEffect(() => setPage(1), [viewState]);

  useEffect(() => {
    if (filters.category !== "" || filters.searchTerm.trim() !== "") {
      setPage(1);
      setViewState("filter");
      setDataDisposable({});
      fetchDataWithFiltersAndSearch();
    } else handleBack();
  }, [filters.category, filters.searchTerm, fetchDataWithFiltersAndSearch]);

  return (
    <PageContainer>
      <PageHeader
        title="Inventory"
        description="Track and manage your inventory items."
        actions={
          <>
            <Button
              onClick={() => {
                setSelectedItem(null);
                setAddInventoryOpen(true);
              }}
            >
              <Plus /> Add Inventory Item
            </Button>
            <Button variant="outline" onClick={fetchAllData}>
              <RefreshCcw /> Refresh
            </Button>
          </>
        }
      />

      {/* Inventory Table */}
      {viewState === "normal" ? (
        <ContentHOC
          loading={loading}
          error={!!error}
          noContent={toShow.length === 0}
          loadingText="Fetching Inventory..."
          noContentMessage="No Inventory Found"
          noContentBtnText="Reload"
          noContentAction={fetchAllData}
          errMessage={fetchError}
          actionFn={fetchAllData}
        >
          <RenderInventoryTableData data={toShow} onView={handleViewItem} />
        </ContentHOC>
      ) : (
        <ContentHOC
          loading={fetchLoading}
          error={!!fetchError}
          noContent={toShowWithFilters.length === 0}
          loadingText="Fetching Filtered Inventory..."
          noContentBtnText="Refresh"
          errMessage={fetchError}
          noContentMessage="No items found"
          noContentAction={fetchDataWithFiltersAndSearch}
          actionFn={fetchDataWithFiltersAndSearch}
        >
          <RenderInventoryTableData
            data={toShowWithFilters}
            onView={handleViewItem}
          />
        </ContentHOC>
      )}

      {/* Pagination (hidden when everything fits on one page) */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* ✅ Add Inventory Sheet */}
      <GenericSheet
        title={
          <h2 className="text-lg font-bold text-ink">
            New Ingredient Entry{" "}
            <Book className="inline-block h-5 w-5 text-brand" />
          </h2>
        }
        subtitle="Add new inventory item"
        open={addInventoryOpen}
        onOpenChange={setAddInventoryOpen}
      >
        <AddInventoryItem
          onSuccess={() => setAddInventoryOpen(false)}
          currentPage={String(page)}
        />
      </GenericSheet>

      {/* ✅ View Inventory Sheet — only show if an item is selected */}
      {selectedItem && (
        <GenericSheet
          title="Inventory Item"
          subtitle="View item details"
          open={viewInventoryOpen}
          onOpenChange={setViewInventoryOpen}
        >
          <ViewInventoryItem item={selectedItem} />
        </GenericSheet>
      )}
    </PageContainer>
  );
};

export default ManageInventoryPage;
