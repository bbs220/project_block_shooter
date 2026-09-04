import { Html } from "@react-three/drei";
import type { PlayerState } from "../../../stores/useGameStore";

export default function RemotePlayerUI({ player }: { player: PlayerState }) {
  const displayHealth = Math.max(0, player.health);
  const maxHealth = 100;
  const healthSegments = 10;

  return (
    <Html position={[0, 1.4, 0]} center transform sprite scale={0.5}>
      <div className="flex flex-col items-center gap-1 pointer-events-none select-none">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full border border-black"
            style={{ backgroundColor: player.color }}
          />
          <span className="text-white text-[10px] font-black tracking-wide uppercase [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000] whitespace-nowrap">
            {player.name}
          </span>
        </div>

        <div className="flex gap-0.5">
          {Array.from({ length: healthSegments }).map((_, i) => {
            const isActive = i * (maxHealth / healthSegments) < displayHealth;
            const isLowHealth = displayHealth <= 30;
            return (
              <div
                key={i}
                className={`h-2 w-2 border-b-2 transition-colors duration-200 ${
                  isActive
                    ? isLowHealth
                      ? "bg-red-500 border-black/40"
                      : "bg-white border-black/40"
                    : "opacity-0"
                }`}
              />
            );
          })}
        </div>
      </div>
    </Html>
  );
}
