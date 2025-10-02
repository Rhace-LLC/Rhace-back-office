import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface GenericSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  maxWidth?: number;
  children?: React.ReactNode; // body content
  footer?: React.ReactNode; // optional footer actions
}

const GenericSheet: React.FC<GenericSheetProps> = ({
  open,
  onOpenChange,
  title = "Sheet Title",
  subtitle = "Sheet subtitle goes here.",
  maxWidth = 600,
  children,
  footer,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={`w-full pt-10 !max-w-[${maxWidth}px] overflow-y-auto`}
      >
        <SheetHeader>
          <SheetTitle className="text-2xl tracking-tight">{title}</SheetTitle>
          {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
        </SheetHeader>

        {/* Body */}
        <div className="border-t border-b border-dashed border-gray-400">
          {children ?? (
            <div className="flex min-h-[220px] items-center justify-center">
              <span className="text-muted-foreground text-sm">
                Content goes here.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-2 pb-4">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default GenericSheet;
