import React from "react";
import { useGameStore } from "../../store/gameStore";
import { cities } from "../../data/cities.js";

export const CityScreen: React.FC = () => {
  const player = useGameStore((s) => s.player);
  const city = cities[player.location]!;

  return (
    <div className="flex flex-col text-xs gap-1">
      <div>=== {city.name} ===</div>
      <div>
        Market: {Object.entries(city.market).map(([k, v]) => `${k}: $${v}`).join("  ")}
      </div>
      <div className="mt-2">Actions:</div>
      <div>t: Trade</div>
      <div>g: Travel</div>
      <div>p: Pharmacy</div>
    </div>
  );
};
