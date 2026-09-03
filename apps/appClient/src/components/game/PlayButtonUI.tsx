import useSound from "use-sound";
import { useGameStore } from "../../stores/useGameStore";
import { soundBank } from "../../utils/assetPaths";

const PlayButtonUI = () => {
  const isLocked = useGameStore((state) => state.isLocked);
  const matchState = useGameStore((state) => state.matchState);
  const [playClick] = useSound(soundBank.click, { volume: 0.5 });

  const isHidden = isLocked || matchState === "ended";

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-40 pointer-events-none transition-opacity duration-300 ${
        isHidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <button
        onClick={() => playClick()}
        id="play-button"
        className={`flex items-center justify-center gap-4 px-16 py-6 bg-black/20 border-4 border-white/20 text-gray-300 font-mono font-black text-2xl tracking-[0.2em] uppercase backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black hover:border-white shadow-2xl group ${
          isHidden
            ? "pointer-events-none"
            : "pointer-events-auto cursor-pointer"
        }`}
      >
        <span>Play</span>
        <span className="text-3xl group-hover:scale-125 transition-transform duration-300">
          🕹️
        </span>
      </button>
    </div>
  );
};

export default PlayButtonUI;
