import { useWorldStore } from "./worldStore";
import { usePlayerStore } from "./playerStore";
import { useNavigationStore } from "./navigationStore";
import { useUiStore } from "./uiStore";

// ─────────────────────────────────────────────────────────────
// Trade Actions (composed from other stores)
// ─────────────────────────────────────────────────────────────

export const buyFromNpc = () => {
  const { npcs } = useWorldStore.getState();
  const { currentNpcId } = useNavigationStore.getState();
  const { cursors } = useUiStore.getState();
  const { money, addItem } = usePlayerStore.getState();

  if (!currentNpcId) return;
  const npc = npcs[currentNpcId];
  if (!npc) return;

  const itemIds = Object.keys(npc.inventory);
  const itemId = itemIds[cursors.npcInv];
  if (!itemId) return;

  const npcEntry = npc.inventory[itemId];
  if (!npcEntry || npcEntry.quantity <= 0) return;
  if (money < npcEntry.price) return;

  // Update NPC inventory
  const newNpcInv = {
    ...npc.inventory,
    [itemId]: { ...npcEntry, quantity: npcEntry.quantity - 1 },
  };
  useWorldStore.getState().updateNpcInventory(currentNpcId, newNpcInv);

  // Update player
  usePlayerStore.getState().removeMoney(npcEntry.price);
  addItem(itemId, 1, npcEntry.price);
};

export const sellToNpc = () => {
  const { npcs } = useWorldStore.getState();
  const { currentNpcId } = useNavigationStore.getState();
  const { cursors } = useUiStore.getState();
  const { inventory, removeItem, addMoney } = usePlayerStore.getState();

  if (!currentNpcId) return;
  const npc = npcs[currentNpcId];
  if (!npc) return;

  const itemIds = Object.keys(inventory);
  const itemId = itemIds[cursors.playerInv];
  if (!itemId) return;

  const playerEntry = inventory[itemId];
  if (!playerEntry || playerEntry.quantity <= 0) return;

  // Determine sell price
  const npcEntry = npc.inventory[itemId];
  const sellPrice = npcEntry?.price ?? Math.round(playerEntry.price * 0.8);

  // Update player inventory
  if (!removeItem(itemId, 1)) return;

  // Update NPC inventory
  const newNpcInv = { ...npc.inventory };
  if (npcEntry) {
    newNpcInv[itemId] = { ...npcEntry, quantity: npcEntry.quantity + 1 };
  } else {
    newNpcInv[itemId] = { quantity: 1, price: sellPrice };
  }
  useWorldStore.getState().updateNpcInventory(currentNpcId, newNpcInv);

  // Add money to player
  addMoney(sellPrice);

  // Adjust cursor if needed
  const newLen = Object.keys(usePlayerStore.getState().inventory).length;
  const { setCursor } = useUiStore.getState();
  if (cursors.playerInv >= newLen && newLen > 0) {
    setCursor("playerInv", newLen - 1);
  }
};
