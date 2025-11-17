// src/components/modals/ConfirmActionDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: "enable" | "disable";
  onConfirm: () => void;
  loading?: boolean;
}

const ConfirmActionDialog: React.FC<ConfirmActionDialogProps> = ({
  open,
  onOpenChange,
  actionType,
  onConfirm,
  loading = false,
}) => {
  const isDisable = actionType === "disable";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isDisable ? "Disable Account" : "Enable Account"}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {isDisable
              ? "Are you sure you want to disable this staff account? They will lose access immediately."
              : "Are you sure you want to enable this staff account? They will regain access immediately."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`${
              isDisable
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {loading
              ? "Processing..."
              : isDisable
                ? "Yes, Disable"
                : "Yes, Enable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmActionDialog;
