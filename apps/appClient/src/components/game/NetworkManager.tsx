import { useEffect } from "react";
import { io } from "socket.io-client";
import { useGameStore } from "../../stores/useGameStore";

const NetworkManager = () => {
  const { setChannel, setLocalId, setIsConnected, setPing, setPlayers } =
    useGameStore();

  useEffect(() => {
    const isProd = import.meta.env.PROD;

    // in production undefined forces socket to connect to the window origin
    // in development it connects to the local server port
    const socketUrl = isProd ? undefined : "http://localhost:9208";

    // initialize socket connection
    const socket = io(socketUrl);

    socket.on("connect_error", (error) => {
      console.error("connection error", error);
    });

    socket.on("connect", () => {
      console.log(
        `connected to server ${isProd ? "in production" : "at " + socketUrl}!`,
      );

      // mark connection as active
      setIsConnected(true);

      // store local client id and channel globally
      if (socket.id) {
        setLocalId(socket.id);
        setChannel(socket);
      }
    });

    // mark connection as inactive
    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // request acknowledgment from server to measure round trip time
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        const start = Date.now();

        socket.emit("ping", () => {
          const latency = Date.now() - start;
          setPing(latency);
        });
      }
    }, 1000);

    // update store with authoritative server state
    socket.on("state", (data) => {
      const { players, ...matchInfo } = data;

      // sync using separate store setters
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
      // clear interval before disconnecting
      clearInterval(pingInterval);

      // catch strict mode unmounts before connection is ready
      try {
        socket.disconnect();
      } catch (err) {
        console.warn("socket cleanup bypassed during strict mode remount", err);
      }
    };
  }, [setPlayers, setLocalId, setChannel, setIsConnected, setPing]);

  return null;
};

export default NetworkManager;
