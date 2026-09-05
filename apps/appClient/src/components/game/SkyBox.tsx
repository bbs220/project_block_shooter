import { useEffect } from "react";
import { Environment } from "@react-three/drei";
import { skyboxBank } from "../../utils/assetPaths";
import { useTweakpane } from "../../hooks/useTweakPane";

const SkyBox = () => {
  const { timeOfDay } = useTweakpane(
    { title: "🏞️ Scene" },
    {
      timeOfDay: {
        value: "day",
        options: {
          day: "day",
          night: "night",
          dawn: "dawn",
          evening: "evening",
        },
      },
    },
  );

  // loop through all available skyboxes and preload their textures
  useEffect(() => {
    Object.values(skyboxBank).forEach((skybox) => {
      const preloadUrls = [
        skybox.px,
        skybox.nx,
        skybox.py,
        skybox.ny,
        skybox.pz,
        skybox.nz,
      ];

      // cache each individual cubemap face
      preloadUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    });
  }, []);

  // map the selection to the corresponding texture bank
  const currentSkybox = skyboxBank[timeOfDay as keyof typeof skyboxBank];

  return (
    <Environment
      key={timeOfDay}
      files={[
        currentSkybox.px,
        currentSkybox.nx,
        currentSkybox.py,
        currentSkybox.ny,
        currentSkybox.pz,
        currentSkybox.nz,
      ]}
      background
    />
  );
};

export default SkyBox;
