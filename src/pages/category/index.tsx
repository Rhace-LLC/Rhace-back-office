import React, { useEffect, useState } from "react";
import { LucideDownload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { parseError } from "@/api-services/utils/parseError";
import { RootState } from "@/store/store";
import { Pagination } from "@/components/pagination";
import RenderTableData from "./render_table";

import { ContentHOC } from "@/components/nocontent";
import {
  CategoryData,
  updateCategoryData,
  updateCategoryTotal,
} from "@/store/category.slice";
import { getAllCategories } from "@/api-services/menu.service";
import { useAuth } from "@/contexts/AuthContext";
import GenericSheet from "@/components/generic_sheet_overlay";
import AddCategoryForm from "./add_category";

const CategoryPage: React.FC = () => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const [addSheetOpen, setAddSheetOpen] = useState<boolean>(false);

  const [viewState, setViewState] = useState<"normal" | "search" | "filter">(
    "normal"
  );

  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const page_size = 8;
  const total_pages = Math.ceil(totalItems / page_size);

  const [fetchAllDataLoading, setFetchAllDataLoading] = useState(false);
  const [fetchAllDataError, setFetchAllDataError] = useState("");
  const [dataDisposable, setDataDisposable] = useState<Record<string, CategoryData[]>>(
    {}
  );

  const [filters, setFilters] = useState<any>({
    searchTerm: "",
    level: "",
  });

  const dataStore = useSelector((state: RootState) => state.category);
  const allData = dataStore.data;

  // ========== Normal Mode Slice ==========
  const toShow = React.useMemo(() => {
    return allData[String(page)] ?? [];
  }, [allData, page]);

  //console.log({ toShow });

  // ========== Filter/Search Mode Slice ==========
  const toShowWithFilters = React.useMemo(() => {
    return dataDisposable[String(page)] ?? [];
  }, [page, dataDisposable]);

  // ========== API Calls ==========
  const fetchAllData = async () => {
    try {
      setFetchAllDataLoading(true);
      setFetchAllDataError("");
      let res = await getAllCategories(auth.token);
      console.log("Category Data Response", res);
      dispatch(updateCategoryData({ key: String(page), data: res }));
      dispatch(updateCategoryTotal({ data_total: 69 }));
    } catch (error) {
      console.error(error);
      const errorMessage = parseError(error) || "Failed to fetch borrowers.";
      setFetchAllDataError(errorMessage);
    } finally {
      setFetchAllDataLoading(false);
    }
  };

  const fetchDataWithFiltersAndSearch = async () => {
    try {
      setFetchAllDataLoading(true);
      setFetchAllDataError("");

      let res = await getAllCategories(auth.token);
      setTotalItems(50);
      setDataDisposable((prev) => {
        const existing = prev[String(page)] ?? [];
        const combined = [...existing, ...res];
        const unique = combined.filter(
          (item, index, self) =>
            index === self.findIndex((p) => p.id === item.id)
        );
        return { ...prev, [String(page)]: unique };
      });
    } catch (error) {
      console.error(error);
      const errorMessage = parseError(error) || "Failed to fetch borrowers.";
      setFetchAllDataError(errorMessage);
    } finally {
      setFetchAllDataLoading(false);
    }
  };

  // ========== Handlers ==========
  /*  
  const onSearch = () => {
    setPage(1);
    setDataDisposable({});
    fetchDataWithFiltersAndSearch();
    setViewState("search");
  };
  */
  const handleBack = () => {
    setFilters({ searchTerm: "", level: "" });
    setViewState("normal");
    setPage(1);
    setTotalItems(dataStore.data_total);
    setDataDisposable({});
  };

  // Normal mode pagination
  useEffect(() => {
    if (viewState !== "normal") return;

    const pageData = allData[String(page)];

    if (!pageData) {
      fetchAllData();
    }
  }, [page, viewState, allData]);

  // Search + Filter pagination
  useEffect(() => {
    if (viewState !== "search" && viewState !== "filter") return;

    const pageData = dataDisposable[String(page)];

    if (!pageData) {
      fetchDataWithFiltersAndSearch();
    }
  }, [page, viewState, dataDisposable, filters]);

  useEffect(() => {
    setPage(1);
  }, [viewState]);

  // watch filters
  useEffect(() => {
    if (filters.level !== "" || filters.searchTerm.trim() !== "") {
      setPage(1);
      setViewState("filter");
      setDataDisposable({});
      fetchDataWithFiltersAndSearch();
    } else {
      handleBack();
    }
  }, [filters.level]);

  useEffect(() => {
    setTotalItems(dataStore.data_total);
  }, [dataStore]);

  return (
    <div className="space-y-6 p-5 md:mt-0">
      <div className="mx-auto space-y-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="mt-4 mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium tracking-tight">
                Manage Menu Category
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add unique categories of dishes.
              </p>
            </div>

            <button
              type="button"
              className="cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-200"
              onClick={() => {
                // open modal or navigate to create category
                setAddSheetOpen(true);
                console.log("Add Category clicked");
              }}
            >
              + Add Category
            </button>
          </div>

          <div className="!hidden">
            <div className="items-center space-x-3">
              <button className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50">
                <LucideDownload className="mr-2 h-4 w-4" aria-hidden="true" />
                Export Queue
              </button>
            </div>
          </div>

          {/* Stats Cards 
          <CategorieStats />*/}

          {/* Search and Filters
          <CategorieFiltersComp
            filters={filters}
            setFilters={setFilters}
            onSearch={onSearch}
          /> */}

          {viewState === "normal" ? (
            <ContentHOC
              loading={fetchAllDataLoading}
              error={!!fetchAllDataError}
              noContent={toShow.length === 0}
              loadingText="Fetching Categories. Please Wait."
              noContentMessage="Reload Categorie List"
              noContentBtnText="Reload Categories"
              noContentAction={fetchAllData}
              errMessage={fetchAllDataError || "Failed to load borrowers."}
              actionFn={fetchAllData}
            >
              <RenderTableData data={toShow} />
            </ContentHOC>
          ) : (
            <>
              {viewState === "search" && (
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-lg font-medium">Search Results</p>
                  <button
                    onClick={handleBack}
                    className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                  >
                    Back
                  </button>
                </div>
              )}
              {viewState === "filter" && (
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-lg font-medium">Filtered Results</p>
                  <button
                    onClick={handleBack}
                    className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                  >
                    Back
                  </button>
                </div>
              )}

              <ContentHOC
                loading={fetchAllDataLoading}
                error={!!fetchAllDataError}
                noContent={toShowWithFilters.length === 0}
                loadingText="Fetching Data with filters and search parameters. Please Wait."
                noContentBtnText="Refresh"
                errMessage={fetchAllDataError || "Failed to load data"}
                noContentMessage="No Content Found For your search / filter"
                noContentAction={fetchDataWithFiltersAndSearch}
                actionFn={fetchDataWithFiltersAndSearch}
              >
                <RenderTableData data={toShowWithFilters} />
              </ContentHOC>
            </>
          )}

          {/* Categorie Table or Empty State*/}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={total_pages}
        onPageChange={(p) => setPage(p)}
      />

      {
        <GenericSheet
          open={addSheetOpen}
          onOpenChange={setAddSheetOpen}
          title="Add Category"
          subtitle="Add necessary category details and image"
        >
          <AddCategoryForm onSubmit={() => setAddSheetOpen(false)} />
        </GenericSheet>
      }
    </div>
  );
};

export default CategoryPage;
