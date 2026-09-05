import { GRAVITY } from "@block-shooter/shared";
import {
  GizmoHelper,
  GizmoViewport,
  Loader,
  PerspectiveCamera,
  Stats,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useEffect } from "react";
import { useTweakpane } from "../../hooks/useTweakPane";
import { useAppStore } from "../../stores/useAppStore";
import { FOV } from "../../utils/tunablesClient";
import AdsVignette from "./AdsVigette";
import ArenaGeometry from "./ArenaGeometry";
import LocalPlayer from "./LocalPlayer";
import NetworkManager from "./NetworkManager";
import RemotePlayers from "./RemotePlayers";
import SkyBox from "./SkyBox";
import SoundManager from "./SoundManager";
import ControlsDisplayUI from "./ui/ControlsDisplayUI";
import CrosshairUI from "./ui/CrosshairUI";
import KillFeedUI from "./ui/KillFeedUI";
import LocalPlayerUI from "./ui/LocalPlayerUI";
import MatchTimerUI from "./ui/MatchTimerUI";
import PlayButtonUI from "./ui/PlayButtonUI";
import ScoreboardUI from "./ui/ScoreboardUI";
import WeaponViewmodel from "./WeaponViewModel";

const PrimaryScene = () => {
  const { showPhyDebug, showGizmo, showFPS } = useTweakpane(
    { title: "🏞️ Scene", expanded: true },
    {
      showPhyDebug: { value: false, label: "physics debug" },
      showGizmo: { value: false, label: "show gizmo" },
      showFPS: { value: false, label: "show fps" },
    },
  );

  return (
    <>
      {/* rapier physics */}
      <Physics debug={showPhyDebug} gravity={[GRAVITY.x, GRAVITY.y, GRAVITY.z]}>
        <PerspectiveCamera makeDefault fov={FOV}>
          <WeaponViewmodel />
        </PerspectiveCamera>
        <GizmoHelper alignment="top-left" margin={[60, 120]}>
          <GizmoViewport labelColor="white" visible={showGizmo} />
        </GizmoHelper>
        <Stats showPanel={showFPS ? 0 : 4} />
        <SkyBox />
        <>
          {/* captures mouse and moves camera for local player */}
          <LocalPlayer />
          {/* render all players EXCEPT the local one */}
          <RemotePlayers />
          {/* something to stand on */}
          <ArenaGeometry />
        </>
      </Physics>
    </>
  );
};

const PrimaryCanvas = () => {
  const { setActivePage } = useAppStore();

  useEffect(() => {
    setActivePage("ingame");
  }, [setActivePage]);

  return (
    <>
      {/* what buttons to press */}
      <ControlsDisplayUI />
      {/* cursor for aim */}
      <CrosshairUI />
      {/* container for pointer controls */}
      <PlayButtonUI />
      {/* match timer */}
      <MatchTimerUI />
      {/* scoreboard tracker */}
      <ScoreboardUI />
      {/* tiny kill feed of the match in a corner */}
      <KillFeedUI />
      {/* stuff like health and ammo */}
      <LocalPlayerUI />
      {/* network manager runs silently outside the 3d canvas */}
      <NetworkManager />
      {/* responsible for all 2d and ui sounds */}
      <SoundManager />
      {/* main 3d viewport */}
      <Canvas shadows="variance" dpr={1}>
        <PrimaryScene />
        <AdsVignette />
      </Canvas>
      {/* loading screen */}
      <Loader
        containerStyles={{ backgroundColor: "#171717" }}
        innerStyles={{ width: "300px" }}
        barStyles={{ backgroundColor: "#3b82f6" }}
      />
    </>
  );
};

export default PrimaryCanvas;
