import { create } from "zustand";

/** 通用 UI 状态：侧栏抽屉、命令面板等。 */
interface UiState {
  sidebarOpen: boolean;
  commandOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  toggleCommand: () => void;
  setCommand: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  commandOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
  toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),
  setCommand: (open) => set({ commandOpen: open }),
}));
