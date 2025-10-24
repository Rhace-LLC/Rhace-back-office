import { useEffect, useState } from "react";

import { Plus } from "lucide-react";
import { parseError } from "@/api-services/utils/parseError";
import { getAllCategories } from "@/api-services/menu.service";
import { useAuth } from "@/contexts/AuthContext";
import GenericSheet from "@/components/generic_sheet_overlay";
import { AddDish } from "./extras";
import { MenuStats } from "./MenuStats";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ContentHOC } from "@/components/nocontent";
import { RenderCatPageData } from "./rendercat";
import { updatMenuCategoryData } from "@/store/menu.slice";
import { Button } from "@/components/ui/button";

export function MenuManagement() {
  const auth = useAuth();
  const dispatch = useDispatch();

  const [addDishOpen, setAddDishOpen] = useState<boolean>(false);

  const dataStore = useSelector((state: RootState) => state.menu);
  const allData = dataStore.categoryData;

  const [fetchCategoryLoading, setFetchCategoryLoading] = useState(false);
  const [fetchCategoryError, setFetchCategoryError] = useState("");

  const fetchCategory = async () => {
    try {
      setFetchCategoryLoading(true);
      setFetchCategoryError("");

      const response = await getAllCategories(auth.token);
      console.log("Menu Data Response:", response);
      dispatch(updatMenuCategoryData(response));
    } catch (error: any) {
      console.error("Fetch Category Error:", error);
      const errorMessage = parseError(error) || "Failed to fetch categories.";
      setFetchCategoryError(errorMessage);
    } finally {
      setFetchCategoryLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);
  return (
    <div className="mt-15 space-y-6 p-5 md:mt-0">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">
            Menu Management
          </h1>
          <p className="text-muted-foreground">
            Manage dishes, categories, and availability
          </p>
        </div>
        <Button onClick={() => setAddDishOpen(true)} className="bg-[#2542e3]">
          <Plus className="mr-1 h-4 w-4" />
          Add Dish
        </Button>
      </div>

      <MenuStats
        totalDishes={24}
        availableDishes={18}
        categories={[]}
        averagePrice={12.5}
      />

      <ContentHOC
        loading={fetchCategoryLoading}
        error={!!fetchCategoryError}
        noContent={allData.length === 0}
        loadingText="Fetching Categories. Please Wait."
        noContentMessage="Reload Categorie List"
        noContentBtnText="Reload Categories"
        noContentAction={fetchCategory}
        errMessage={fetchCategoryError || "Failed to load borrowers."}
        actionFn={fetchCategory}
      >
        <RenderCatPageData />
      </ContentHOC>

      <GenericSheet
        open={addDishOpen}
        onOpenChange={setAddDishOpen}
        title="Add Dish"
        subtitle="See  Details, set availability and update details"
      >
        <AddDish />
      </GenericSheet>
    </div>
  );
}
