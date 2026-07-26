"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Upload, FileText } from "lucide-react";

import { RootState } from "@/store/store";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuItemsData } from "./useMenuItemData";

import GenericSheet from "@/components/generic_sheet_overlay";
import { ContentHOC } from "@/components/nocontent";
import { ManageDish } from "./ManageDish";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  MenuItem,
  toggleMenuItemAvailability,
} from "@/api-services/menu.service";
import { Pagination } from "@/components/pagination";
import { updateMenuItemById } from "@/store/menu.slice";
import { AddDish } from "./AddDish";
import { DraftList } from "./DraftList";
import { BulkUploadModal } from "./BulkUploadModal";

export function MenuManagement() {
  const auth = useAuth();
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);

  // Modals
  const [addDishOpen, setAddDishOpen] = useState(false);
  const [viewDishOpen, setViewDishOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [draftsListOpen, setDraftsListOpen] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | undefined>(undefined);

  // Selected dish
  const [selectedDish, setSelectedDish] = useState<any>(null);

  // MenuItems state from Redux
  const dataStore = useSelector((state: RootState) => state.menu);
  const allData = dataStore.data;

  const toShow = useMemo(() => allData[String(page)] ?? [], [allData, page]);

  const { loading, error, fetchAllData } = useMenuItemsData(page);

  // Fetch data on mount or page change
  useEffect(() => {
    if (toShow.length == 0) fetchAllData();
  }, [page]);

  // Toggle availability handler
  const handleToggleAvailability = async (dish: MenuItem) => {
    toast.info("Updating Status... Please Wait");
    try {
      const updatedDish = await toggleMenuItemAvailability(
        auth.restaurants[0].id,
        dish.id,
        auth.token
      );
      dispatch(updateMenuItemById({ ...dish, available: !dish.available }));
      toast.success(
        `${updatedDish?.name} is now ${
          updatedDish?.available ? "Available" : "Unavailable"
        }`
      );
    } catch (err) {
      toast.error("Failed to update dish availability.");
    }
  };

  return (
    <div className="space-y-6 p-5">
      {/* Header */}
      <div className="justify-between gap-4 sm:flex sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-sm text-gray-500">
            Manage dishes, availability, and menu items
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => setBulkUploadOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" /> Bulk Upload
          </Button>
          <Button
            variant="outline"
            onClick={() => setDraftsListOpen(true)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" /> Draft Dishes
          </Button>
          <Button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setEditingDraftId(undefined);
              setAddDishOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Dish
          </Button>
        </div>
      </div>

      {/* Table / Content */}
      <ContentHOC
        loading={loading}
        error={!!error}
        noContent={toShow.length === 0}
        loadingText="Fetching menu items..."
        noContentMessage="No menu items found"
        noContentBtnText="Reload"
        noContentAction={fetchAllData}
        errMessage={error || "Failed to load menu items."}
        actionFn={fetchAllData}
      >
        <Table className="w-full border-collapse text-sm">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-14 font-medium text-gray-600">
                Image
              </TableHead>
              <TableHead className="font-medium text-gray-600">Dish</TableHead>
              <TableHead className="font-medium text-gray-600">Price</TableHead>
              <TableHead className="font-medium text-gray-600">
                Availability
              </TableHead>
              <TableHead className="font-medium text-gray-600">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {toShow.map((dish) => (
              <TableRow
                key={dish.id}
                className="cursor-pointer transition hover:bg-gray-50"
              >
                {/* Image Column */}
                <TableCell className="py-2">
                  <img
                    src={dish.image_url || "/placeholder-dish.png"}
                    alt={dish.name}
                    className="h-12 w-12 rounded-lg border object-cover"
                  />
                </TableCell>

                {/* Dish Info */}
                <TableCell className="font-medium text-gray-900">
                  <div>{dish.name}</div>
                  <div className="text-xs text-gray-500">
                    {dish.description}
                  </div>
                </TableCell>

                {/* Price */}
                <TableCell>
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                  }).format(Number(dish.price))}
                </TableCell>

                {/* Availability */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={dish.available}
                      onCheckedChange={() => handleToggleAvailability(dish)}
                    />
                    <Badge
                      variant={dish.available ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {dish.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </TableCell>

                {/* Actions */}
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
            ))}
          </TableBody>
        </Table>
      </ContentHOC>

      {/* Add Dish Sheet */}
      <GenericSheet
        open={addDishOpen}
        onOpenChange={(open) => {
          if (!open) setEditingDraftId(undefined);
          setAddDishOpen(open);
        }}
        title={editingDraftId ? "Edit Draft Dish" : "Add Dish"}
        subtitle={editingDraftId ? "Continue editing your saved draft" : "Add new menu item and set availability"}
      >
        <AddDish
          key={editingDraftId ?? "new-dish"}
          currentPage={String(page)}
          onComplete={() => {
            setAddDishOpen(false);
            setEditingDraftId(undefined);
          }}
          draftId={editingDraftId}
        />
      </GenericSheet>

      {/* Drafts List Sheet */}
      <GenericSheet
        open={draftsListOpen}
        onOpenChange={setDraftsListOpen}
        title="Draft Dishes"
        subtitle="Select a draft to continue editing"
      >
        <DraftList
          onSelect={(draftId) => {
            setEditingDraftId(draftId);
            setDraftsListOpen(false);
            setAddDishOpen(true);
          }}
        />
      </GenericSheet>

      {/* Manage Dish Sheet */}
      {selectedDish && (
        <GenericSheet
          open={viewDishOpen}
          onOpenChange={setViewDishOpen}
          title="Manage Dish"
          subtitle="Edit details and availability of this dish"
        >
          <ManageDish dish={selectedDish} />
        </GenericSheet>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        onComplete={fetchAllData}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={page + 1}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
