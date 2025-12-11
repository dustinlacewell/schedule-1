import React from "react";
import { useGameStore } from "../../store/gameStore";
import { getNpcTemplate } from "../../data/npcs";
import { Panel } from "../components/Panel";
import { InventoryList } from "../components/InventoryList";
import { KeyHint } from "../components/KeyHint";

export const NpcInteractScreen: React.FC = () => {
  const currentNpcId = useGameStore((s) => s.currentNpcId);
  const npcs = useGameStore((s) => s.npcs);
  const player = useGameStore((s) => s.player);
  const focusedPanel = useGameStore((s) => s.focusedPanel);
  const cursors = useGameStore((s) => s.cursors);

  const npcInst = currentNpcId ? npcs[currentNpcId] : null;
  const npcTpl = npcInst ? getNpcTemplate(npcInst.templateId) : null;

  const npcName = npcTpl?.name ?? "Unknown";
  const npcCatchphrase = npcTpl?.catchphrase ?? "";
  const npcLikes = npcTpl?.likes?.join(", ") ?? "";
  const npcHates = npcTpl?.hates?.join(", ") ?? "";
  const npcInventory = npcInst?.inventory ?? {};

  return (
    <div className="flex flex-col h-full gap-1">
      {/* NPC info panel */}
      <Panel title={npcName} className="shrink-0">
        <div className="px-1 py-0.5 text-xs">
          <div className="italic text-gray-400">"{npcCatchphrase}"</div>
          {npcLikes && <div className="text-green-400">Likes: {npcLikes}</div>}
          {npcHates && <div className="text-red-400">Hates: {npcHates}</div>}
        </div>
      </Panel>

      {/* Inventories side by side */}
      <div className="flex flex-1 gap-1 min-h-0">
        {/* Player inventory */}
        <Panel
          title="Your Items"
          focused={focusedPanel === "playerInv"}
          className="flex-1 min-w-0"
        >
          <InventoryList
            inventory={player.inventory}
            selectedIndex={cursors.playerInv}
            emptyMessage="(no items)"
          />
        </Panel>

        {/* NPC inventory */}
        <Panel
          title={`${npcName}'s Items`}
          focused={focusedPanel === "npcInv"}
          className="flex-1 min-w-0"
        >
          <InventoryList
            inventory={npcInventory}
            selectedIndex={cursors.npcInv}
            emptyMessage="(no items)"
          />
        </Panel>
      </div>

      {/* Key hints */}
      <KeyHint
        hints={[
          { key: "Tab", label: "Switch" },
          { key: "↑/↓", label: "Select" },
          { key: "←/Enter", label: "Buy" },
          { key: "→/Enter", label: "Sell" },
          { key: "q", label: "Back" },
        ]}
      />
    </div>
  );
};
