import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Clone, PositionalAudio, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useGameStore, type PlayerState } from "../../stores/useGameStore";
import RemotePlayersUI from "./ui/RemotePlayersUI";
import { modelsBank, soundBank } from "../../utils/assetPaths";

// plug your dialled-in numbers here
const REMOTE_WEAPON_TRANSFORMS: Record<
  string,
  {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
  }
> = {
  assaultRifle: {
    position: [0, -0.4, 0.1],
    rotation: [-90, 0, 180],
    scale: 0.3,
  },
  pistol: {
    position: [0, -0.4, 0.1],
    rotation: [-90, 0, 180],
    scale: 0.3,
  },
  burstRifle: {
    position: [0, -0.4, 0.1],
    rotation: [-90, 0, 180],
    scale: 0.3,
  },
};

const RemoteWeapon = ({ weaponId }: { weaponId: string }) => {
  // fallback to assault rifle if weaponid is invalid
  const safeWeaponId = modelsBank[weaponId] ? weaponId : "assaultRifle";
  const { scene } = useGLTF(modelsBank[safeWeaponId]);

  const transform =
    REMOTE_WEAPON_TRANSFORMS[safeWeaponId] ||
    REMOTE_WEAPON_TRANSFORMS.assaultRifle;

  return (
    <group
      position={transform.position}
      rotation={[
        THREE.MathUtils.degToRad(transform.rotation[0]),
        THREE.MathUtils.degToRad(transform.rotation[1]),
        THREE.MathUtils.degToRad(transform.rotation[2]),
      ]}
      scale={transform.scale}
    >
      <Clone object={scene} castShadow />
    </group>
  );
};

