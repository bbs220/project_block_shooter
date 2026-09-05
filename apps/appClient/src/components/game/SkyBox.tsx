import { Environment, useEnvironment } from "@react-three/drei";
import { skyboxBank } from "../../utils/assetPaths";
import { useTweakpane } from "../../hooks/useTweakPane";
import { SRGBColorSpace } from "three";

Object.values(skyboxBank).forEach((skybox) => {
  useEnvironment.preload({
    files: [skybox.px, skybox.nx, skybox.py, skybox.ny, skybox.pz, skybox.nz],
    colorSpace: SRGBColorSpace,
  });
});

const SkyBox = () => {
  const { timeOfDay } = useTweakpane(
    { title: "🏞️ Scene" },
    {
      timeOfDay: {
        value: "afternoon",
        options: {
          dawn: "dawn",
          afternoon: "afternoon",
          evening: "evening",
          night: "night",
        },
        label: "time of day",
      },
    },
  );

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
