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

const ManageInventoryPage: React.FC = () => {
  const auth = useAuth();

  const [viewInventoryOpen, setViewInventoryOpen] = useState(false);
  const [addInventoryOpen, setAddInventoryOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Example click handler to simulate opening the view sheet
  const handleViewItem = (item: any) => {
    setSelectedItem(item);
    setViewInventoryOpen(true);
  };

  const [viewState, setViewState] = useState<"normal" | "search" | "filter">(
    "normal"
  );

  const [page, setPage] = useState(1);
  const page_size = 8;

  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [dataDisposable, setDataDisposable] = useState<
    Record<string, InventoryItem[]>
  >({});

  const [filters, setFilters] = useState<any>({
    searchTerm: "",
    category: "",
  });
  const { loading, error, fetchAllData } = useInventory({ page: 1 });
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

  const fetchDataWithFiltersAndSearch = async () => {
    try {
      setFetchLoading(true);
      setFetchError("");
      const res = await getInventoryItems({ page, page_size }, auth.token);

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
  };

  const handleBack = () => {
    setFilters({ searchTerm: "", category: "" });
    setViewState("normal");
    setPage(1);
    //setTotalItems(dataStore.data_total);
    setDataDisposable({});
  };

  // Pagination & Effects
  useEffect(() => {
    if (viewState !== "normal") return;
    if (!allData[String(page)]) fetchAllData();
  }, [page, viewState, allData]);

  useEffect(() => {
    if (viewState !== "search" && viewState !== "filter") return;
    if (!dataDisposable[String(page)]) fetchDataWithFiltersAndSearch();
  }, [page, viewState, dataDisposable, filters]);

  useEffect(() => setPage(1), [viewState]);

  useEffect(() => {
    if (filters.category !== "" || filters.searchTerm.trim() !== "") {
      setPage(1);
      setViewState("filter");
      setDataDisposable({});
      fetchDataWithFiltersAndSearch();
    } else handleBack();
  }, [filters.category, filters.searchTerm]);

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

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={page + 1}
        onPageChange={(p) => setPage(p)}
      />

      {/* ✅ Add Inventory Sheet */}
      <GenericSheet
        title={
          <h2 className="text-lg font-bold text-ink">
            New Ingredient Entry{" "}
            <Book className="inline-block h-5 w-5 text-blue-500" />
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
