import React from "react";
import { useScreen } from "../ecs";
import { HudBar } from "./HudBar";
import { CityScreen } from "./screens/CityScreen";
import { TravelScreen } from "./screens/TravelScreen";
import { LocationScreen } from "./screens/NpcListScreen";
import { NpcScreen } from "./screens/NpcScreen";

export const Terminal: React.FC = () => {
  const screen = useScreen();

  let content: React.ReactNode = null;
  if (screen === "city") content = <CityScreen />;
  else if (screen === "travel") content = <TravelScreen />;
  else if (screen === "location") content = <LocationScreen />;
  else if (screen === "npc") content = <NpcScreen />;

  return (
    <div
      className="border border-white bg-black text-green-200"
      style={{ width: "80ch", height: "40em", display: "flex", flexDirection: "column" }}
    >
      <HudBar />
      <div className="flex-1 overflow-hidden p-1 flex flex-col">
        {content}
      </div>
    </div>
  );
};
