import { create } from "zustand";
import { persist } from "zustand/middleware";

type typeAppStore = {
  // tracks the active environment
  appVersion: number;
  activePage: "welcome" | "ingame";
  setActivePage: (page: "welcome" | "ingame") => void;
};

export const useAppStore = create<typeAppStore>()(
  persist(
    (set) => ({
      appVersion: 0.1,
      activePage: "welcome",
      setActivePage: (page) => set({ activePage: page }),
    }),
    {
      name: "projectBlockShooter",
    },
  ),
);
