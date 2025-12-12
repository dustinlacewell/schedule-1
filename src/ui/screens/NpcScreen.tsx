import React, { useState, useEffect } from "react";
import { matchesAction } from "../../input/keymap";
import { useCurrentNpc, usePlayer, useNavigation, useTradeActions } from "../../ecs";
import { Panel } from "../components/Panel";
import { InventoryList } from "../components/InventoryList";
import { KeyHint } from "../components/KeyHint";

type ActivePanel = "player" | "npc";

export const NpcScreen: React.FC = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>("npc");

  const npc = useCurrentNpc();
  const player = usePlayer();
  const { stopTalking } = useNavigation();
  const { buyItem, sellItem } = useTradeActions();

  // Handle Tab to switch panels, q to go back
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (matchesAction(e.key, "cycle_focus")) {
        e.preventDefault();
        setActivePanel((p) => (p === "player" ? "npc" : "player"));
      } else if (matchesAction(e.key, "cancel")) {
        e.preventDefault();
        stopTalking();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stopTalking]);

  if (!npc || !player) return null;

  const handleBuyItem = (itemId: string) => {
    buyItem(npc.id, itemId, 1);
  };

  const handleSellItem = (itemId: string) => {
    sellItem(npc.id, itemId, 1);
  };

  return (
    <div className="flex flex-col h-full gap-1">
      <Panel title={npc.name} className="shrink-0">
        <div className="px-1 py-0.5 text-xs">
          <div className="italic text-gray-400">"{npc.catchphrase}"</div>
          {npc.canBuy && <div className="text-green-400">Will buy items</div>}
          {npc.canSell && <div className="text-blue-400">Has items for sale</div>}
          {npc.canHeal && <div className="text-pink-400">Can heal you</div>}
          {npc.canSellTickets && <div className="text-yellow-400">Sells travel tickets</div>}
        </div>
      </Panel>

      <div className="flex flex-1 gap-1 min-h-0">
        {npc.canBuy && (
          <Panel
            title="Your Items"
            focused={activePanel === "player"}
            className="flex-1 min-w-0"
          >
            <InventoryList
              items={player.inventory}
              active={activePanel === "player"}
              onSelect={handleSellItem}
              emptyMessage="(no items)"
            />
          </Panel>
        )}

        {npc.canSell && npc.inventory && (
          <Panel
            title={`${npc.name}'s Items`}
            focused={activePanel === "npc"}
            className="flex-1 min-w-0"
          >
            <InventoryList
              items={npc.inventory}
              active={activePanel === "npc"}
              onSelect={handleBuyItem}
              emptyMessage="(no items)"
            />
          </Panel>
        )}
      </div>

      <KeyHint
        actions={{
          Switch: "cycle_focus",
          Select: ["cursor_up", "cursor_down"],
          "Buy/Sell": "confirm",
          Back: "cancel",
        }}
      />
    </div>
  );
};
