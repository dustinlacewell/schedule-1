import React from "react";
import { useWorldStore } from "../../store/worldStore";
import { useNavigationStore } from "../../store/navigationStore";
import { getLocationTemplate } from "../../data/locations";
import { getNpcTemplate } from "../../data/npcs";
import { Panel } from "../components/Panel";
import { CursorList, type CursorListItem } from "../components/CursorList";
import { KeyHint } from "../components/KeyHint";

export const NpcListScreen: React.FC = () => {
  const currentLocationId = useNavigationStore((s) => s.currentLocationId);
  const locations = useWorldStore((s) => s.locations);
  const npcs = useWorldStore((s) => s.npcs);
  const enterNpc = useNavigationStore((s) => s.enterNpc);
  const back = useNavigationStore((s) => s.back);

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

  const handleNpcSelect = (npcId: string) => {
    enterNpc(npcId);
  };

  return (
    <div className="flex flex-col h-full gap-1">
      <Panel title={locTpl?.name ?? "Unknown Location"} className="shrink-0">
        <div className="px-1 py-0.5 text-xs">{locTpl?.description ?? ""}</div>
      </Panel>

      <Panel title="People Here" focused className="flex-1 min-h-0">
        <CursorList
          items={npcItems}
          active
          onSelect={handleNpcSelect}
          onCancel={back}
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
