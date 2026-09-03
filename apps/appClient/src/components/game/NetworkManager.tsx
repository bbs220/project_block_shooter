import { useEffect } from "react";
import { io } from "socket.io-client";
import { useGameStore } from "../../stores/useGameStore";

export function NetworkManager() {
  const setPlayers = useGameStore((state) => state.setPlayers);
  const setLocalId = useGameStore((state) => state.setLocalId);
  const setChannel = useGameStore((state) => state.setChannel);

  useEffect(() => {
    const isProd = import.meta.env.PROD;
    // In production, undefined forces socket.io to connect to the window's exact origin (Render's 443).
    // In development, it connects to the local Node server port.
    const socketUrl = isProd ? undefined : "http://localhost:9208";

    // initialize socket.io connection
    const socket = io(socketUrl);

    socket.on("connect_error", (error) => {
      console.error("connection error", error);
    });

    socket.on("connect", () => {
      console.log(
        `connected to server ${isProd ? "in production" : "at " + socketUrl}!`,
      );

      // store the local client id and the channel globally
      if (socket.id) {
        setLocalId(socket.id);
        setChannel(socket);
      }

      // send a test message
      socket.emit("chat message", "hello from the r3f client");
    });

    // listen for the server echo or test messages
    socket.on("chat message", (data) => {
      console.log("message from server:", data);
    });

    // update zustand with authoritative server state
    socket.on("state", (data) => {
      const { players, ...matchInfo } = data;

      // sync using the two separate zustand setters
      useGameStore.getState().setPlayers(players);
      useGameStore.getState().updateMatchData(matchInfo);
    });

    socket.on("kill_feed", (data) => {
      useGameStore.getState().addKillEvent({
        ...data,
        timestamp: Date.now(),
      });
    });

    return () => {
      // catch strict mode unmounts before webrtc is ready
      try {
        socket.disconnect();
      } catch (err) {
        console.warn("socket cleanup bypassed during strict mode remount", err);
      }
    };
  }, [setPlayers, setLocalId, setChannel]);

  return null;
}
