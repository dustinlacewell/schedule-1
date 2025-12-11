import React from "react";
import { useGameStore } from "../../store/gameStore";
import { getCityTemplate } from "../../data/cities";
import { getLocationTemplate } from "../../data/locations";
import { Panel } from "../components/Panel";
import { CursorList, type CursorListItem } from "../components/CursorList";
import { KeyHint } from "../components/KeyHint";

export const CityScreen: React.FC = () => {
  const currentCityId = useGameStore((s) => s.currentCityId);
  const cities = useGameStore((s) => s.cities);
  const locations = useGameStore((s) => s.locations);
  const focusedPanel = useGameStore((s) => s.focusedPanel);
  const cursor = useGameStore((s) => s.cursors.locations);

  const cityInst = cities[currentCityId];
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
