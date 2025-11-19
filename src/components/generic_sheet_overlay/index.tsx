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
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  maxWidth?: number;
  children?: React.ReactNode; // body content
  footer?: React.ReactNode; // optional footer actions
}

const GenericSheet: React.FC<GenericSheetProps> = ({
  open,
  onOpenChange,
  title = "",
  subtitle = "",
  children,
  footer,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={`w-full !max-w-[500px] overflow-y-auto p-4 pt-10`}
      >
        {title && (
          <SheetHeader>
            {typeof title == "string" ? (
              <SheetTitle className="text-2xl tracking-tight">
                {title}
              </SheetTitle>
            ) : (
              <SheetTitle>{title}</SheetTitle>
            )}
            {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
          </SheetHeader>
        )}

        {/* Body */}
        <div
          className={` ${title && "mt-5 mb-5 border-t border-b border-dashed border-gray-400"}`}
        >
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
