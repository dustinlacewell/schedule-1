import React from "react";
import { useCurrentLocation, useCurrentLocationNpcs, useNavigation } from "../../ecs";
import { Panel } from "../components/Panel";
import { CursorList, type CursorListItem } from "../components/CursorList";
import { KeyHint } from "../components/KeyHint";

export const LocationScreen: React.FC = () => {
  const location = useCurrentLocation();
  const npcs = useCurrentLocationNpcs();
  const { talkToNpc, exitLocation } = useNavigation();

  const npcItems: CursorListItem[] = npcs.map((npc) => ({
    id: npc.id,
    label: npc.name,
    sublabel: `"${npc.catchphrase}"`,
  }));

  return (
    <div className="flex flex-col h-full gap-1">
      <Panel title={location?.name ?? "Unknown Location"} className="shrink-0">
        <div className="px-1 py-0.5 text-xs">{location?.description ?? ""}</div>
      </Panel>

      <Panel title="People Here" focused className="flex-1 min-h-0">
        <CursorList
          items={npcItems}
          active
          onSelect={talkToNpc}
          onCancel={exitLocation}
          emptyMessage="Nobody here"
        />
      </Panel>

      <KeyHint
        actions={{
          Select: ["cursor_up", "cursor_down"],
          Talk: "confirm",
          Back: "cancel",
        }}
      />
    </div>
  );
};
