import React from "react";
import { useGameStore } from "../store/gameStore";
import { HudBar } from "./HudBar";
import { CityScreen } from "./screens/CityScreen";
import { TradeScreen } from "./screens/TradeScreen";
import { TravelScreen } from "./screens/TravelScreen";
import { PharmacyScreen } from "./screens/PharmacyScreen";
import { useKeyboard } from "./useKeyboard";

export const Terminal: React.FC = () => {
  const screen = useGameStore((s) => s.screen);

  useKeyboard();

  let content: React.ReactNode = null;
  if (screen === "city") content = <CityScreen />;
  else if (screen === "trade") content = <TradeScreen />;
  else if (screen === "travel") content = <TravelScreen />;
  else if (screen === "pharmacy") content = <PharmacyScreen />;

  return (
    <div
      className="border border-gray-600 bg-black text-green-200"
      style={{ width: "80ch", height: "40em", display: "flex", flexDirection: "column" }}
    >
      <HudBar />
      <div className="flex-1 border-t border-gray-700 overflow-hidden p-2 flex flex-col">
        {content}
      </div>
    </div>
  );
};
