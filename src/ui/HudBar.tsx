import React from "react";
import { usePlayer, useCurrentCity, useGameTime } from "../ecs";

export const HudBar: React.FC = () => {
  const player = usePlayer();
  const city = useCurrentCity();
  const time = useGameTime();

  return (
    <div className="border-b border-white px-2 py-1 flex items-center justify-between text-xs bg-gray-900">
      <span className="text-green-400">$ {player?.money ?? 0}</span>
      <span className="text-yellow-400">{time.display}</span>
      <span>{city?.name ?? "Unknown"}</span>
      <span className="text-red-400">HP {player?.health ?? 0}</span>
    </div>
  );
};
