import React from "react";
import { useGameStore } from "../store/gameStore";
import { getCityTemplate } from "../data/cities";

export const HudBar: React.FC = () => {
  const player = useGameStore((s) => s.player);
  const currentCityId = useGameStore((s) => s.currentCityId);
  const cities = useGameStore((s) => s.cities);

  const cityInst = cities[currentCityId];
  const cityTpl = cityInst ? getCityTemplate(cityInst.templateId) : null;
  const cityName = cityTpl?.name ?? "Unknown";

  return (
    <div className="border-b border-white px-2 py-1 flex items-center justify-between text-xs bg-gray-900">
      <span className="text-green-400">$ {player.money}</span>
      <span>{cityName}</span>
      <span className="text-red-400">HP {player.health}</span>
    </div>
  );
};
