import { create } from "zustand";
import type { Socket } from "socket.io-client";

// specific types for strictness
export type WeaponType = "assaultRifle" | "pistol" | "burstRifle";
export type TeamType = "red" | "blue" | "none";
export type MatchState = "waiting" | "playing" | "ended";
export type GameMode = "tdm";
export type ConnectionStatus = "stable" | "disconnecting" | "disconnected";

export type PlayerState = {
  // identity
  name: string;
  color: string;
  team: TeamType;

  // transform
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;

  // combat stats
  health: number;
  isDead: boolean;
  kills: number;
  deaths: number;

  // weapon state
  currentWeapon: WeaponType;
  ammo: number;
  isReloading: boolean;
};

export type KillEvent = {
  id: string;
  shooter: string;
  target: string;
  weapon: string;
  shooterTeam: TeamType;
  targetTeam: TeamType;
  timestamp: number;
};

export type GameStore = {
  // network and identity
  localId: string | null;
  channel: Socket | null;
  isConnected: boolean;
  ping: number;
  connectionStatus: ConnectionStatus;

  // global match state
  mode: GameMode;
  matchState: MatchState;
  timeRemaining: number;
  teamScores: { red: number; blue: number };

  // players dictionary
  players: Record<string, PlayerState>;

  // actions
  setLocalId: (id: string) => void;
  setChannel: (channel: Socket) => void;
  setIsConnected: (connected: boolean) => void;
  setPing: (ping: number) => void;
  setPlayers: (players: Record<string, PlayerState>) => void;

  // generic updater for match info
  updateMatchData: (data: Partial<GameStore>) => void;

  // pseudo pause state
  isLocked: boolean;
  setLocked: (locked: boolean) => void;

  // for kill feed in ui
  killFeed: KillEvent[];
  addKillEvent: (event: KillEvent) => void;
  removeOldKills: () => void;

  // dynamic crosshair
  crosshairSpread: number;
  setCrosshairSpread: (spread: number) => void;
};

export const useGameStore = create<GameStore>((set) => ({
  localId: null,
  channel: null,
  isConnected: false,
  ping: 0,
  connectionStatus: "disconnected",

  // default match state
  mode: "tdm",
  matchState: "waiting",
  timeRemaining: 240, // 4 minutes in seconds
  teamScores: { red: 0, blue: 0 },

  players: {},

  // setters
  setLocalId: (id) => set({ localId: id }),
  setChannel: (channel) => set({ channel }),

  // automatically compute status when connection changes
  setIsConnected: (connected) =>
    set((state) => {
      let status: ConnectionStatus = "stable";
      if (!connected) {
        status = "disconnected";
      } else if (state.ping > 150) {
        status = "disconnecting";
      }
      return { isConnected: connected, connectionStatus: status };
    }),

  // automatically compute status when ping changes
  setPing: (ping) =>
    set((state) => {
      let status: ConnectionStatus = "stable";
      if (!state.isConnected) {
        status = "disconnected";
      } else if (ping > 150) {
        status = "disconnecting";
      }
      return { ping, connectionStatus: status };
    }),

  setPlayers: (players) => set({ players }),
  updateMatchData: (data) => set((state) => ({ ...state, ...data })),

  isLocked: false,
  setLocked: (locked) => set({ isLocked: locked }),

  killFeed: [],

  addKillEvent: (event) =>
    set((state) => {
      if (state.killFeed.some((k) => k.id === event.id)) {
        return state;
      }
      return { killFeed: [...state.killFeed, event] };
    }),

  removeOldKills: () =>
    set((state) => {
      const now = Date.now();
      // keep messages that are less than five seconds old
      return {
        killFeed: state.killFeed.filter((k) => now - k.timestamp < 5000),
      };
    }),

  crosshairSpread: 0,
  setCrosshairSpread: (spread) => set({ crosshairSpread: spread }),
}));
