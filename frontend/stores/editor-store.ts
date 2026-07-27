import { create } from "zustand";
import { persist } from "zustand/middleware";

/** 后台文章编辑器草稿。 */
export interface EditorDraft {
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover: string;
  categoryId?: number;
  tagIds: number[];
}

const emptyDraft: EditorDraft = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  cover: "",
  categoryId: undefined,
  tagIds: [],
};

interface EditorState {
  draft: EditorDraft;
  update: (patch: Partial<EditorDraft>) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      draft: emptyDraft,
      update: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      reset: () => set({ draft: emptyDraft }),
    }),
    { name: "moon-editor-draft" }
  )
);
