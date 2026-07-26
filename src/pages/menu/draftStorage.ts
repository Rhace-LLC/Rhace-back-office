import { DishDraft } from "./types";

const STORAGE_KEY = "rhace_dish_drafts";

export function getDrafts(): DishDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DishDraft[];
  } catch {
    return [];
  }
}

export function saveDraft(draft: DishDraft): void {
  const drafts = getDrafts();
  const idx = drafts.findIndex((d) => d.id === draft.id);
  if (idx >= 0) {
    drafts[idx] = draft;
  } else {
    drafts.push(draft);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function updateDraft(id: string, partial: Partial<Omit<DishDraft, "id">>): void {
  const drafts = getDrafts();
  const idx = drafts.findIndex((d) => d.id === id);
  if (idx >= 0) {
    drafts[idx] = { ...drafts[idx], ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }
}

export function deleteDraft(id: string): void {
  const drafts = getDrafts().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function getDraftById(id: string): DishDraft | undefined {
  return getDrafts().find((d) => d.id === id);
}
