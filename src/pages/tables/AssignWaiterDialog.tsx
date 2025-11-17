import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Waiter {
  id: string;
  name: string;
  status?: "available" | "busy";
}

interface AssignWaiterDialogProps {
  open: boolean;
  onClose: () => void;
  waiters: Waiter[];
  onAssign: (waiterId: string) => void;
  loading?: boolean;
}

export const AssignWaiterDialog: React.FC<AssignWaiterDialogProps> = ({
  open,
  onClose,
  waiters,
  onAssign,
  loading = false,
}) => {
  const [search, setSearch] = useState("");
  const [selectedWaiter, setSelectedWaiter] = useState<string | null>(null);

  const filteredWaiters = waiters.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    if (!selectedWaiter) return;
    onAssign(selectedWaiter);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Waiter</DialogTitle>
          <DialogDescription>
            Select a waiter to assign to this table.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            placeholder="Search waiter by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />

          <ScrollArea className="h-48 rounded-md border p-2">
            {filteredWaiters.length > 0 ? (
              filteredWaiters.map((waiter) => (
                <div
                  key={waiter.id}
                  onClick={() => setSelectedWaiter(waiter.id)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors",
                    "hover:bg-muted",
                    selectedWaiter === waiter.id ? "bg-muted" : ""
                  )}
                >
                  <div className="flex items-center gap-3">
                    <User className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">{waiter.name}</span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs capitalize",
                      waiter.status === "busy"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    )}
                  >
                    {waiter.status || "available"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No waiters found
              </p>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedWaiter || loading}>
            {loading ? "Assigning..." : "Assign Waiter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
