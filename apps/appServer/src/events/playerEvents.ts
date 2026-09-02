import { Server, Socket } from "socket.io";
import RAPIER from "@dimforge/rapier3d-compat";
import {
  getRandomColor,
  getRandomName,
  getRandomSpawn,
} from "../utils/helpers.js";
import { matchData, players } from "../state/gameState.js";
import { logger } from "../utils/logger.js";
import { world } from "../index.js";
import {
  WEAPONS,
  PHYSICS_CONFIG,
  PLAYER_CONFIG,
  WINNING_RULES,
} from "@block-shooter/shared";

// --- UTILS ---

export function isPlayerOnGround(playerBody: RAPIER.RigidBody): boolean {
  const position = playerBody.translation();

  // Start ray just below the capsule so it doesn't hit the player's own body
  const rayOrigin = {
    x: position.x,
    y: position.y - (PLAYER_CONFIG.HALF_HEIGHT + 0.01),
    z: position.z,
  };
  const rayDirection = { x: 0, y: -1.0, z: 0 };
  const ray = new RAPIER.Ray(rayOrigin, rayDirection);

  const hit = world.castRay(ray, 0.1, true);
  return hit !== null;
}

export function scheduleRespawn(id: string, delayMs: number = 3000) {
  setTimeout(() => {
    const p = players.get(id);
    if (p) {
      p.health = 100;
      p.isDead = false;

      // Refill ammo on respawn
      const weapon = WEAPONS[p.currentWeapon];
      if (weapon) {
        p.ammo = weapon.magSize;
        p.magazines[p.currentWeapon] = weapon.magSize;
      }

      const newSpawn = getRandomSpawn(p.team);
      p.x = newSpawn.x;
      p.y = 10.0;
      p.z = newSpawn.z;

      p.body.setTranslation(
        { x: newSpawn.x, y: 10.0, z: newSpawn.z },
        true, // wake up physics body
      );

      logger.info(`${p.name} respawned!`);
    }
  }, delayMs);
}

// --- EVENT HANDLERS ---

export function handleConnection(socket: Socket) {
  if (!socket.id) return;

  const playerName = getRandomName();
  let redCount = 0;
  let blueCount = 0;

  players.forEach((p) => {
    if (p.team === "red") redCount++;
    if (p.team === "blue") blueCount++;
  });

  const assignedTeam = redCount <= blueCount ? "red" : "blue";
  const spawnPoint = getRandomSpawn(assignedTeam);
  const teamColor = assignedTeam === "red" ? "#ef4444" : "#3b82f6";

  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(spawnPoint.x, 10.0, spawnPoint.z)
    .lockRotations();

  const body = world.createRigidBody(bodyDesc);
  body.userData = { id: socket.id };

  const colliderDesc = RAPIER.ColliderDesc.capsule(
    PLAYER_CONFIG.HALF_HEIGHT,
    PLAYER_CONFIG.RADIUS,
  );
  world.createCollider(colliderDesc, body);

  players.set(socket.id, {
    name: playerName,
    color: teamColor,
    team: assignedTeam,
    x: spawnPoint.x,
    y: 10.0,
    z: spawnPoint.z,
    yaw: 0,
    pitch: 0,
    health: 100,
    isDead: false,
    kills: 0,
    deaths: 0,
    currentWeapon: "assaultRifle",
    ammo: WEAPONS["assaultRifle"].magSize,
    magazines: {
      assaultRifle: WEAPONS["assaultRifle"].magSize,
      pistol: WEAPONS["pistol"].magSize,
      burstRifle: WEAPONS["burstRifle"].magSize,
    },
    isReloading: false,
    lastShotTime: 0,
    reloadTimer: null,
    body: body,
  });

  logger.info(
    `user connected: ${playerName} (${socket.id}) joined team ${assignedTeam}`,
  );
}

export function handlePlayerInput(id: string, data: any) {
  const player = players.get(id);

  if (player && !player.isDead) {
    player.yaw = data.yaw ?? player.yaw;
    player.pitch = data.pitch ?? player.pitch;

    const currentPos = player.body.translation();

    player.x = data.x ?? player.x;
    player.z = data.z ?? player.z;
    player.y = currentPos.y; // Trust the server for Y!

    player.body.setTranslation(
      {
        x: player.x,
        y: player.y,
        z: player.z,
      },
      true,
    );
  }
}

