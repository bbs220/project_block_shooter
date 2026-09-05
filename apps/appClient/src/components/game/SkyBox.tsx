import { Environment, useEnvironment } from "@react-three/drei";
import { skyboxBank } from "../../utils/assetPaths";
import { useTweakpane } from "../../hooks/useTweakPane";

Object.values(skyboxBank).forEach((skybox) => {
  useEnvironment.preload({
    files: [skybox.px, skybox.nx, skybox.py, skybox.ny, skybox.pz, skybox.nz],
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
