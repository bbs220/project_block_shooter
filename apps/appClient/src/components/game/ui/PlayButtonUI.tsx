import { useEffect, useState } from "react";
import useSound from "use-sound";
import { useGameStore } from "../../../stores/useGameStore";
import { soundBank } from "../../../utils/assetPaths";

const PlayButtonUI = () => {
  const isLocked = useGameStore((state) => state.isLocked);
  const matchState = useGameStore((state) => state.matchState);
  const [playClick] = useSound(soundBank.click, { volume: 0.5 });

  // track cooldown status locally
  const [isCooldown, setIsCooldown] = useState(false);

  // apply chromium timeout restriction when pointer unlocks
  useEffect(() => {
    const handleLockChange = () => {
      if (!document.pointerLockElement) {
        setIsCooldown(true);

        // unlock button after timeout window completes
        setTimeout(() => {
          setIsCooldown(false);
        }, 1200);
      }
    };

    document.addEventListener("pointerlockchange", handleLockChange);
    return () =>
      document.removeEventListener("pointerlockchange", handleLockChange);
  }, []);

  const isHidden = isLocked || matchState === "ended";

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-40 pointer-events-none transition-opacity duration-300 ${
        isHidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <button
        onClick={() => playClick()}
        disabled={isCooldown}
        id="play-button"
        className={`flex items-center justify-center gap-4 px-16 py-6 bg-black/20 border-4 border-white/20 font-mono font-black text-2xl tracking-[0.2em] uppercase backdrop-blur-sm transition-all duration-300 shadow-2xl group ${
          isHidden
            ? "pointer-events-none"
            : isCooldown
              ? "pointer-events-auto cursor-not-allowed opacity-50 text-gray-500"
              : "pointer-events-auto cursor-pointer text-gray-300 hover:bg-white hover:text-black hover:border-white"
        }`}
      >
        {/* swap text dynamically based on lock state */}
        <span>{isCooldown ? "Cooldown" : "Play"}</span>
        <span
          className={`text-3xl transition-transform duration-300 ${
            isCooldown ? "" : "group-hover:scale-125"
          }`}
        >
          🕹️
        </span>
      </button>
    </div>
  );
};

export default PlayButtonUI;