export function handleJump(id: string) {
  const player = players.get(id);

  if (player && !player.isDead) {
    if (isPlayerOnGround(player.body)) {
      player.body.setLinvel({ x: 0, y: PHYSICS_CONFIG.JUMP_FORCE, z: 0 }, true);
    }
  }
}

export function handleSwitchWeapon(
  id: string,
  weaponId: "assaultRifle" | "pistol" | "burstRifle",
) {
  const player = players.get(id);
  if (!player || player.isDead) return;

  if (player.isReloading) {
    player.isReloading = false;
    if (player.reloadTimer) {
      clearTimeout(player.reloadTimer);
      player.reloadTimer = null;
    }
  }

  if (
    weaponId === "assaultRifle" ||
    weaponId === "pistol" ||
    weaponId === "burstRifle"
  ) {
    player.currentWeapon = weaponId;
    player.ammo = player.magazines[weaponId];
  }
}

export function handleReload(id: string) {
  const player = players.get(id);
  if (!player || player.isDead || player.isReloading) return;

  const weapon = WEAPONS[player.currentWeapon];
  if (player.ammo === weapon.magSize) return;

  player.isReloading = true;

  player.reloadTimer = setTimeout(() => {
    if (players.has(id)) {
      const p = players.get(id)!;
      p.magazines[p.currentWeapon] = weapon.magSize;
      p.ammo = weapon.magSize;
      p.isReloading = false;
      p.reloadTimer = null;
    }
  }, weapon.reloadTime);
}

export function handleShoot(id: string, data: any, io: Server) {
  const shooter = players.get(id);
  if (!shooter || shooter.isDead || shooter.isReloading) return;

  const weapon = WEAPONS[shooter.currentWeapon];
  const range = weapon.range ?? 100;
  const now = Date.now();

  if (now - shooter.lastShotTime < weapon.fireRate - 10) return;
  if (shooter.ammo <= 0) return;

  shooter.magazines[shooter.currentWeapon] -= 1;
  shooter.ammo = shooter.magazines[shooter.currentWeapon];
  shooter.lastShotTime = now;

  // origin: exactly at the shooter's camera level
  const origin = {
    x: shooter.x,
    y: shooter.y + PLAYER_CONFIG.EYE_LEVEL_OFFSET,
    z: shooter.z,
  };
  const direction = { x: data.dirX, y: data.dirY, z: data.dirZ };
  const ray = new RAPIER.Ray(origin, direction);

  const hit = world.castRay(
    ray,
    range,
    true,
    undefined,
    undefined,
    undefined,
    shooter.body,
  );

  if (hit && hit.collider) {
    const hitId = hit.collider.parent()?.userData?.id;

    if (hitId && hitId !== id) {
      const hitPlayer = players.get(hitId);

      if (hitPlayer && !hitPlayer.isDead) {
        // prevent friendly fire
        if (shooter.team === hitPlayer.team) return;

        hitPlayer.health -= weapon.damage;

        logger.info(
          `${shooter.name} hit ${hitPlayer.name} with ${weapon.name}! hp: ${hitPlayer.health}`,
        );

        io.emit("hit_confirm", id);

        if (hitPlayer.health <= 0) {
          hitPlayer.isDead = true;
          shooter.kills += 1;
          hitPlayer.deaths += 1;

          if (matchData.mode === "tdm") {
            matchData.teamScores[shooter.team] += 1;
          }

          const scoreLimit = WINNING_RULES.tdmScoreLimit;
          if (matchData.teamScores[shooter.team] >= scoreLimit) {
            logger.info(
              `mercy Rule: team ${shooter.team.toUpperCase()} hit ${scoreLimit} kills!`,
            );
            matchData.timeRemaining = 0; // instantly triggers the match reset loop in index.ts
          }

          logger.info(
            `${shooter.name} killed ${hitPlayer.name} with ${weapon.name}!`,
          );

          io.emit("kill_feed", {
            id: Math.random().toString(36).substring(2, 9),
            shooter: shooter.name,
            shooterId: id,
            target: hitPlayer.name,
            weapon: weapon.name,
            shooterTeam: shooter.team,
            targetTeam: hitPlayer.team,
          });

          // CLEAN RESPawn Logic
          scheduleRespawn(hitId, 3000);
        }
      }
    }
  }

  if (shooter.ammo === 0) {
    handleReload(id);
  }
}

export function handleDisconnect(id: string, reason: string) {
  const player = players.get(id);
  if (player) {
    logger.info(`user disconnected: ${player.name} (${reason})`);
    if (player.body) {
      world.removeRigidBody(player.body);
    }
  }
  players.delete(id);
}
