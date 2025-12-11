import React, { useCallback } from "react";
import { useWorldStore } from "../../store/worldStore";
import { usePlayerStore } from "../../store/playerStore";
import { useNavigationStore } from "../../store/navigationStore";
import { useUiStore } from "../../store/uiStore";
import { buyFromNpc, sellToNpc } from "../../store/tradeStore";
import { getNpcTemplate } from "../../data/npcs";
import { Panel } from "../components/Panel";
import { InventoryList } from "../components/InventoryList";
import { KeyHint } from "../components/KeyHint";
import { useKeys } from "../hooks/useScreenKeys";

export const NpcInteractScreen: React.FC = () => {
  const currentNpcId = useNavigationStore((s) => s.currentNpcId);
  const npcs = useWorldStore((s) => s.npcs);
  const playerInventory = usePlayerStore((s) => s.inventory);
  const focusedPanel = useUiStore((s) => s.focusedPanel);
  const cursors = useUiStore((s) => s.cursors);

  const npcInst = currentNpcId ? npcs[currentNpcId] : null;
  const npcTpl = npcInst ? getNpcTemplate(npcInst.templateId) : null;
  const npcInventory = npcInst?.inventory ?? {};
  const playerInvCount = Object.keys(playerInventory).length;
  const npcInvCount = Object.keys(npcInventory).length;

  useKeys(useCallback((e: KeyboardEvent) => {
    const { back } = useNavigationStore.getState();
    const { moveCursor, cycleFocus, focusedPanel } = useUiStore.getState();
    const pInvLen = Object.keys(usePlayerStore.getState().inventory).length;
    const nInvLen = Object.keys(useWorldStore.getState().npcs[currentNpcId ?? ""]?.inventory ?? {}).length;

    if (e.key === "Tab") cycleFocus(["playerInv", "npcInv"], e.shiftKey ? -1 : 1);
    else if (e.key === "ArrowUp") moveCursor(focusedPanel, -1, focusedPanel === "playerInv" ? pInvLen : nInvLen);
    else if (e.key === "ArrowDown") moveCursor(focusedPanel, 1, focusedPanel === "playerInv" ? pInvLen : nInvLen);
    else if (e.key === "ArrowLeft" || (e.key === "Enter" && focusedPanel === "npcInv")) buyFromNpc();
    else if (e.key === "ArrowRight" || (e.key === "Enter" && focusedPanel === "playerInv")) sellToNpc();
    else if (e.key === "q") back();
  }, [currentNpcId, playerInvCount, npcInvCount]));

  const npcName = npcTpl?.name ?? "Unknown";
  const npcCatchphrase = npcTpl?.catchphrase ?? "";
  const npcLikes = npcTpl?.likes?.join(", ") ?? "";
  const npcHates = npcTpl?.hates?.join(", ") ?? "";

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
            inventory={playerInventory}
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
