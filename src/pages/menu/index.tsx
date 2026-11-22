"use client";

import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Upload, FileText } from "lucide-react";

import { RootState } from "@/store/store";
import { useAuth } from "@/contexts/AuthContext";
import { MENU_LIST_KEY, useMenuItemsData } from "./useMenuItemData";

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

/** Dishes per page (divisible by 2, 3 and 4 so grid rows stay full). */
const PAGE_SIZE = 12;

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
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  // MenuItems state from Redux
  const dataStore = useSelector((state: RootState) => state.menu);
  const allMenuItems = dataStore.data[MENU_LIST_KEY];

  const { loading, error, fetchAllData } = useMenuItemsData();

  // The endpoint returns every menu item, so paginate client-side with a real
  // page count (it used to be `page + 1`, which always offered a next page).
  const totalPages = Math.max(
    1,
    Math.ceil((allMenuItems?.length ?? 0) / PAGE_SIZE)
  );
  const toShow = useMemo(
    () => (allMenuItems ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [allMenuItems, page]
  );

  // Fetch once; the list is kept in the store afterwards.
  useEffect(() => {
    if (!allMenuItems) fetchAllData();
  }, [allMenuItems, fetchAllData]);

  // Keep the current page valid if the list shrinks.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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
    } catch {
      toast.error("Failed to update dish availability.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Menu Management"
        description="Manage dishes, availability, and menu items"
        actions={
          <>
            <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
              <Upload /> Bulk Upload
            </Button>
            <Button variant="outline" onClick={() => setDraftsListOpen(true)}>
              <FileText /> Draft Dishes
            </Button>
            <Button
              onClick={() => {
                setEditingDraftId(undefined);
                setAddDishOpen(true);
              }}
            >
              <Plus /> Add Dish
            </Button>
          </>
        }
      />

      {/* Table / Content */}
      <ContentHOC
        skeleton="grid"
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
            <TableRow className="bg-inset">
              <TableHead className="w-14 font-medium text-ink-secondary">
                Image
              </TableHead>
              <TableHead className="font-medium text-ink-secondary">Dish</TableHead>
              <TableHead className="font-medium text-ink-secondary">Price</TableHead>
              <TableHead className="font-medium text-ink-secondary">
                Availability
              </TableHead>
              <TableHead className="font-medium text-ink-secondary">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {toShow.map((dish) => (
              <TableRow
                key={dish.id}
                className="cursor-pointer transition hover:bg-inset"
              >
                {/* Image Column */}
                <TableCell className="py-2">
                  <img
                    src={dish.image_url || "/placeholder-dish.png"}
                    alt={dish.name}
                    className="h-12 w-12 rounded-md border object-cover"
                  />
                </TableCell>

                {/* Dish Info */}
                <TableCell className="font-medium text-ink">
                  <div>{dish.name}</div>
                  <div className="text-xs text-ink-muted">
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
          currentPage={MENU_LIST_KEY}
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
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </PageContainer>
  );
}
