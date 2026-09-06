import { useEffect, useRef } from "react";
import { useGameStore, type KillEvent } from "../../../stores/useGameStore";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { iconBank } from "../../../utils/assetPaths";

const getKillFeedIcon = (weaponName: string) => {
  const name = weaponName.toLowerCase();
  if (name.includes("burst")) return iconBank.burstRifle;
  if (name.includes("pistol")) return iconBank.pistol;
  return iconBank.assaultRifle;
};

// component for the Overwatch-style snap
const KillFeedItem = ({ kill }: { kill: KillEvent }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // a sequence
      const tl = gsap.timeline();

      // snappy entrance (Overwatch style)
      tl.from(containerRef.current, {
        x: 80,
        scale: 0.85,
        opacity: 0,
        duration: 0.35,
        ease: "back.out(1.7)",
      });

      // store removes kills after 5000ms, we wait ~4.5 seconds
      // and slide it out just before React destroys the DOM node.
      tl.to(
        containerRef.current,
        {
          x: 50, // slide back out to the right
          opacity: 0,
          duration: 0.3,
          ease: "power2.in", // snaps out cleanly
        },
        "+=4.5",
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="bg-black/60 px-4 py-2 border-4 border-white/20 shadow-lg text-sm font-bold flex items-center gap-2"
    >
      <span
        className={
          kill.shooterTeam === "red" ? "text-red-400" : "text-blue-400"
        }
      >
        {kill.shooter}
      </span>

      <img
        src={getKillFeedIcon(kill.weapon)}
        alt={kill.weapon}
        className="h-4 object-contain mx-2 opacity-80"
      />

      <span
        className={kill.targetTeam === "red" ? "text-red-400" : "text-blue-400"}
      >
        {kill.target}
      </span>
    </div>
  );
};

const KillFeedUI = () => {
  const killFeed = useGameStore((state) => state.killFeed);
  const removeOldKills = useGameStore((state) => state.removeOldKills);

  useEffect(() => {
    const interval = setInterval(() => {
      removeOldKills();
    }, 1000);
    return () => clearInterval(interval);
  }, [removeOldKills]);

  if (killFeed.length === 0) return null;

  return (
    // gap-2 back so GSAP just animates the entry, not the margins
    <div className="absolute bottom-1/2 right-4 flex flex-col gap-2 z-40 pointer-events-none items-end">
      {killFeed.map((kill) => (
        <KillFeedItem key={kill.id} kill={kill} />
      ))}
    </div>
  );
};

export default KillFeedUI;
