import { Environment } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { skyboxBank } from "../../utils/assetPaths";
import { useTweakpane } from "../../hooks/useTweakPane";

// pre extract global keys and cubemap url arrays to prevent react from recreating them
const skyboxKeys = Object.keys(skyboxBank);
const skyboxUrlArrays = Object.values(skyboxBank).map((skybox) => [
  skybox.px,
  skybox.nx,
  skybox.py,
  skybox.ny,
  skybox.pz,
  skybox.nz,
]);

// auto generate the tweakpane dropdown options directly from the asset bank
const skyboxOptions = skyboxKeys.reduce(
  (acc, key) => {
    acc[key] = key;
    return acc;
  },
  {} as Record<string, string>,
);

const SkyBox = () => {
  // auto load and cache all skybox cubemaps simultaneously using the native threejs loader
  const envTextures = useLoader(THREE.CubeTextureLoader, skyboxUrlArrays);

  // strictly apply correct color space to all loaded textures
  useMemo(() => {
    envTextures.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
    });
  }, [envTextures]);

  // configure debug tools with dynamic dropdown options
  const { timeOfDay } = useTweakpane(
    { title: "🏞️ Scene" },
    {
      timeOfDay: {
        value: "afternoon",
        label: "time of day",
        options: skyboxOptions,
      },
    },
  );

  // find the index of the currently selected environment to apply the correct texture
  const activeIndex = skyboxKeys.indexOf(timeOfDay as string);
  const activeSkyMap = envTextures[activeIndex];

  return <Environment map={activeSkyMap} background />;
};

export default SkyBox;
