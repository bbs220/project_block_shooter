import { ServerPlayerState } from "../types/typesSource.js";

// central authoritative state
export const players = new Map<string, ServerPlayerState>();

// global match state matching your client interface
export const matchData = {
  mode: "tdm",
  matchState: "waiting", // for mvp waiting then playing
  timeRemaining: 240,
  teamScores: { red: 0, blue: 0 },
};

// helper to serialize state for socket broadcast
export const getFullState = () => {
  const safePlayers: Record<string, any> = {};

  players.forEach((player, id) => {
    // extract both the timer and the physics body
    const { reloadTimer, body, ...safePlayerData } = player;
    safePlayers[id] = safePlayerData;
  });

  // bundle the payload
  return {
    players: safePlayers,
    ...matchData, // spread the match data so it sits at the root level of the payload
  };
};
