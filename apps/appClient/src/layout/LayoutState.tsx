import type { ReactNode } from "react";
import SideBar from "../components/SideBar";
import { useAppStore } from "../stores/useAppStore";

type typeLayoutState = {
  children: ReactNode;
};

const LayoutState = ({ children }: typeLayoutState) => {
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        <main inert={isSidebarOpen ? true : undefined} className="flex-1 relative w-full h-full">
          {children}
        </main>
      </div>
    </div>
  );
};
export default LayoutState;
