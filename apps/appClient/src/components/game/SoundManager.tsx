import { useEffect, useRef } from "react";
import useSound from "use-sound";
import { useGameStore } from "../../stores/useGameStore";
import { soundBank } from "../../utils/assetPaths";

const SoundManager = () => {
  const channel = useGameStore((state) => state.channel);
  const localId = useGameStore((state) => state.localId);

  const [playHit] = useSound(soundBank.hit, { volume: 0.6 });
  const [playKill] = useSound(soundBank.kill, { volume: 1.0 });

  const playRefs = useRef({ hit: playHit, kill: playKill });

  useEffect(() => {
    playRefs.current = { hit: playHit, kill: playKill };
  }, [playHit, playKill]);

  useEffect(() => {
    if (!channel || !localId) return;

    const onHitConfirm = (data: { shooterId: string }) => {
      if (data.shooterId === localId) {
        playRefs.current.hit();
      }
    };

    const onKillFeed = (data: { shooterId: string }) => {
      if (data.shooterId === localId) {
        playRefs.current.kill();
      }
    };

    channel.on("hit_confirm", onHitConfirm);
    channel.on("kill_feed", onKillFeed);

    return () => {
      channel.off("hit_confirm", onHitConfirm);
      channel.off("kill_feed", onKillFeed);
    };
  }, [channel, localId]);

  return null;
};

export default SoundManager;
