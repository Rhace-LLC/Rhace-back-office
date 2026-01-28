import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Pagination } from "@/components/pagination";
import RenderTableData from "./render_table";

import { ContentHOC } from "@/components/nocontent";
import GenericSheet from "@/components/generic_sheet_overlay";
import AddCategoryForm from "./add_category";
import { useCategoryData } from "./useCategoryData";

const CategoryPage: React.FC = () => {
  const [addSheetOpen, setAddSheetOpen] = useState<boolean>(false);

  const [page, setPage] = useState(1);

  const dataStore = useSelector((state: RootState) => state.category);
  const allData = dataStore.data;

  // Hook for fetching categories
  const {
    fetchAllData,
    loading: fetchAllDataLoading,
    error: fetchAllDataError,
  } = useCategoryData(page);

  // ========== Normal Mode Slice ==========
  const toShow = React.useMemo(() => {
    return allData[String(page)] ?? [];
  }, [allData, page]);

  // Normal mode pagination
  useEffect(() => {
    const pageData = allData[String(page)];

    if (!pageData) {
      fetchAllData();
    }
  }, [page, allData]);

  
  return (
    <div className="space-y-6 p-5 md:mt-0">
      <div className="mx-auto space-y-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="mt-4 mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
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

          <ContentHOC
            loading={fetchAllDataLoading}
            error={!!fetchAllDataError}
            noContent={toShow.length === 0}
            loadingText="Fetching Categories. Please Wait."
            noContentMessage="Reload Categories List"
            noContentBtnText="Reload Categories"
            noContentAction={fetchAllData}
            errMessage={fetchAllDataError || "Failed to load borrowers."}
            actionFn={fetchAllData}
          >
            <RenderTableData data={toShow} />
          </ContentHOC>

          {/* Categorie Table or Empty State*/}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={page+1}
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
