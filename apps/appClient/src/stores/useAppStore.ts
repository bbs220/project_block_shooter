import { create } from "zustand";

type typeAppStore = {
  // tracks the active environment
  appVersion: number;
  activePage: "welcome" | "ingame";
  setActivePage: (page: "welcome" | "ingame") => void;

  // sidebar state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // controls state
  showControls: boolean;
  setShowControls: (isOpen: boolean) => void;
};

export const useAppStore = create<typeAppStore>((set) => ({
  appVersion: 0.1,
  activePage: "welcome",
  setActivePage: (page) => set({ activePage: page }),

  // default to closed
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // controls visibility
  showControls: false,
  setShowControls: (isShowing) => set({ showControls: isShowing }),
}));
