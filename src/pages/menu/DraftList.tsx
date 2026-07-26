import React, { useState } from "react";
import { getDrafts, deleteDraft } from "./draftStorage";
import { Button } from "@/components/ui/button";
import { DishDraft } from "./types";

interface DraftListProps {
  onSelect: (draftId: string) => void;
}

export const DraftList: React.FC<DraftListProps> = ({ onSelect }) => {
  const [drafts, setDrafts] = useState<DishDraft[]>(getDrafts);

  const handleDelete = (id: string) => {
    deleteDraft(id);
    setDrafts(getDrafts());
  };

  if (drafts.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-gray-500">
        No drafts saved.
      </div>
    );
  }

  return (
    <div className="space-y-3 py-4">
      {drafts.map((draft) => (
        <div
          key={draft.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {draft.form.name.trim() || "Untitled"}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(draft.savedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <Button
              size="sm"
              onClick={() => onSelect(draft.id)}
            >
              Continue
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleDelete(draft.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
