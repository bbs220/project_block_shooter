import { X, Keyboard, LogOut, Menu } from "lucide-react";
import { useAppStore } from "../stores/useAppStore";
import { Link } from "react-router";

const SideBar = () => {
  const {
    isSidebarOpen,
    toggleSidebar,
    showControls,
    setShowControls,
    appVersion,
  } = useAppStore();

  return (
    <div className="z-50">
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-60 p-3 bg-black/60 border-2 border-white/20 hover:border-white hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300 cursor-pointer backdrop-blur-sm group"
      >
        {isSidebarOpen ? (
          <X
            size={28}
            strokeWidth={2.5}
            className="group-hover:scale-110 transition-transform"
          />
        ) : (
          <Menu
            size={28}
            strokeWidth={2.5}
            className="group-hover:scale-110 transition-transform"
          />
        )}
      </button>

      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

      <aside
        className={`fixed top-0 left-0 h-screen w-72 sm:w-80 bg-neutral-900/95 border-r-4 border-white/20 z-50 flex flex-col font-mono transform transition-transform duration-300 ease-out shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-start pl-24 p-6 border-b-4 border-white/10 bg-black/40 min-h-21.5">
          <h2 className="text-2xl font-black text-white tracking-widest uppercase [text-shadow:-1.5px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_1.5px_0_#000,1.5px_1.5px_0_#000]">
            SETTINGS
          </h2>
        </div>

        <div className="flex flex-col flex-1 p-4 gap-2 overflow-y-auto">
          <button
            onClick={() => setShowControls(!showControls)}
            className="flex items-center justify-between w-full p-4 border-l-4 transition-all duration-200 uppercase font-black tracking-widest text-sm cursor-pointer group border-transparent hover:border-white bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <div className="flex items-center gap-4">
              <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                <Keyboard size={20} />
              </span>
              Controls
            </div>

            {/* Wider, text-labeled Brutalist Switch */}
            <div
              className={`relative flex w-24 h-8 border-2 transition-colors duration-200 ${
                showControls
                  ? "border-white bg-white/10"
                  : "border-neutral-600 bg-black/50"
              }`}
            >
              {/* Text Labels (Overlay) */}
              <div className="absolute inset-0 flex w-full h-full text-[10px] font-black z-10 pointer-events-none">
                <div
                  className={`flex-1 flex items-center justify-center transition-colors duration-200 ${
                    !showControls
                      ? "text-white"
                      : "text-neutral-500 group-hover:text-neutral-400"
                  }`}
                >
                  HIDE
                </div>
                <div
                  className={`flex-1 flex items-center justify-center transition-colors duration-200 ${
                    showControls
                      ? "text-black"
                      : "text-neutral-500 group-hover:text-neutral-400"
                  }`}
                >
                  SHOW
                </div>
              </div>

              {/* Sliding Block */}
              <div
                className={`absolute top-0 left-0 h-full w-1/2 transition-transform duration-200 ease-out z-0 ${
                  showControls
                    ? "translate-x-full bg-white"
                    : "translate-x-0 bg-neutral-600 group-hover:bg-neutral-500"
                }`}
              />
            </div>
          </button>
        </div>

        <div className="text-center text-[10px] text-white tracking-[0.2em] mb-2 select-none">
          {`v${appVersion}.alpha`}
        </div>

        <div className="p-4 border-t-4 border-white/10 bg-black/40 flex flex-col gap-4">
          <Link to={"/"} className="w-full">
            <button
              onClick={toggleSidebar}
              className="flex items-center gap-4 w-full p-4 border-l-4 transition-all duration-200 uppercase font-black tracking-widest text-sm cursor-pointer group border-red-500/50 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
            >
              <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                <LogOut size={20} />
              </span>
              Disconnect
            </button>
          </Link>
        </div>
      </aside>
    </div>
  );
};

export default SideBar;
