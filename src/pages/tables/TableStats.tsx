import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, DollarSign, Clock } from "lucide-react";
import formatPrice from "@/utils/formatPrice";

interface Table {
  id: number;
  seats: number;
  status: string;
  waiter: string | null;
  orderValue: number;
  timeOccupied: string | null;
}

interface TableStatsProps {
  tables: Table[];
  occupiedTables: number;
  totalRevenue: number;
}

export const TableStats: React.FC<TableStatsProps> = ({
  tables,
  occupiedTables,
  totalRevenue,
}) => {
  const totalTables = tables.length;
  const occupancyRate =
    totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;
  const availableTables = tables.filter((t) => t.status === "Free").length;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* Table Occupancy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Table Occupancy</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">
            {occupiedTables}/{totalTables}
          </div>
          <p className="text-muted-foreground text-xs">
            {occupancyRate}% occupied
          </p>
        </CardContent>
      </Card>

      {/* Available Tables */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Available Tables</CardTitle>
          <CheckCircle className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{availableTables}</div>
          <p className="text-muted-foreground text-xs">Ready for guests</p>
        </CardContent>
      </Card>

      {/* Active Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Active Revenue</CardTitle>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">{formatPrice(totalRevenue)}</div>
          <p className="text-muted-foreground text-xs">From occupied tables</p>
        </CardContent>
      </Card>

      {/* Average Table Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Avg Table Time</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl">1h 15m</div>
          <p className="text-muted-foreground text-xs">Current session</p>
        </CardContent>
      </Card>
    </div>
  );
};
