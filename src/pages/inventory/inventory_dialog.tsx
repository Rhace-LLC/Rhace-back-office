import React, { useState, useEffect } from "react";
import { InventoryItem, StockStatus } from "@/store/inventory.slice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onClose?: () => void;
}

const InventoryItemDialog: React.FC<Props> = ({ open, onOpenChange, item, onClose }) => {
  const [formData, setFormData] = useState<InventoryItem | null>(item);

  useEffect(() => {
    setFormData(item);
  }, [item]);

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item?.id ? "View / Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Name</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Input
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              value={formData.quantity || 0}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) })
              }
            />
          </div>

          <div>
            <Label>Status</Label>
            <Input
              value={formData.status || ""}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as StockStatus })}
            />
          </div>

        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onClose?.()}>
            Close
          </Button>
          <Button onClick={() => console.log("Save Inventory Item", formData)}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemDialog;
