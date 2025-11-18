import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { ContentHOC } from "@/components/nocontent";
import { getMenuItems } from "@/api-services/menu.service";
import { useAuth } from "@/contexts/AuthContext";
import { updateMenuDishData } from "@/store/menu.slice";
import { Switch } from "@/components/ui/switch";
import GenericSheet from "@/components/generic_sheet_overlay";
import { ManageDish } from "./extras";

export const RenderCatDishes = ({ categoryId }: { categoryId: number }) => {
  const auth = useAuth();
  const [viewDishOpen, setViewDishOpen] = useState<boolean>(false);
  const [selectedDish, setSelectedDish] = useState<any>(null);
  const dispatch = useDispatch();

  const toggleDishAvailability = (categoryId: number, dishId: number) => {
    console.log({ categoryId, dishId });
  };

  const [fetchAllDishesLoading, setFetchAllDishesLoading] = useState(false);
  const [fetchAllDishesError, setFetchAllDishesError] = useState("");

  const fetchAllDishes = async () => {
    try {
      setFetchAllDishesLoading(true);
      setFetchAllDishesError("");

      const response = await getMenuItems(auth.restaurants[0].id, auth.token, {
        category: categoryId,
      });
      dispatch(updateMenuDishData({ key: String(categoryId), data: response }));

      console.log("Response: Dishes Data", response);
    } catch (error: any) {
      console.error("Error fetching dishes:", error);
      setFetchAllDishesError(error.message || "Failed to fetch dishes");
    } finally {
      setFetchAllDishesLoading(false);
    }
  };

  const dataStore = useSelector((state: RootState) => state.menu);
  const allCat = dataStore.categoryData;
  const allData = dataStore.data;
  const dishes = allData[categoryId] || [];
  console.log({ dishes });

  useEffect(() => {
    if (!allData[categoryId]) {
      fetchAllDishes();
    }
  }, []);

  console.log("Category from store:", allCat);

  return (
    <ContentHOC
      loading={fetchAllDishesLoading}
      error={!!fetchAllDishesError}
      noContent={dishes?.length === 0}
      loadingText="Fetching Dishes. Please Wait."
      noContentMessage="Reload Dishes List"
      noContentBtnText="Reload Dishes"
      noContentAction={fetchAllDishes}
      errMessage={fetchAllDishesError || "Failed to load borrowers."}
      actionFn={fetchAllDishes}
    >
      {dishes &&
        dishes.map((dish) => {
          return (
            <>
              <Table>
                <TableBody className="w-full py-3">
                  <TableRow key={dish.id} className="grid grid-cols-7">
                    <TableCell className="col-span-3">
                      <div>
                        <div>{dish.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {dish.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>${Number(dish.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={true}
                          onCheckedChange={() =>
                            toggleDishAvailability(categoryId, Number(dish.id))
                          }
                        />
                        <Badge
                          variant={true ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {true ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{`-`}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDish(dish);
                          setViewDishOpen(true);
                        }}
                      >
                        Manage Dish
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <GenericSheet
                open={viewDishOpen}
                onOpenChange={setViewDishOpen}
                title="Manage Dish"
                subtitle="See Dish Details, set availability and update details"
              >
                <ManageDish dish={selectedDish} />
              </GenericSheet>
            </>
          );
        })}
    </ContentHOC>
  );
};
