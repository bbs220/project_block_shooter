import { useGameStore } from "../../../stores/useGameStore";
import { WEAPONS } from "@block-shooter/shared";
import { iconBank } from "../../../utils/assetPaths";

const getWeaponIcon = (weaponKey: string) => {
  if (weaponKey === "burstRifle") return iconBank.burstRifle;
  if (weaponKey === "pistol") return iconBank.pistol;
  return iconBank.assaultRifle;
};

const LOADOUT = [
  { id: "assaultRifle", keybind: "1" },
  { id: "pistol", keybind: "2" },
  { id: "burstRifle", keybind: "3" },
];

const LocalPlayerUI = () => {
  const players = useGameStore((state) => state.players);
  const localId = useGameStore((state) => state.localId);

  const me = localId ? players[localId] : null;

  if (!me) return null;

  const displayHealth = Math.max(0, me.health);
  const maxHealth = 100;
  const healthSegments = 10;

  const sortedLoadout = [
    LOADOUT.find((w) => w.id === me.currentWeapon) || LOADOUT[0],
    ...LOADOUT.filter((w) => w.id !== me.currentWeapon),
  ];

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-end z-10">
      <div className="flex justify-between items-end w-full">
        <div className="flex flex-col gap-2">
          <div className="flex gap-1 border-4 border-white/20">
            {Array.from({ length: healthSegments }).map((_, i) => {
              const isActive = i * (maxHealth / healthSegments) < displayHealth;
              const isLowHealth = displayHealth <= 30;

              if (!isActive) return null;

              return (
                <div
                  key={i}
                  className={`h-5 w-6 border-b-4 border-black/40 transition-colors duration-200 ${
                    isLowHealth ? "bg-red-500" : "bg-white"
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full border-[1.5px] border-black"
              style={{ backgroundColor: me.color }}
            />
            <span className="text-xl font-black text-white tracking-wide [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
              {me.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {sortedLoadout.map((wpn, index) => {
            const isActive = index === 0;
            const isReloadingActiveWeapon = isActive && me.isReloading;

            return (
              <div
                key={index}
                className={`flex items-center justify-between px-4 bg-black/40 border-r-4 transition-all duration-300 ease-out w-64 backdrop-blur-sm ${
                  isActive
                    ? "h-20 border-white opacity-100"
                    : "h-12 border-transparent opacity-60"
                }`}
              >
                <div
                  key={wpn.id}
                  className="flex items-center justify-between w-full h-full"
                >
                  <div className="flex flex-col items-start justify-center h-full">
                    <span
                      className={`font-mono uppercase font-black tracking-wider ${
                        isActive
                          ? "text-sm text-gray-300"
                          : "text-xs text-gray-400"
                      }`}
                    >
                      <span className="text-gray-500 mr-2">
                        [{wpn.keybind}]
                      </span>
                      {WEAPONS[wpn.id as keyof typeof WEAPONS].name}
                    </span>

                    {isActive && (
                      <div
                        className={`flex items-baseline gap-1 text-white transition-opacity duration-200 ${
                          isReloadingActiveWeapon
                            ? "opacity-30 animate-pulse"
                            : "opacity-100"
                        }`}
                      >
                        <span className="text-3xl font-black tabular-nums tracking-tighter leading-none mt-1">
                          {String(me.ammo).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-bold text-gray-400 tabular-nums">
                          /{" "}
                          {String(
                            WEAPONS[wpn.id as keyof typeof WEAPONS].magSize,
                          ).padStart(2, "0")}
                        </span>
                      </div>
                    )}
                  </div>

                  <img
                    src={getWeaponIcon(wpn.id)}
                    alt={wpn.id}
                    className={`object-contain transition-all duration-300 ${
                      isActive ? "h-10" : "h-6 opacity-80"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LocalPlayerUI;
