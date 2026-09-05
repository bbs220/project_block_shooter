import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

const LoadingScreenUI = () => {
  const { progress, active, loaded, total } = useProgress();
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!active) {
      const fadeTimer = setTimeout(() => {
        setFadingOut(true);
      }, 500);

      const unmountTimer = setTimeout(() => {
        setVisible(false);
      }, 2000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [active]);

  if (!visible) return null;

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none p-8 transition-opacity duration-1000 ease-in-out ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-lg bg-black/60 border-t-4 border-white p-6 shadow-2xl">
        <h2 className="text-center font-black tracking-widest uppercase text-white mb-6">
          loading assets
        </h2>

        {/* progress bar container */}
        <div className="w-full h-6 bg-white/10 mb-2 overflow-hidden">
          {/* dynamic progress bar fill */}
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* stats text row */}
        <div className="flex justify-between text-xs uppercase text-neutral-400 font-bold tracking-widest">
          <span>
            {loaded} of {total} files
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreenUI;
