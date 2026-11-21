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

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={page + 1}
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
    </PageContainer>
  );
};

export default CategoryPage;
