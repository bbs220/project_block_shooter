import { useNavigate } from "react-router";
import { Monitor, UserRoundPlus } from "lucide-react";
import useSound from "use-sound";
import { soundBank } from "../utils/assetPaths";
import { useAppStore } from "../stores/useAppStore";
import { useEffect } from "react";

const WelcomePage = () => {
  const [playClick] = useSound(soundBank.click, { volume: 0.5 });
  const navigate = useNavigate();
  const { appVersion, setActivePage } = useAppStore();

  useEffect(() => {
    setActivePage("welcome");
  }, [setActivePage]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white font-mono p-4">
      <div className="w-full max-w-sm md:max-w-md p-6 md:p-10 bg-black/40 border-4 border-white/20 flex flex-col items-center shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase [text-shadow:-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000] mb-2 text-center leading-tight">
          BLOCK
          <br />
          SHOOTER
        </h1>

        <p className="text-gray-400 font-black uppercase tracking-widest text-xs md:text-sm mb-10 text-center">
          8-Player Arena FPS
        </p>

        <button
          onClick={() => {
            navigate("/play");
            playClick();
          }}
          className="w-full py-4 flex items-center justify-center gap-3 bg-black/60 border-l-4 border-transparent hover:border-white hover:bg-white/10 text-gray-300 hover:text-white text-lg md:text-xl font-black tracking-widest uppercase transition-all duration-300 ease-out cursor-pointer group"
        >
          <UserRoundPlus className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
          Join Match
        </button>

        <div className="mt-8 flex flex-col items-center gap-2 w-full border-t-2 border-white/10 pt-4">
          <div className="flex items-center gap-2 text-gray-400 select-none">
            <Monitor className="w-4 h-4 animate-pulse opacity-50" />
            <span className="text-[10px] md:text-xs font-black tracking-wider">
              Desktop Only{" | "}
              <span className="text-gray-500">v{appVersion}.alpha</span>
            </span>
          </div>

          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold select-none">
            Server dictates Game Mode
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-[10px] font-black tracking-[0.2em] whitespace-nowrap">
        Made by{" "}
        <a
          href="https://github.com/bbs220/project_block_shooter"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-200 underline underline-offset-4 decoration-white/20 hover:decoration-white"
        >
          bbs220
        </a>
      </div>
    </div>
  );
};

export default WelcomePage;
