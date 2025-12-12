import React from "react";
import { useAllCities, useCurrentCity, useNavigation } from "../../ecs";
import { Panel } from "../components/Panel";
import { CursorList, type CursorListItem } from "../components/CursorList";
import { KeyHint } from "../components/KeyHint";

export const TravelScreen: React.FC = () => {
  const cities = useAllCities();
  const currentCity = useCurrentCity();
  const { travel, exitLocation } = useNavigation();

  const cityItems: CursorListItem[] = cities.map((city) => ({
    id: city.id,
    label: city.name,
    sublabel: city.id === currentCity?.id ? "(current)" : "",
  }));

  const handleCitySelect = (cityId: string) => {
    travel(cityId, 0);  // TODO: Get fare from ticket clerk
  };

  return (
    <div className="flex flex-col h-full gap-1">
      <Panel title="Travel" focused className="flex-1 min-h-0">
        <CursorList
          items={cityItems}
          active
          onSelect={handleCitySelect}
          onCancel={exitLocation}
          emptyMessage="No cities"
        />
      </Panel>

      <KeyHint
        actions={{
          Select: ["cursor_up", "cursor_down"],
          Go: "confirm",
          Back: "cancel",
        }}
      />
    </div>
  );
};
