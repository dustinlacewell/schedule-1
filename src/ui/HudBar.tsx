import React from "react";
import { usePlayerStore } from "../store/playerStore";
import { useNavigationStore } from "../store/navigationStore";
import { useWorldStore } from "../store/worldStore";
import { getCityTemplate } from "../data/cities";

export const HudBar: React.FC = () => {
  const money = usePlayerStore((s) => s.money);
  const health = usePlayerStore((s) => s.health);
  const currentCityId = useNavigationStore((s) => s.currentCityId);
  const cities = useWorldStore((s) => s.cities);

  const cityInst = cities[currentCityId];
  const cityTpl = cityInst ? getCityTemplate(cityInst.templateId) : null;
  const cityName = cityTpl?.name ?? "Unknown";

  return (
    <div className="border-b border-white px-2 py-1 flex items-center justify-between text-xs bg-gray-900">
      <span className="text-green-400">$ {money}</span>
      <span>{cityName}</span>
      <span className="text-red-400">HP {health}</span>
    </div>
  );
};
