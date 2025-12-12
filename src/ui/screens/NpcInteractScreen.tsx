import React, { useState, useEffect } from "react";
import { matchesAction } from "../../input/keymap";
import { useWorldStore } from "../../store/worldStore";
import { usePlayerStore } from "../../store/playerStore";
import { useNavigationStore } from "../../store/navigationStore";
import { getNpcTemplate } from "../../data/npcs";
import { getItemTemplate } from "../../data/items";
import { Panel } from "../components/Panel";
import { InventoryList } from "../components/InventoryList";
import { KeyHint } from "../components/KeyHint";

type ActivePanel = "player" | "npc";

export const NpcInteractScreen: React.FC = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>("npc");

  const currentNpcId = useNavigationStore((s) => s.currentNpcId);
  const back = useNavigationStore((s) => s.back);
  const npcs = useWorldStore((s) => s.npcs);
  const updateNpcInventory = useWorldStore((s) => s.updateNpcInventory);
  const playerInventory = usePlayerStore((s) => s.inventory);
  const playerMoney = usePlayerStore((s) => s.money);
  const addItem = usePlayerStore((s) => s.addItem);
  const removeItem = usePlayerStore((s) => s.removeItem);
  const addMoney = usePlayerStore((s) => s.addMoney);
  const removeMoney = usePlayerStore((s) => s.removeMoney);

  const npcInst = currentNpcId ? npcs[currentNpcId] : null;
  const npcTpl = npcInst ? getNpcTemplate(npcInst.templateId) : null;
  const npcInventory = npcInst?.inventory ?? {};

  // Handle Tab to switch panels, q to go back
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (matchesAction(e.key, "cycle_focus")) {
        e.preventDefault();
        setActivePanel((p) => (p === "player" ? "npc" : "player"));
      } else if (matchesAction(e.key, "cancel")) {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [back]);

  // Buy from NPC (player selects item in NPC inventory)
  const handleBuyItem = (itemId: string) => {
    if (!currentNpcId || !npcInst) return;
    const npcEntry = npcInventory[itemId];
    if (!npcEntry || npcEntry.quantity <= 0) return;
    if (playerMoney < npcEntry.price) return;

    // Update NPC inventory
    const newNpcInv = {
      ...npcInventory,
      [itemId]: { ...npcEntry, quantity: npcEntry.quantity - 1 },
    };
    updateNpcInventory(currentNpcId, newNpcInv);

    // Update player
    removeMoney(npcEntry.price);
    addItem(itemId, 1, npcEntry.price);
  };

  // Sell to NPC (player selects item in player inventory)
  const handleSellItem = (itemId: string) => {
    if (!currentNpcId || !npcInst) return;
    const playerEntry = playerInventory[itemId];
    if (!playerEntry || playerEntry.quantity <= 0) return;

    // Determine sell price
    const npcEntry = npcInventory[itemId];
    const sellPrice = npcEntry?.price ?? Math.round(playerEntry.price * 0.8);

    // Update player inventory
    if (!removeItem(itemId, 1)) return;

    // Update NPC inventory
    const newNpcInv = { ...npcInventory };
    if (npcEntry) {
      newNpcInv[itemId] = { ...npcEntry, quantity: npcEntry.quantity + 1 };
    } else {
      newNpcInv[itemId] = { quantity: 1, price: sellPrice };
    }
    updateNpcInventory(currentNpcId, newNpcInv);

    // Add money
    addMoney(sellPrice);
  };

  const npcName = npcTpl?.name ?? "Unknown";
  const npcCatchphrase = npcTpl?.catchphrase ?? "";
  const npcLikes = npcTpl?.likes?.join(", ") ?? "";
  const npcHates = npcTpl?.hates?.join(", ") ?? "";

  return (
    <div className="flex flex-col h-full gap-1">
      <Panel title={npcName} className="shrink-0">
        <div className="px-1 py-0.5 text-xs">
          <div className="italic text-gray-400">"{npcCatchphrase}"</div>
          {npcLikes && <div className="text-green-400">Likes: {npcLikes}</div>}
          {npcHates && <div className="text-red-400">Hates: {npcHates}</div>}
        </div>
      </Panel>

      <div className="flex flex-1 gap-1 min-h-0">
        <Panel
          title="Your Items"
          focused={activePanel === "player"}
          className="flex-1 min-w-0"
        >
          <InventoryList
            inventory={playerInventory}
            active={activePanel === "player"}
            onSelect={handleSellItem}
            emptyMessage="(no items)"
          />
        </Panel>

        <Panel
          title={`${npcName}'s Items`}
          focused={activePanel === "npc"}
          className="flex-1 min-w-0"
        >
          <InventoryList
            inventory={npcInventory}
            active={activePanel === "npc"}
            onSelect={handleBuyItem}
            emptyMessage="(no items)"
          />
        </Panel>
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
