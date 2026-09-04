import "dotenv/config";
import { logger } from "./utils/logger.js";
import { Server } from "socket.io";
import RAPIER from "@dimforge/rapier3d-compat";
import http from "http";
import { expressApp } from "./expressApp.js";
import { getFullState, matchData, players } from "./state/gameState.js";
import {
  handleConnection,
  handleDisconnect,
  handlePlayerInput,
  handleShoot,
  handleSwitchWeapon,
  handleReload,
  handleJump,
  scheduleRespawn,
} from "./events/playerEvents.js";
import { getRandomSpawn } from "./utils/helpers.js";
import { envValid } from "./utils/envValid.js";
import { GRAVITY, MAPS } from "@block-shooter/shared";

const PORT = Number(envValid.PORT) || 9208;

// export world so playerevents can import it
export let world: RAPIER.World;

const deathZoneY = -50.0;
const currentMap = MAPS["arena_01"];

// calculate the maximum safe x and z bounds outside the loop to save cpu.
// subtract 1.5 meters from the edge to account for the wall thickness + player radius.
const maxBoundX = currentMap.floor.width / 2 - 1.5;
const maxBoundZ = currentMap.floor.depth / 2 - 1.5;

async function startServer() {
  // wait for webassembly to compile and load
  await RAPIER.init();

  // initialize world before allowing any connections
  world = new RAPIER.World(GRAVITY);
  logger.info("physics world initialized");

  // create a single fixed rigidbody for the whole arena
  const arenaBodyDesc = RAPIER.RigidBodyDesc.fixed();
  const arenaBody = world.createRigidBody(arenaBodyDesc);

  // floor collider
  const floorDesc = RAPIER.ColliderDesc.cuboid(
    currentMap.floor.width / 2,
    currentMap.floor.thickness / 2,
    currentMap.floor.depth / 2,
  ).setTranslation(currentMap.floor.x, currentMap.floor.y, currentMap.floor.z);
  world.createCollider(floorDesc, arenaBody);

  // dynamic wall colliders
  currentMap.walls.forEach((wall) => {
    const wallDesc = RAPIER.ColliderDesc.cuboid(
      wall.width / 2,
      wall.height / 2,
      wall.depth / 2,
    ).setTranslation(wall.x, wall.y, wall.z);

    world.createCollider(wallDesc, arenaBody);
  });

  logger.info(`loaded physical map colliders: ${currentMap.name}`);

  // setup unified http and socket server
  const expressServer = http.createServer(expressApp);

  const io = new Server(expressServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // listen on the http server instead of direct io listen
  expressServer.listen(PORT, () => {
    logger.info(`🚀 server is live`);
  });

  // handle clean exit on terminal interrupt
  process.on("SIGTERM", () => {
    // close the server to free up the port
    expressServer.close(() => {
      // exit the node process
      process.exit();
    });
  });

  // handle clean exit on nodemon or tsx restart
  process.on("SIGINT", () => {
    // close the server to free up the port
    expressServer.close(() => {
      // exit the node process
      process.exit();
    });
  });

  io.on("connection", (socket) => {
    if (!socket.id) return;

    handleConnection(socket as any);

    socket.on("playerInput", (data: any) => {
      handlePlayerInput(socket.id, data);
    });

    socket.on("jump", () => {
      handleJump(socket.id);
    });

    socket.on("shoot", (data: any) => {
      handleShoot(socket.id, data, io as any);
    });

    socket.on("switchWeapon", (weaponId: any) => {
      handleSwitchWeapon(socket.id, weaponId);
    });

    socket.on("reload", () => {
      handleReload(socket.id);
    });

    socket.on("disconnect", (reason) => {
      handleDisconnect(socket.id, reason);
    });

    socket.on("error", (err) => {
      logger.error(`channel error for ${socket.id}: ${err}`);
    });
  });

  const tickRate = 60;
  const tickInterval = 1000 / tickRate;

  let debugTickCounter = 0;

  function gameLoop() {
    // step the physics simulation forward
    world.step();

    // the 'id' as the second parameter in the forEach
    players.forEach((p, id) => {
      if (!p.isDead && p.body) {
        const pos = p.body.translation();

        // death zone check aka falling below map
        if (pos.y < deathZoneY) {
          logger.warn(`player fell out of bounds: ${p.name}, respawing...`);

          p.health = 0;
          p.isDead = true;
          p.deaths += 1;

          io.emit("kill_feed", {
            id: Math.random().toString(36).substring(2, 9),
            shooter: "Environment",
            target: p.name,
            weapon: "Gravity",
            shooterTeam: "none",
            targetTeam: p.team,
          });

          scheduleRespawn(id, 1000);
        } else {
          // hard boundary check aka anti tunneling / map escapes
          let isOutOfBounds = false;
          let safeX = pos.x;
          let safeZ = pos.z;

          if (pos.x > maxBoundX) {
            safeX = maxBoundX;
            isOutOfBounds = true;
          } else if (pos.x < -maxBoundX) {
            safeX = -maxBoundX;
            isOutOfBounds = true;
          }

          if (pos.z > maxBoundZ) {
            safeZ = maxBoundZ;
            isOutOfBounds = true;
          } else if (pos.z < -maxBoundZ) {
            safeZ = -maxBoundZ;
            isOutOfBounds = true;
          }

          // if they broke the limits, rubber-band them back inside and kill their velocity
          if (isOutOfBounds) {
            p.body.setTranslation({ x: safeX, y: pos.y, z: safeZ }, true);
            p.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            logger.warn(`player ${p.name} clamped inside arena bounds.`);

            // overwrite our local pos variable for the rest of the tick
            pos.x = safeX;
            pos.z = safeZ;
          }
        }

        // now trust the physics engine as the ultimate source of truth
        p.x = pos.x;
        p.y = pos.y;
        p.z = pos.z;
      }
    });

    debugTickCounter++;
    if (debugTickCounter % 60 === 0) {
      // very heavy logs do not run this for long time
      // logger.info(
      //   "SOCKET PAYLOAD SNAPSHOT:\n" + JSON.stringify(getFullState(), null, 2),
      // );
    }

    // broadcast the clean serialized state
    io.emit("state", getFullState());
  }

  setInterval(gameLoop, tickInterval);

  // the 1hz slow loop for the match timer
  setInterval(() => {
    const playerCount = players.size;

    // if the server is completely empty, reset and wait.
    if (playerCount === 0) {
      if (matchData.matchState !== "waiting") {
        matchData.matchState = "waiting";
        matchData.timeRemaining = 240;
        matchData.teamScores = { red: 0, blue: 0 };
        logger.info("server empty, match reset to waiting state.");
      }
      return; // stop here, don't tick the clock down!
    }

    // if players are here and we are waiting, start the match!
    if (matchData.matchState === "waiting" && playerCount > 0) {
      matchData.matchState = "playing";
      logger.info("players detected, starting match!");
    }

    // tick the clock down if we are actively playing
    if (matchData.matchState === "playing") {
      matchData.timeRemaining -= 1;
      // clamp
      if (matchData.timeRemaining < 0) matchData.timeRemaining = 0;

      if (matchData.timeRemaining <= 0) {
        matchData.matchState = "ended";
        logger.info("match has ended!");

        // simple mvp reset: wait 5 seconds, then restart the match
        setTimeout(() => {
          // double check if everyone left during the 5-second scoreboard screen
          matchData.matchState = players.size > 0 ? "playing" : "waiting";
          matchData.timeRemaining = 240;
          matchData.teamScores = { red: 0, blue: 0 };

          const modes = ["tdm"];
          matchData.mode = modes[Math.floor(Math.random() * modes.length)];
          logger.info(
            `server selected new mode: ${matchData.mode.toUpperCase()}`,
          );

          // reset all players' stats and health for the new match
          players.forEach((p) => {
            p.kills = 0;
            p.deaths = 0;
            p.health = 100;
            p.isDead = false;

            // teleport everyone back to a proper team spawn point
            const newSpawn = getRandomSpawn(p.team);
            p.x = newSpawn.x;
            p.z = newSpawn.z;
            p.body.setTranslation(
              {
                x: newSpawn.x,
                y: 10.0, // drop them from the sky again!
                z: newSpawn.z,
              },
              true,
            ); // 'true' wakes the body up if it went to sleep
          });

          logger.info("new match started!");
        }, 5000);
      }
    }
  }, 1000);
}

// boot the server
startServer();
