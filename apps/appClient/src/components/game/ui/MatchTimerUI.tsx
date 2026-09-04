import { useGameStore } from "../../../stores/useGameStore";

const MatchTimerUI = () => {
  const matchState = useGameStore((state) => state.matchState);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const mode = useGameStore((state) => state.mode);
  const teamScores = useGameStore((state) => state.teamScores);

  // format seconds into mm:ss
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // hide the UI completely if we are just sitting in the empty lobby
  if (matchState === "waiting") return null;

  const modeName = mode === "tdm" ? "Team Deathmatch" : "Capture the Point";

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 p-2 z-10 pointer-events-none drop-shadow-xl flex flex-col items-center">
      {/* Top Badge: Game Mode */}
      <div className="bg-black/60 backdrop-blur-md px-6 py-1 rounded-t-lg border border-white/10 border-b-0 shadow-inner">
        <span className="text-neutral-300 text-xs font-black tracking-[0.2em] uppercase">
          {modeName}
        </span>
      </div>

      {/* Main Bar: Scores & Timer */}
      <div className="flex items-center bg-black/80 backdrop-blur-md rounded-b-lg rounded-t-sm border border-white/10 overflow-hidden shadow-2xl">
        {/* Red Team Score */}
        <div className="bg-red-600/20 px-6 py-2 flex items-center justify-center min-w-20 border-r border-red-500/30">
          <span className="text-red-400 font-black text-2xl tabular-nums">
            {teamScores.red}
          </span>
        </div>

        {/* Timer */}
        <div className="px-6 py-2 flex flex-col items-center justify-center min-w-30">
          <span
            className={`font-mono font-bold text-3xl tabular-nums leading-none ${
              timeRemaining <= 30 ? "text-red-500 animate-pulse" : "text-white"
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Blue Team Score */}
        <div className="bg-blue-600/20 px-6 py-2 flex items-center justify-center min-w-20 border-l border-blue-500/30">
          <span className="text-blue-400 font-black text-2xl tabular-nums">
            {teamScores.blue}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatchTimerUI;
