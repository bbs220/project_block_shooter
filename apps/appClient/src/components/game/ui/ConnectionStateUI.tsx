import { useGameStore } from "../../../stores/useGameStore";
import { Wifi, WifiOff } from "lucide-react";

const ConnectionStateUI = () => {
  const ping = useGameStore((state) => state.ping);
  const connectionStatus = useGameStore((state) => state.connectionStatus);

  // resolve dynamic tailwind classes and icons per state
  const getStatusUI = () => {
    switch (connectionStatus) {
      case "disconnected":
        return {
          color: "bg-red-500/80 text-white border-red-500",
          icon: <WifiOff size={16} />,
          label: "disconnected",
        };
      case "disconnecting":
        return {
          color: "bg-yellow-500/80 text-yellow-100 border-yellow-500",
          icon: <Wifi size={14} />,
          label: "disconnecting",
        };
      default:
        return {
          color: "bg-black/40 text-neutral-300 border-white/20",
          icon: <Wifi size={14} />,
          label: `${ping} ms`,
        };
    }
  };

  const ui = getStatusUI();

  return (
    // container fixed to the top right of the viewport
    <div className="absolute top-4 left-22 z-40 flex flex-col items-end gap-2 pointer-events-none">
      <div
        className={`flex items-center gap-2 px-3 py-1 font-black uppercase tracking-wider text-xs shadow-md backdrop-blur-sm border-t-2 ${ui.color}`}
      >
        {ui.icon}
        <span>{ui.label}</span>
      </div>
    </div>
  );
};

export default ConnectionStateUI;
