import React from "react";
import { useGameStore } from "../../store/gameStore";
import { drugs } from "../../data/drugs.js";

export const TradeScreen: React.FC = () => {
  const player = useGameStore((s) => s.player);

  return (
    <div className="flex flex-col text-xs gap-1">
      <div>=== TRADE ===</div>
      <div>
        {Object.entries(drugs).map(([key, drug]) => {
          const owned = player.inventory.get(key) ?? 0;
          return (
            <div key={key}>
              {drug.name} x{owned} (buy: {drug.buttonBuy}, sell: {drug.buttonSell})
            </div>
          );
        })}
      </div>
      <div className="mt-2">q: Back</div>
    </div>
  );
};
