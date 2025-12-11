import React, { useCallback } from "react";
import { useWorldStore } from "../../store/worldStore";
import { useNavigationStore } from "../../store/navigationStore";
import { useUiStore } from "../../store/uiStore";
import { getCityTemplate } from "../../data/cities";
import { getLocationTemplate } from "../../data/locations";
import { Panel } from "../components/Panel";
import { CursorList, type CursorListItem } from "../components/CursorList";
import { KeyHint } from "../components/KeyHint";
import { useKeys } from "../hooks/useScreenKeys";

export const CityScreen: React.FC = () => {
  const currentCityId = useNavigationStore((s) => s.currentCityId);
  const cities = useWorldStore((s) => s.cities);
  const locations = useWorldStore((s) => s.locations);
  const focusedPanel = useUiStore((s) => s.focusedPanel);
  const cursor = useUiStore((s) => s.cursors.locations);

  const cityInst = cities[currentCityId];
  const locationCount = cityInst?.locationIds.length ?? 0;

  useKeys(useCallback((e: KeyboardEvent) => {
    const { setScreen, enterLocation } = useNavigationStore.getState();
    const { moveCursor } = useUiStore.getState();
    const city = useWorldStore.getState().cities[currentCityId];

    if (e.key === "ArrowUp") moveCursor("locations", -1, locationCount);
    else if (e.key === "ArrowDown") moveCursor("locations", 1, locationCount);
    else if (e.key === "Enter") {
      const locId = city?.locationIds[useUiStore.getState().cursors.locations];
      if (locId) enterLocation(locId);
    } else if (e.key === "g") setScreen("travel");
  }, [currentCityId, locationCount]));

  const cityTpl = cityInst ? getCityTemplate(cityInst.templateId) : null;

  const locationItems: CursorListItem[] = (cityInst?.locationIds ?? []).map((locId) => {
    const locInst = locations[locId];
    const locTpl = locInst ? getLocationTemplate(locInst.templateId) : null;
    return {
      id: locId,
      label: locTpl?.name ?? "Unknown",
      sublabel: `${locInst?.npcIds.length ?? 0} NPCs`,
    };
  });

  return (
    <div className="flex flex-col h-full gap-1">
      {/* City info panel */}
      <Panel title={cityTpl?.name ?? "Unknown City"} className="shrink-0">
        <div className="px-1 py-0.5 text-xs">{cityTpl?.description ?? ""}</div>
      </Panel>

      {/* Locations panel */}
      <Panel title="Locations" focused={focusedPanel === "locations"} className="flex-1 min-h-0">
        <CursorList items={locationItems} selectedIndex={cursor} emptyMessage="No locations" />
      </Panel>

      {/* Key hints */}
      <KeyHint
        hints={[
          { key: "↑/↓", label: "Select" },
          { key: "Enter", label: "Go" },
          { key: "g", label: "Travel" },
          { key: "q", label: "Quit" },
        ]}
      />
    </div>
  );
};
