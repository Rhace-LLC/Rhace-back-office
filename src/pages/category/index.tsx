import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Pagination } from "@/components/pagination";
import RenderTableData from "./render_table";

import { ContentHOC } from "@/components/nocontent";
import GenericSheet from "@/components/generic_sheet_overlay";
import AddCategoryForm from "./add_category";
import { CATEGORY_LIST_KEY, useCategoryData } from "./useCategoryData";

const PAGE_SIZE = 10;

const CategoryPage: React.FC = () => {
  const [addSheetOpen, setAddSheetOpen] = useState<boolean>(false);

  const [page, setPage] = useState(1);

  const dataStore = useSelector((state: RootState) => state.category);
  const allCategories = dataStore.data[CATEGORY_LIST_KEY];

  const {
    fetchAllData,
    loading: fetchAllDataLoading,
    error: fetchAllDataError,
  } = useCategoryData();

  // The endpoint returns every category, so paginate client-side.
  const totalPages = Math.max(
    1,
    Math.ceil((allCategories?.length ?? 0) / PAGE_SIZE)
  );
  const toShow = React.useMemo(
    () => (allCategories ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [allCategories, page]
  );

  // Fetch once; the list is kept in the store afterwards.
  useEffect(() => {
    if (!allCategories) fetchAllData();
  }, [allCategories, fetchAllData]);

  // Keep the current page valid if the list shrinks.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <PageContainer>
      <PageHeader
        title="Menu Categories"
        description="Add unique categories of dishes."
        actions={
          <Button onClick={() => setAddSheetOpen(true)}>
            <Plus /> Add Category
          </Button>
        }
      />

      <ContentHOC
        loading={fetchAllDataLoading}
        error={!!fetchAllDataError}
        noContent={toShow.length === 0}
        loadingText="Fetching Categories. Please Wait."
        noContentMessage="Reload Categories List"
        noContentBtnText="Reload Categories"
        noContentAction={fetchAllData}
        errMessage={fetchAllDataError || "Failed to load categories."}
        actionFn={fetchAllData}
      >
        <RenderTableData data={toShow} />
      </ContentHOC>

      {/* Pagination (hidden when everything fits on one page) */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

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
    </PageContainer>
  );
};

export default CategoryPage;