// pure visual robot component
const HoverBotModel = ({
  pos,
  mainColor,
  glowColor,
}: {
  pos: PlayerState;
  mainColor: string;
  glowColor: string;
}) => {
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const hoverRootRef = useRef<THREE.Group>(null);

  const { nodes, materials } = useGLTF(modelsBank.robot) as any;

  useFrame((_state, delta) => {
    // clamp pitch to max 85 degrees to prevent neck snapping
    const maxPitch = Math.PI / 2.2;
    const targetPitch = THREE.MathUtils.clamp(
      -(pos.pitch || 0),
      -maxPitch,
      maxPitch,
    );

    // lock Y and Z to 0 so the head never does a barrel roll
    if (headRef.current) {
      const currentPitch = headRef.current.rotation.x;
      const nextPitch = THREE.MathUtils.lerp(
        currentPitch,
        targetPitch,
        delta * 15,
      );
      headRef.current.rotation.set(nextPitch, 0, 0);
    }

    if (rightArmRef.current) {
      // bring the resting position of arm from down to forward
      const armTargetPitch = targetPitch - Math.PI / 2;

      const currentPitch = rightArmRef.current.rotation.x;
      const nextPitch = THREE.MathUtils.lerp(
        currentPitch,
        armTargetPitch,
        delta * 15,
      );
      rightArmRef.current.rotation.set(nextPitch, 0, 0);
    }

    // hover effect
    if (hoverRootRef.current) {
      hoverRootRef.current.position.y =
        -0.8 + Math.sin(performance.now() * 0.003 + pos.x) * 0.05;
    }
  });

  return (
    // axis correction
    <group ref={hoverRootRef} rotation={[0, Math.PI, 0]}>
      <PositionalAudio url={soundBank.thunder} distance={3} loop />
      <group name="origin">
        <mesh castShadow receiveShadow geometry={nodes.body.geometry}>
          <meshPhysicalMaterial
            copy={materials.White_Glossy}
            color={mainColor}
          />

          <mesh castShadow receiveShadow geometry={nodes.bottom.geometry}>
            <meshPhysicalMaterial
              copy={materials.White_Glossy}
              color={mainColor}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.bottom_emissive.geometry}
            >
              <meshStandardMaterial
                copy={materials.Blue_Light}
                color={glowColor}
                emissive={glowColor}
                emissiveIntensity={2}
              />
            </mesh>
          </mesh>

          <mesh castShadow receiveShadow geometry={nodes.chest.geometry}>
            <meshPhysicalMaterial
              copy={materials.White_Glossy}
              color={mainColor}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.chest_emissive.geometry}
            >
              <meshStandardMaterial
                copy={materials.Blue_Light}
                color={glowColor}
                emissive={glowColor}
                emissiveIntensity={2}
              />
            </mesh>
          </mesh>

          <group name="hand_left_pivot" position={[0.363, 0.932, 0]}>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.hand_left.geometry}
              position={[-0.363, -0.932, 0]}
            >
              <meshPhysicalMaterial
                copy={materials.White_Glossy}
                color={mainColor}
              />
            </mesh>
          </group>

          <group
            name="hand_right_pivot"
            ref={rightArmRef}
            position={[-0.363, 0.932, 0]}
          >
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.hand_right.geometry}
              position={[0.363, -0.932, 0]}
            >
              <meshPhysicalMaterial
                copy={materials.White_Glossy}
                color={mainColor}
              />
            </mesh>
            <RemoteWeapon weaponId={pos.currentWeapon || "assaultRifle"} />
          </group>

          <mesh castShadow receiveShadow geometry={nodes.neck.geometry}>
            <meshPhysicalMaterial
              copy={materials.White_Glossy}
              color={mainColor}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.neck_emissive.geometry}
            >
              <meshStandardMaterial
                copy={materials.Blue_Light}
                color={glowColor}
                emissive={glowColor}
                emissiveIntensity={2}
              />
            </mesh>
          </mesh>
        </mesh>

        <group ref={headRef} name="head_pivot" position={[0, 1.384, -0.042]}>
          <mesh castShadow receiveShadow geometry={nodes.head.geometry}>
            <meshPhysicalMaterial
              copy={materials.White_Glossy}
              color={mainColor}
            />

            <mesh
              castShadow
              receiveShadow
              geometry={nodes.antenna_left_emissive.geometry}
              position={[0, -1.384, 0.042]}
            >
              <meshStandardMaterial
                copy={materials.Blue_Light}
                color={glowColor}
                emissive={glowColor}
                emissiveIntensity={2}
              />
            </mesh>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.antenna_right_emissive.geometry}
              position={[0, -1.384, 0.042]}
            >
              <meshStandardMaterial
                copy={materials.Blue_Light}
                color={glowColor}
                emissive={glowColor}
                emissiveIntensity={2}
              />
            </mesh>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.ear_left_emissive.geometry}
              position={[0, -1.384, 0.042]}
            >
              <meshStandardMaterial
                copy={materials.Blue_Light}
                color={glowColor}
                emissive={glowColor}
                emissiveIntensity={2}
              />
            </mesh>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.ear_right_emissive.geometry}
              position={[0, -1.384, 0.042]}
            >
              <meshStandardMaterial
                copy={materials.Blue_Light}
                color={glowColor}
                emissive={glowColor}
                emissiveIntensity={2}
              />
            </mesh>

            <mesh
              castShadow
              receiveShadow
              geometry={nodes.ears.geometry}
              position={[0, -1.384, 0.042]}
              material={materials.Black_Matt}
            />

            <mesh
              castShadow
              receiveShadow
              geometry={nodes.face_visor.geometry}
              position={[0, -1.384, 0.042]}
              material={materials.Black_Matt}
            >
              <mesh castShadow receiveShadow geometry={nodes.eyes.geometry}>
                <meshStandardMaterial
                  copy={materials.Blue_Light}
                  color={glowColor}
                  emissive={glowColor}
                  emissiveIntensity={2}
                />
              </mesh>
              <mesh castShadow receiveShadow geometry={nodes.mouth.geometry}>
                <meshStandardMaterial
                  copy={materials.Blue_Light}
                  color={glowColor}
                  emissive={glowColor}
                  emissiveIntensity={2}
                />
              </mesh>
            </mesh>
          </mesh>
        </group>
      </group>
    </group>
  );
};

// individual network entity wrapper
const RemotePlayerItem = ({ pos }: { pos: PlayerState }) => {
  const mainColor =
    pos.team === "red"
      ? "#ff4444"
      : pos.team === "blue"
        ? "#4444ff"
        : pos.color;
  const glowColor =
    pos.team === "red"
      ? "#ff8888"
      : pos.team === "blue"
        ? "#8888ff"
        : "#00ffff";

  return (
    <RigidBody type="kinematicPosition" position={[pos.x, pos.y, pos.z]}>
      <group rotation={[0, pos.yaw, 0]}>
        <HoverBotModel pos={pos} mainColor={mainColor} glowColor={glowColor} />
        <RemotePlayersUI player={pos} />
      </group>
    </RigidBody>
  );
};

// main render loop
const RemotePlayers = () => {
  const players = useGameStore((state) => state.players);
  const localId = useGameStore((state) => state.localId);

  return (
    <>
      {Object.entries(players)
        .filter(([id, pos]) => id !== localId && !pos.isDead)
        .map(([id, pos]) => (
          <RemotePlayerItem key={id} pos={pos} />
        ))}
    </>
  );
};

export default RemotePlayers;

useGLTF.preload(modelsBank.robot);
