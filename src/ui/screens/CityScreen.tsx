import React, { useMemo } from "react";
import { useWorldStore } from "../../store/worldStore";
import { useNavigationStore } from "../../store/navigationStore";
import { getCityTemplate } from "../../data/cities";
import { getLocationTemplate } from "../../data/locations";
import { Panel } from "../components/Panel";
import { CursorList, type CursorListItem } from "../components/CursorList";
import { KeyHint } from "../components/KeyHint";
import { useActions } from "../hooks/useKeys";

export const CityScreen: React.FC = () => {
  const currentCityId = useNavigationStore((s) => s.currentCityId);
  const cities = useWorldStore((s) => s.cities);
  const locations = useWorldStore((s) => s.locations);
  const enterLocation = useNavigationStore((s) => s.enterLocation);
  const setScreen = useNavigationStore((s) => s.setScreen);

  const cityInst = cities[currentCityId];
  const cityTpl = cityInst ? getCityTemplate(cityInst.templateId) : null;

  useActions(useMemo(() => ({
    travel: () => setScreen("travel"),
  }), [setScreen]));

  const locationItems: CursorListItem[] = (cityInst?.locationIds ?? []).map((locId) => {
    const locInst = locations[locId];
    const locTpl = locInst ? getLocationTemplate(locInst.templateId) : null;
    return {
      id: locId,
      label: locTpl?.name ?? "Unknown",
      sublabel: `${locInst?.npcIds.length ?? 0} NPCs`,
    };
  });

  const handleLocationSelect = (locId: string) => {
    enterLocation(locId);
  };

  return (
    <div className="flex flex-col h-full gap-1">
      <Panel title={cityTpl?.name ?? "Unknown City"} className="shrink-0">
        <div className="px-1 py-0.5 text-xs">{cityTpl?.description ?? ""}</div>
      </Panel>

      <Panel title="Locations" focused className="flex-1 min-h-0">
        <CursorList
          items={locationItems}
          active
          onSelect={handleLocationSelect}
          emptyMessage="No locations"
        />
      </Panel>

      <KeyHint
        actions={{
          Select: ["cursor_up", "cursor_down"],
          Go: "confirm",
          Travel: "travel",
        }}
      />
    </div>
  );
};
