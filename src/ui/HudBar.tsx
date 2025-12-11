import React from "react";
import { useGameStore } from "../store/gameStore";
import { cities } from "../data/cities.js";

export const HudBar: React.FC = () => {
  const player = useGameStore((s) => s.player);
  const city = cities[player.location];

  return (
    <div className="border-b border-gray-700 px-2 py-1 flex items-center justify-between text-xs">
      <span>Money: ${player.money}</span>
      <span>City: {city?.name ?? "Unknown"}</span>
      <span>Health: {player.health}</span>
    </div>
  );
};
