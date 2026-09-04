import { useEffect, useState } from "react";
import { useGameStore } from "../../../stores/useGameStore";

const ScoreboardUI = () => {
  const players = useGameStore((state) => state.players);
  const localId = useGameStore((state) => state.localId);
  const matchState = useGameStore((state) => state.matchState);
  const isLocked = useGameStore((state) => state.isLocked);

  const [isHoldingTab, setIsHoldingTab] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        setIsHoldingTab(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        setIsHoldingTab(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // show if actively playing AND holding tab, OR if the match has officially ended
  const shouldShow = (isHoldingTab && isLocked) || matchState === "ended";
  if (!shouldShow) return null;

  // convert players map to array and separate by team
  const allPlayers = Object.entries(players).map(([id, data]) => ({
    id,
    ...data,
  }));

  // sort players by kills (highest first)
  const redTeam = allPlayers
    .filter((p) => p.team === "red")
    .sort((a, b) => b.kills - a.kills);

  const blueTeam = allPlayers
    .filter((p) => p.team === "blue")
    .sort((a, b) => b.kills - a.kills);

  // helper to render a team's table
  const renderTeamTable = (
    teamName: string,
    teamPlayers: typeof allPlayers,
    colorClass: string,
  ) => {
    // Calculate how many empty rows we need to reach exactly 4 slots
    const emptySlotsCount = Math.max(0, 4 - teamPlayers.length);
    const emptySlots = Array.from({ length: emptySlotsCount });

    return (
      <div className="w-full md:w-1/2 p-2">
        <div
          className={`bg-black/60 border-t-4 ${colorClass} rounded-b-lg backdrop-blur-md overflow-hidden`}
        >
          <h3
            className={`text-center font-black tracking-widest uppercase py-2 ${colorClass.replace(
              "border",
              "text",
            )}`}
          >
            {teamName} Team
          </h3>

          <table className="w-full text-sm text-left text-white">
            <thead className="bg-white/10 uppercase text-xs text-neutral-300">
              <tr>
                <th className="px-4 py-2 w-1/2">player</th>
                <th className="px-4 py-2 text-center">k</th>
                <th className="px-4 py-2 text-center">d</th>
                <th className="px-4 py-2 text-center">k/d</th>
              </tr>
            </thead>
            <tbody>
              {/* Render active players */}
              {teamPlayers.map((p) => {
                const kd = (p.kills / Math.max(1, p.deaths)).toFixed(2);
                const isMe = p.id === localId;

                return (
                  <tr
                    key={p.id}
                    className={`border-b border-white/5 last:border-0 h-11 ${
                      isMe ? "bg-white/10 font-bold" : ""
                    }`}
                  >
                    <td className="px-4 py-2 flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.name} {isMe && "(You)"}
                    </td>
                    <td className="px-4 py-2 text-center">{p.kills}</td>
                    <td className="px-4 py-2 text-center text-neutral-400">
                      {p.deaths}
                    </td>
                    <td className="px-4 py-2 text-center text-neutral-400">
                      {kd}
                    </td>
                  </tr>
                );
              })}

              {/* Render empty waiting slots to maintain fixed UI height */}
              {emptySlots.map((_, index) => (
                <tr
                  key={`empty-${index}`}
                  className="border-b border-white/5 last:border-0 h-11"
                >
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-center text-neutral-600 italic"
                  >
                    waiting for player...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-8 pointer-events-none">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 bg-black/40 p-4 rounded-xl backdrop-blur-sm shadow-2xl">
        {renderTeamTable("Red", redTeam, "border-red-500")}
        {renderTeamTable("Blue", blueTeam, "border-blue-500")}
      </div>
    </div>
  );
};

export default ScoreboardUI;
