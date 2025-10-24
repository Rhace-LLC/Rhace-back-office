"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, DollarSign } from "lucide-react";

interface MenuStatsProps {
  totalDishes: number;
  availableDishes: number;
  categories: { id: number; name: string }[];
  averagePrice: number;
}

export const MenuStats: React.FC<MenuStatsProps> = ({
  totalDishes,
  availableDishes,
  categories,
  averagePrice,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* Total Dishes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Total Dishes</CardTitle>
          <UtensilsCrossed className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{totalDishes}</div>
          <p className="text-muted-foreground text-xs">
            Across {categories.length} categories
          </p>
        </CardContent>
      </Card>

      {/* Available Dishes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Available</CardTitle>
          <Badge variant="default" className="text-xs">
            {availableDishes}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{availableDishes}</div>
          <p className="text-muted-foreground text-xs">Currently available</p>
        </CardContent>
      </Card>

      {/* Unavailable Dishes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Unavailable</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {totalDishes - availableDishes}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">
            {totalDishes - availableDishes}
          </div>
          <p className="text-muted-foreground text-xs">Out of stock</p>
        </CardContent>
      </Card>

      {/* Average Price */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Avg Price</CardTitle>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">
            ${averagePrice.toFixed(2)}
          </div>
          <p className="text-muted-foreground text-xs">Per dish</p>
        </CardContent>
      </Card>
    </div>
  );
};
