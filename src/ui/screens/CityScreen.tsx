import React, { useMemo } from "react";
import { useCurrentCity, useCurrentCityLocations, useNavigation } from "../../ecs";
import { Panel } from "../components/Panel";
import { CursorList, type CursorListItem } from "../components/CursorList";
import { KeyHint } from "../components/KeyHint";
import { useActions } from "../hooks/useKeys";

export const CityScreen: React.FC = () => {
  const city = useCurrentCity();
  const locations = useCurrentCityLocations();
  const { enterLocation, goToTravelScreen } = useNavigation();

  useActions(useMemo(() => ({
    travel: goToTravelScreen,
  }), [goToTravelScreen]));

  const locationItems: CursorListItem[] = locations.map((loc) => ({
    id: loc.id,
    label: loc.name,
    sublabel: `${loc.npcCount} NPCs`,
  }));

  return (
    <div className="flex flex-col h-full gap-1">
      <Panel title={city?.name ?? "Unknown City"} className="shrink-0">
        <div className="px-1 py-0.5 text-xs">{city?.description ?? ""}</div>
      </Panel>

      <Panel title="Locations" focused className="flex-1 min-h-0">
        <CursorList
          items={locationItems}
          active
          onSelect={enterLocation}
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
