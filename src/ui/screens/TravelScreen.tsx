import React from "react";
import { useWorldStore } from "../../store/worldStore";
import { useNavigationStore } from "../../store/navigationStore";
import { getCityTemplate } from "../../data/cities";
import { Panel } from "../components/Panel";
import { CursorList, type CursorListItem } from "../components/CursorList";
import { KeyHint } from "../components/KeyHint";

export const TravelScreen: React.FC = () => {
  const cities = useWorldStore((s) => s.cities);
  const currentCityId = useNavigationStore((s) => s.currentCityId);
  const travelTo = useNavigationStore((s) => s.travelTo);
  const back = useNavigationStore((s) => s.back);

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

  const handleCitySelect = (cityId: string) => {
    travelTo(cityId);
  };

  return (
    <div className="flex flex-col h-full gap-1">
      <Panel title="Travel" focused className="flex-1 min-h-0">
        <CursorList
          items={cityItems}
          active
          onSelect={handleCitySelect}
          onCancel={back}
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
