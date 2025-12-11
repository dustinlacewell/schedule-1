import React from "react";
import { useGameStore } from "../../store/gameStore";
import { getCityTemplate } from "../../data/cities";
import { Panel } from "../components/Panel";
import { CursorList, type CursorListItem } from "../components/CursorList";
import { KeyHint } from "../components/KeyHint";

export const TravelScreen: React.FC = () => {
  const cities = useGameStore((s) => s.cities);
  const currentCityId = useGameStore((s) => s.currentCityId);
  const focusedPanel = useGameStore((s) => s.focusedPanel);
  const cursor = useGameStore((s) => s.cursors.locations);

  const cityList = Object.values(cities);
  const cityItems: CursorListItem[] = cityList.map((city) => {
    const tpl = getCityTemplate(city.templateId);
    const isCurrent = city.id === currentCityId;
    return {
      id: city.id,
      label: tpl?.name ?? "Unknown",
      sublabel: isCurrent ? "(current)" : "",
    };
  });

  return (
    <div className="flex flex-col h-full gap-1">
      <Panel title="Travel" focused={focusedPanel === "locations"} className="flex-1 min-h-0">
        <CursorList items={cityItems} selectedIndex={cursor} emptyMessage="No cities" />
      </Panel>

      <KeyHint
        hints={[
          { key: "↑/↓", label: "Select" },
          { key: "Enter", label: "Go" },
          { key: "q", label: "Back" },
        ]}
      />
    </div>
  );
};
