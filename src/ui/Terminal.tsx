import React from "react";
import { useNavigationStore } from "../store/navigationStore";
import { HudBar } from "./HudBar";
import { CityScreen } from "./screens/CityScreen";
import { TravelScreen } from "./screens/TravelScreen";
import { NpcListScreen } from "./screens/NpcListScreen";
import { NpcInteractScreen } from "./screens/NpcInteractScreen";

export const Terminal: React.FC = () => {
  const screen = useNavigationStore((s) => s.screen);

  let content: React.ReactNode = null;
  if (screen === "city") content = <CityScreen />;
  else if (screen === "travel") content = <TravelScreen />;
  else if (screen === "npcList") content = <NpcListScreen />;
  else if (screen === "npcInteract") content = <NpcInteractScreen />;

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
