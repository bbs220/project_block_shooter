import { useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useGameStore } from "../../stores/useGameStore";
import {
  WEAPONS,
  movementState,
  combatState,
  PLAYER_CONFIG,
  PHYSICS_CONFIG,
  MAPS,
} from "@block-shooter/shared";
import { calculateHeadbobOffset } from "../../utils/headbob";
import { FOV } from "../../utils/tunablesClient";

const euler = new THREE.Euler(0, 0, 0, "YXZ");

// pre-calculate bounds same as server
const currentMap = MAPS.arena_01;
const maxBoundX = currentMap.floor.width / 2 - 1.5;
const maxBoundZ = currentMap.floor.depth / 2 - 1.5;

export default function LocalPlayer() {
  const localId = useGameStore((state) => state.localId);
  const players = useGameStore((state) => state.players);
  const channel = useGameStore((state) => state.channel);
  const setLocked = useGameStore((state) => state.setLocked);
  const setCrosshairSpread = useGameStore((state) => state.setCrosshairSpread);

  const lastEmit = useRef(0);
  const initialized = useRef(false);
  const lastShotClient = useRef(0);
  const triggerReady = useRef(true);
  const burstShotsLeft = useRef(0);
  const currentSpread = useRef(0);
  const bobTime = useRef(0);

  const direction = useRef(new THREE.Vector3());
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Write directly to your shared state
      if (key === "w") movementState.forward = true;
      if (key === "s") movementState.backward = true;
      if (key === "a") movementState.left = true;
      if (key === "d") movementState.right = true;
      if (key === "shift") movementState.sprint = true;

      if (key === " ") {
        movementState.jump = true;
        if (channel) channel.emit("jump");
      }

      // Weapon switching
      if (key === "1" && channel) channel.emit("switchWeapon", "assaultRifle");
      if (key === "2" && channel) channel.emit("switchWeapon", "pistol");
      if (key === "3" && channel) channel.emit("switchWeapon", "burstRifle");

      // Reloading
      if (key === "r" && channel) channel.emit("reload");
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === "w") movementState.forward = false;
      if (key === "s") movementState.backward = false;
      if (key === "a") movementState.left = false;
      if (key === "d") movementState.right = false;
      if (key === "shift") movementState.sprint = false;
      if (key === " ") movementState.jump = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && useGameStore.getState().isLocked) {
        combatState.isShooting = true;
      }
      if (e.button === 2 && useGameStore.getState().isLocked) {
        combatState.isAiming = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        combatState.isShooting = false;
        triggerReady.current = true;
      }
      if (e.button === 2) {
        combatState.isAiming = false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [channel]);

  useFrame((state, delta) => {
    if (!localId) return;

    const camera = state.camera as THREE.PerspectiveCamera;
    const me = players[localId];

    // Read the physics Y from the server and add the eye-level offset (+0.5)
    // Server center = 1.0 (on ground). Eye level = 1.5.
    const currentEyeLevel = me
      ? me.y + PLAYER_CONFIG.EYE_LEVEL_OFFSET
      : 1.0 + PLAYER_CONFIG.EYE_LEVEL_OFFSET;

    if (me) {
      // calculate the 2D distance between your local camera and the server's true position
      const dist = Math.sqrt(
        Math.pow(me.x - camera.position.x, 2) +
          Math.pow(me.z - camera.position.z, 2),
      );

      // snap the camera if: initializing, dead, OR violently teleported (> 10 units away)
      if (!initialized.current || me.isDead || dist > 10.0) {
        camera.position.set(me.x, currentEyeLevel, me.z);
        initialized.current = true;
      }
    }

    if (currentSpread.current > 0) {
      currentSpread.current -= delta * 60;
      if (currentSpread.current < 0) currentSpread.current = 0;
    }

    const targetFov = combatState.isAiming ? FOV / 1.5 : FOV;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.15);
    camera.updateProjectionMatrix();

    // read from movement state
    const forward =
      (movementState.forward ? 1 : 0) - (movementState.backward ? 1 : 0);
    const right = (movementState.left ? 1 : 0) - (movementState.right ? 1 : 0);

    if (forward !== 0 || right !== 0) {
      let aimPenalty = 1.0;

      if (combatState.isAiming && me) {
        // Pistol stays at 1.0 (0% penalty - Full speed!)
        if (me.currentWeapon === "assaultRifle") aimPenalty = 0.85; // 15% slower
        if (me.currentWeapon === "burstRifle") aimPenalty = 0.6; // 40% slower (Tactical)
      }

      // Apply the penalty to the base speed
      const baseSpeed = movementState.sprint
        ? PHYSICS_CONFIG.SPRINT_SPEED
        : PHYSICS_CONFIG.WALK_SPEED;
      const speed = baseSpeed * aimPenalty * delta;

      camera.getWorldDirection(frontVector.current);
      frontVector.current.y = 0;
      frontVector.current.normalize();

      sideVector.current
        .crossVectors(camera.up, frontVector.current)
        .normalize();

      direction.current
        .set(0, 0, 0)
        .addScaledVector(frontVector.current, forward)
        .addScaledVector(sideVector.current, right)
        .normalize()
        .multiplyScalar(speed);

      // calculate where the camera WANTS to go
      let nextX = camera.position.x + direction.current.x;
      let nextZ = camera.position.z + direction.current.z;

      // force the camera to stop exactly at the wall's inner edge
      nextX = THREE.MathUtils.clamp(nextX, -maxBoundX, maxBoundX);
      nextZ = THREE.MathUtils.clamp(nextZ, -maxBoundZ, maxBoundZ);

      // apply the clamped position
      camera.position.x = nextX;
      camera.position.z = nextZ;

      currentSpread.current = Math.min(currentSpread.current + delta * 30, 15);

      bobTime.current += delta;

      const bobOffset = calculateHeadbobOffset(
        bobTime.current,
        movementState.sprint,
      );

      camera.position.y = currentEyeLevel + bobOffset;
    } else {
      // recovery when stopping
      bobTime.current = 0; // reset timer

      // lerp the camera back to resting eye-level so it doesn't snap abruptly
      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        currentEyeLevel,
        0.1,
      );
    }

    const now = performance.now();

    // combat state
    if (me && !me.isDead && !me.isReloading && me.ammo > 0) {
      const weapon = WEAPONS[me.currentWeapon];

      // burst override: If we are in the middle of a burst, finish it
      if (burstShotsLeft.current > 0) {
        if (now - lastShotClient.current >= weapon.fireRate) {
          const dir = new THREE.Vector3();
          camera.getWorldDirection(dir);

          if (channel)
            channel.emit("shoot", { dirX: dir.x, dirY: dir.y, dirZ: dir.z });
          window.dispatchEvent(new Event("weapon-fired"));

          lastShotClient.current = now;
          burstShotsLeft.current -= 1;
          currentSpread.current = Math.min(currentSpread.current + 15, 40);
        }
      }
      // handle standard shooting
      else if (combatState.isShooting && channel) {
        if (now - lastShotClient.current >= weapon.fireRate) {
          if (weapon.mode === "auto" || triggerReady.current) {
            // fire the first shot immediately regardless of weapon mode
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);

            channel.emit("shoot", { dirX: dir.x, dirY: dir.y, dirZ: dir.z });
            window.dispatchEvent(new Event("weapon-fired"));

            lastShotClient.current = now;
            currentSpread.current = Math.min(currentSpread.current + 15, 40);

            // if it's a burst weapon, queue up the remaining shots
            if (weapon.mode === "burst") {
              // queue (Max Shots - 1) because just fired the first one above
              burstShotsLeft.current = Math.min(3, me.ammo) - 1;
            }

            // lock the trigger for non-auto weapons so you can't hold it down
            if (weapon.mode !== "auto") {
              triggerReady.current = false;
            }
          }
        }
      }
    }

    setCrosshairSpread(currentSpread.current);

    if (channel && now - lastEmit.current > 50) {
      // safely extract yaw and pitch without gimbal lock
      euler.setFromQuaternion(camera.quaternion);

      channel.emit("playerInput", {
        yaw: euler.y,
        pitch: euler.x,
        x: camera.position.x,
        z: camera.position.z,
        // no need to emit Y anymore! the server handles it.
      });
      lastEmit.current = now;
    }
  });

  return (
    <PointerLockControls
      selector="#play-button"
      onLock={() => setLocked(true)}
      onUnlock={() => setLocked(false)}
    />
  );
}
