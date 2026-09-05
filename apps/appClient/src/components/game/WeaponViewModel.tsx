import { useEffect, useRef } from "react";
import { Clone, useGLTF } from "@react-three/drei";
import { Group, MathUtils, Object3D, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import useSound from "use-sound";
import { useGameStore } from "../../stores/useGameStore";
import { modelsBank, soundBank } from "../../utils/assetPaths";
import { combatState, type WeaponId } from "@block-shooter/shared";
import {
  useEquipAnimation,
  useIdleSway,
  useMouseSway,
  useRecoil,
  useMagazineReload,
  useStrafeSway,
} from "../../hooks/useWeaponAnimations";
import MuzzleFlash from "./MuzzleFlash";

// define weapon transform properties
type WeaponTransform = {
  posX: number;
  posY: number;
  posZ: number;
  adsX: number;
  adsY: number;
  adsZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
};

// map weapon identifiers to transform data
const WEAPON_TRANSFORMS: Record<WeaponId, WeaponTransform> = {
  assaultRifle: {
    posX: 0.29,
    posY: -0.09,
    posZ: -0.52,
    adsX: 0.0,
    adsY: -0.12,
    adsZ: -0.4,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    scale: 0.16,
  },
  pistol: {
    posX: 0.29,
    posY: -0.09,
    posZ: -0.52,
    adsX: 0.0,
    adsY: -0.12,
    adsZ: -0.4,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    scale: 0.16,
  },
  burstRifle: {
    posX: 0.29,
    posY: -0.09,
    posZ: -0.52,
    adsX: 0.0,
    adsY: -0.12,
    adsZ: -0.4,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    scale: 0.16,
  },
};

// map weapon identifiers to muzzle flash coordinates
const MUZZLE_FLASH_POS: Record<WeaponId, [number, number, number]> = {
  assaultRifle: [0, 0.1, -1.5],
  burstRifle: [0, 0, -1.5],
  pistol: [0, 0.15, -0.5],
};

export default function WeaponViewModel() {
  // reference to the main group holding the weapon
  const groupRef = useRef<Group>(null);
  // reference to the cloned scene
  const cloneRef = useRef<Group>(null);

  // fetch local player state from game store
  const localId = useGameStore((state) => state.localId);
  const players = useGameStore((state) => state.players);
  const me = localId ? players[localId] : null;
  // determine current weapon and reload status
  const currentWeapon = (me?.currentWeapon as WeaponId) || "assaultRifle";
  const isReloading = me?.isReloading || false;

  // load the specific weapon model
  const { scene } = useGLTF(
    modelsBank[currentWeapon] || modelsBank.assaultRifle,
  );

  // references for animating the weapon magazine
  const magNodeRef = useRef<Object3D | null>(null);
  const originalMagPos = useRef(new Vector3());

  // resolve dynamic sound urls based on current weapon state
  const fireSoundUrl =
    soundBank[`${currentWeapon}Fire`] || soundBank.assaultRifleFire;
  const reloadSoundUrl =
    soundBank[`${currentWeapon}Reload`] || soundBank.assaultRifleReload;

  // initialize local player sounds dynamically
  const [playShoot] = useSound(fireSoundUrl, { volume: 0.6 });
  const [playReload] = useSound(reloadSoundUrl, { volume: 0.6 });

  // trigger shoot sound on global fire event
  useEffect(() => {
    const onShoot = () => {
      playShoot();
    };

    window.addEventListener("weapon-fired", onShoot);
    return () => window.removeEventListener("weapon-fired", onShoot);
  }, [playShoot]);

  // trigger reload sound when reloading state updates
  useEffect(() => {
    if (isReloading) {
      playReload();
    }
  }, [isReloading, playReload]);

  // find and store the magazine mesh for reload animations
  useEffect(() => {
    let found: Object3D | null = null;

    if (cloneRef.current) {
      cloneRef.current.traverse((child) => {
        if (child.name.toLowerCase().includes("mag")) {
          found = child;
        }
      });
    }

    magNodeRef.current = found;

    if (found) {
      originalMagPos.current.copy((found as Object3D).position);
    }
  }, [currentWeapon, scene]);

  // read transforms directly from static config based on current weapon
  const { posX, posY, posZ, adsX, adsY, adsZ, rotX, rotY, rotZ, scale } =
    WEAPON_TRANSFORMS[currentWeapon] || WEAPON_TRANSFORMS.assaultRifle;

  // initialize animation hooks
  const getEquipOffset = useEquipAnimation(currentWeapon);
  const getStrafeRoll = useStrafeSway(combatState.isAiming);
  const getMouseSway = useMouseSway(combatState.isAiming);
  const getIdleSway = useIdleSway(combatState.isAiming);
  const getRecoil = useRecoil();
  const getMagDrop = useMagazineReload(isReloading);

  // run procedural animations every frame
  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    // determine target position based on aim state
    const targetX = combatState.isAiming ? adsX : posX;
    const targetY = combatState.isAiming ? adsY : posY;
    const targetZ = combatState.isAiming ? adsZ : posZ;

    // fetch current animation offsets
    const equipOffset = getEquipOffset();
    const strafeRoll = getStrafeRoll();
    const mouseSway = getMouseSway();
    const idleSway = getIdleSway(delta);
    const recoil = getRecoil();
    const magOffset = getMagDrop(delta);

    // apply animation to the clone magazine
    if (magNodeRef.current) {
      magNodeRef.current.position.y = originalMagPos.current.y + magOffset;
    }

    // apply final blended positions and rotations
    groupRef.current.position.set(
      MathUtils.lerp(
        groupRef.current.position.x,
        targetX + mouseSway * 0.5 + idleSway.x,
        0.15,
      ),
      MathUtils.lerp(
        groupRef.current.position.y,
        targetY + equipOffset + idleSway.y + recoil.y,
        0.15,
      ),
      MathUtils.lerp(groupRef.current.position.z, targetZ + recoil.z, 0.15),
    );

    groupRef.current.rotation.set(
      rotX - recoil.rotX,
      rotY - mouseSway,
      rotZ + strafeRoll + mouseSway * 0.5,
    );
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* render the cloned weapon model */}
      <Clone ref={cloneRef} object={scene} />
      {/* position the muzzle flash dynamically based on equipped weapon */}
      <MuzzleFlash
        position={
          MUZZLE_FLASH_POS[currentWeapon] || MUZZLE_FLASH_POS.assaultRifle
        }
      />
    </group>
  );
}

Object.values(modelsBank).forEach((path) => useGLTF.preload(path));
