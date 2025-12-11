import React, { useCallback } from "react";
import { useWorldStore } from "../../store/worldStore";
import { useNavigationStore } from "../../store/navigationStore";
import { useUiStore } from "../../store/uiStore";
import { getLocationTemplate } from "../../data/locations";
import { getNpcTemplate } from "../../data/npcs";
import { Panel } from "../components/Panel";
import { CursorList, type CursorListItem } from "../components/CursorList";
import { KeyHint } from "../components/KeyHint";
import { useKeys } from "../hooks/useScreenKeys";

export const NpcListScreen: React.FC = () => {
  const currentLocationId = useNavigationStore((s) => s.currentLocationId);
  const locations = useWorldStore((s) => s.locations);
  const npcs = useWorldStore((s) => s.npcs);
  const focusedPanel = useUiStore((s) => s.focusedPanel);
  const cursor = useUiStore((s) => s.cursors.npcs);

  const locInst = currentLocationId ? locations[currentLocationId] : null;
  const locTpl = locInst ? getLocationTemplate(locInst.templateId) : null;
  const npcCount = locInst?.npcIds.length ?? 0;

  useKeys(useCallback((e: KeyboardEvent) => {
    const { enterNpc, back } = useNavigationStore.getState();
    const { moveCursor, cursors } = useUiStore.getState();
    const loc = useWorldStore.getState().locations[currentLocationId ?? ""];

    if (e.key === "ArrowUp") moveCursor("npcs", -1, npcCount);
    else if (e.key === "ArrowDown") moveCursor("npcs", 1, npcCount);
    else if (e.key === "Enter") {
      const npcId = loc?.npcIds[cursors.npcs];
      if (npcId) enterNpc(npcId);
    } else if (e.key === "q") back();
  }, [currentLocationId, npcCount]));

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
