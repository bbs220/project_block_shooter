import { useAppStore } from "../../../stores/useAppStore";

const ControlsDisplayUI = () => {
  const showControls = useAppStore((state) => state.showControls);

  return (
    <div
      className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 font-mono text-[10px] sm:text-xs pointer-events-none bg-black/40 px-6 py-2 backdrop-blur-md border-2 border-white/10 whitespace-nowrap uppercase tracking-widest transition-all duration-300 z-10 ${
        showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex gap-3 items-center text-gray-400 font-black">
        <span>
          <span className="text-white">WASD</span> Move
        </span>
        <span className="w-1 h-1 bg-white/20"></span>
        <span>
          <span className="text-white">SPACE</span> Jump
        </span>
        <span className="w-1 h-1 bg-white/20"></span>
        <span>
          <span className="text-white">SHIFT</span> Sprint
        </span>
      </div>

      <div className="flex gap-3 items-center text-gray-400 font-black">
        <span>
          <span className="text-white">L-CLICK</span> Fire
        </span>
        <span className="w-1 h-1 bg-white/20"></span>
        <span>
          <span className="text-white">R-CLICK</span> Aim
        </span>
        <span className="w-1 h-1 bg-white/20"></span>
        <span>
          <span className="text-white">R</span> Reload
        </span>
        <span className="w-1 h-1 bg-white/20"></span>
        <span>
          <span className="text-white">1-3</span> Weapons
        </span>
      </div>
    </div>
  );
};

export default ControlsDisplayUI;
