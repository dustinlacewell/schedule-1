import React, { useCallback } from "react";
import { useWorldStore } from "../../store/worldStore";
import { useNavigationStore } from "../../store/navigationStore";
import { useUiStore } from "../../store/uiStore";
import { getCityTemplate } from "../../data/cities";
import { Panel } from "../components/Panel";
import { CursorList, type CursorListItem } from "../components/CursorList";
import { KeyHint } from "../components/KeyHint";
import { useKeys } from "../hooks/useScreenKeys";

export const TravelScreen: React.FC = () => {
  const cities = useWorldStore((s) => s.cities);
  const currentCityId = useNavigationStore((s) => s.currentCityId);
  const focusedPanel = useUiStore((s) => s.focusedPanel);
  const cursor = useUiStore((s) => s.cursors.locations);

  const cityList = Object.values(cities);
  const cityCount = cityList.length;

  useKeys(useCallback((e: KeyboardEvent) => {
    const { travelTo, back } = useNavigationStore.getState();
    const { moveCursor, cursors } = useUiStore.getState();
    const list = Object.values(useWorldStore.getState().cities);

    if (e.key === "ArrowUp") moveCursor("locations", -1, cityCount);
    else if (e.key === "ArrowDown") moveCursor("locations", 1, cityCount);
    else if (e.key === "Enter") {
      const city = list[cursors.locations];
      if (city) travelTo(city.id);
    } else if (e.key === "q") back();
  }, [cityCount]));
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
