import { useEffect, useState, useRef } from "react";
import { useGameStore } from "../../../stores/useGameStore";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RotateCw } from "lucide-react";

const CrosshairUI = () => {
  const spread = useGameStore((state) => state.crosshairSpread);
  const isLocked = useGameStore((state) => state.isLocked);
  const matchState = useGameStore((state) => state.matchState);

  const localId = useGameStore((state) => state.localId);
  const players = useGameStore((state) => state.players);
  const me = localId ? players[localId] : null;
  const isReloading = me?.isReloading || false;

  const [isHoldingTab, setIsHoldingTab] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const crosshairGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") setIsHoldingTab(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Tab") setIsHoldingTab(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useGSAP(() => {
    if (
      !topRef.current ||
      !bottomRef.current ||
      !leftRef.current ||
      !rightRef.current
    )
      return;

    const baseOffset = 8;
    const currentOffset = baseOffset + spread;

    const config = {
      duration: 0.15,
      ease: "power2.out",
      overwrite: "auto" as const,
    };

    gsap.to(topRef.current, { y: -currentOffset, ...config });
    gsap.to(bottomRef.current, { y: currentOffset, ...config });
    gsap.to(leftRef.current, { x: -currentOffset, ...config });
    gsap.to(rightRef.current, { x: currentOffset, ...config });
  }, [spread]);

  useGSAP(() => {
    if (!crosshairGroupRef.current) return;
    gsap.to(crosshairGroupRef.current, {
      opacity: isReloading ? 0 : 1,
      duration: 0.2,
      ease: "power2.inOut",
    });
  }, [isReloading]);

  if (!isLocked || matchState === "ended" || isHoldingTab) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      {/* standard Crosshair Lines */}
      <div
        ref={crosshairGroupRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          ref={topRef}
          className="absolute bg-white/90 w-1 h-3 rounded-sm shadow-[0_0_2px_rgba(0,0,0,0.8)]"
        />
        <div
          ref={bottomRef}
          className="absolute bg-white/90 w-1 h-3 rounded-sm shadow-[0_0_2px_rgba(0,0,0,0.8)]"
        />
        <div
          ref={leftRef}
          className="absolute bg-white/90 w-3 h-1 rounded-sm shadow-[0_0_2px_rgba(0,0,0,0.8)]"
        />
        <div
          ref={rightRef}
          className="absolute bg-white/90 w-3 h-1 rounded-sm shadow-[0_0_2px_rgba(0,0,0,0.8)]"
        />
      </div>

      {/* small Center Dot*/}
      <div className="absolute bg-white/80 w-1 h-1 rounded-full shadow-[0_0_2px_rgba(0,0,0,0.8)]" />

      {/* reloading Spinner */}
      <div
        className={`absolute transition-opacity duration-300 ease-in-out ${
          isReloading ? "opacity-100" : "opacity-0"
        }`}
      >
        <RotateCw
          size={24}
          strokeWidth={2.5}
          className={`text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.8)] ${
            isReloading ? "animate-spin" : ""
          }`}
          style={{ animationDuration: "1s" }}
        />
      </div>
    </div>
  );
};

export default CrosshairUI;
