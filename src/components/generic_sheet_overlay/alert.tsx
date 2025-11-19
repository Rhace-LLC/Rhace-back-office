import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GenericDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  maxWidth?: number;
  children?: React.ReactNode; // main body content
  footer?: React.ReactNode; // footer content (buttons)
}

const GenericDialog: React.FC<GenericDialogProps> = ({
  open,
  onOpenChange,
  maxWidth = 500,
  children,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`w-full p-4`} style={{ maxWidth }}>
        {/* Body */}
        <div className="py-4">
          {children ?? (
            <div className="flex min-h-[180px] items-center justify-center">
              <span className="text-muted-foreground text-sm">
                Content goes here.
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenericDialog;
