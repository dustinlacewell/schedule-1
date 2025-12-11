import React from "react";
import { useGameStore } from "../../store/gameStore";
import { getLocationTemplate } from "../../data/locations";
import { getNpcTemplate } from "../../data/npcs";
import { Panel } from "../components/Panel";
import { CursorList, type CursorListItem } from "../components/CursorList";
import { KeyHint } from "../components/KeyHint";

export const NpcListScreen: React.FC = () => {
  const currentLocationId = useGameStore((s) => s.currentLocationId);
  const locations = useGameStore((s) => s.locations);
  const npcs = useGameStore((s) => s.npcs);
  const focusedPanel = useGameStore((s) => s.focusedPanel);
  const cursor = useGameStore((s) => s.cursors.npcs);

  const locInst = currentLocationId ? locations[currentLocationId] : null;
  const locTpl = locInst ? getLocationTemplate(locInst.templateId) : null;

  const npcItems: CursorListItem[] = (locInst?.npcIds ?? []).map((npcId) => {
    const npcInst = npcs[npcId];
    const npcTpl = npcInst ? getNpcTemplate(npcInst.templateId) : null;
    return {
      id: npcId,
      label: npcTpl?.name ?? "Unknown",
      sublabel: `"${npcTpl?.catchphrase ?? ""}"`,
    };
  });

  return (
    <div className="flex flex-col h-full gap-1">
      {/* Location info panel */}
      <Panel title={locTpl?.name ?? "Unknown Location"} className="shrink-0">
        <div className="px-1 py-0.5 text-xs">{locTpl?.description ?? ""}</div>
      </Panel>

      {/* NPCs panel */}
      <Panel title="People Here" focused={focusedPanel === "npcs"} className="flex-1 min-h-0">
        <CursorList items={npcItems} selectedIndex={cursor} emptyMessage="Nobody here" />
      </Panel>

      {/* Key hints */}
      <KeyHint
        hints={[
          { key: "↑/↓", label: "Select" },
          { key: "Enter", label: "Talk" },
          { key: "q", label: "Back" },
        ]}
      />
    </div>
  );
};
