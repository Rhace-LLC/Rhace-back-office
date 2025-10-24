import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { RenderCatDishes } from "./renderdish";

export const RenderCatPageData = () => {
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  const dataStore = useSelector((state: RootState) => state.menu);
  const allCat = dataStore.categoryData;

  console.log("Category from store:", allCat);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Menu Categories</CardTitle>
          <CardDescription>
            Expand categories to view and manage dishes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-7">
          {allCat.map((category) => (
            <Collapsible
              key={category.id}
              open={expandedCategories.includes(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  {expandedCategories.includes(category.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {dataStore.data[category.id]?.length || 0} dishes
                  </Badge>
                </div>
                <Badge className="text-xs">No. available</Badge>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3">
                <Table>
                  <TableHeader className="pb-3">
                    <TableRow className="grid grid-cols-7">
                      <TableHead className="col-span-3">Dish Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Add-ons</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
                <div className="py-2" />

                <RenderCatDishes categoryId={category.id} />
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
