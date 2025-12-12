/**
 * ECS Systems - Pure functions that transform World state
 * Each system operates on entities with specific components
 */

import type { World } from "./world";
import type { InventoryEntry } from "./components";
import { getItemBasePrice } from "./worldgen";

// ─────────────────────────────────────────────────────────────
// Tick Systems (run every game tick)
// ─────────────────────────────────────────────────────────────

/** Restore wallet money over time */
export const walletIncomeSystem = (world: World): World => {
  const newWallets = { ...world.wallet };
  let changed = false;
  
  for (const [id, wallet] of Object.entries(world.wallet)) {
    if (!wallet.incomeRate || wallet.incomeRate <= 0) continue;
    if (wallet.lastIncomeTick !== undefined && world.gameTick - wallet.lastIncomeTick < 10) continue;
    
    const maxMoney = wallet.maxMoney ?? Infinity;
    if (wallet.money >= maxMoney) continue;
    
    changed = true;
    newWallets[id] = {
      ...wallet,
      money: Math.min(maxMoney, wallet.money + wallet.incomeRate),
      lastIncomeTick: world.gameTick,
    };
  }
  
  return changed ? { ...world, wallet: newWallets } : world;
};

/** Restock seller inventories */
export const sellerRestockSystem = (world: World): World => {
  // TODO: Implement when we have proper stock templates accessible
  // For now, sellers keep their initial inventory
  return world;
};

/** Run all tick systems */
export const runTickSystems = (world: World): World => {
  let next = world;
  next = walletIncomeSystem(next);
  next = sellerRestockSystem(next);
  return next;
};

/** Advance time by N ticks, running systems each tick */
export const advanceTime = (world: World, ticks: number): World => {
  let next = world;
  for (let i = 0; i < ticks; i++) {
    next = { ...next, gameTick: next.gameTick + 1 };
    next = runTickSystems(next);
  }
  return next;
};

// ─────────────────────────────────────────────────────────────
// Action Systems (triggered by player actions)
// ─────────────────────────────────────────────────────────────

/** Player buys an item from an NPC */
export const buyItem = (
  world: World,
  npcId: string,
  itemId: string,
  quantity: number = 1
): World => {
  const playerId = world.playerId;
  const playerWallet = world.wallet[playerId];
  const playerInventory = world.inventory[playerId];
  const npcInventory = world.inventory[npcId];
  const seller = world.seller[npcId];
  
  if (!playerWallet || !playerInventory || !npcInventory || !seller) {
    return world;
  }
  
  // Find item in NPC inventory
  const npcItemIndex = npcInventory.items.findIndex(e => e.itemId === itemId);
  if (npcItemIndex === -1) return world;
  
  const npcItem = npcInventory.items[npcItemIndex]!;
  if (npcItem.quantity < quantity) return world;
  
  const totalCost = npcItem.unitPrice * quantity;
  if (playerWallet.money < totalCost) return world;
  
  // Update NPC inventory
  const newNpcItems = [...npcInventory.items];
  if (npcItem.quantity === quantity) {
    newNpcItems.splice(npcItemIndex, 1);
  } else {
    newNpcItems[npcItemIndex] = { ...npcItem, quantity: npcItem.quantity - quantity };
  }
  
  // Update player inventory
  const playerItemIndex = playerInventory.items.findIndex(e => e.itemId === itemId);
  const newPlayerItems = [...playerInventory.items];
  if (playerItemIndex === -1) {
    newPlayerItems.push({ itemId, quantity, unitPrice: npcItem.unitPrice });
  } else {
    const existing = newPlayerItems[playerItemIndex]!;
    // Average the price
    const totalQty = existing.quantity + quantity;
    const avgPrice = Math.round((existing.unitPrice * existing.quantity + npcItem.unitPrice * quantity) / totalQty);
    newPlayerItems[playerItemIndex] = { ...existing, quantity: totalQty, unitPrice: avgPrice };
  }
  
  return {
    ...world,
    wallet: {
      ...world.wallet,
      [playerId]: { ...playerWallet, money: playerWallet.money - totalCost },
    },
    inventory: {
      ...world.inventory,
      [playerId]: { items: newPlayerItems },
      [npcId]: { items: newNpcItems },
    },
  };
};

/** Player sells an item to an NPC */
export const sellItem = (
  world: World,
  npcId: string,
  itemId: string,
  quantity: number = 1
): World => {
  const playerId = world.playerId;
  const playerWallet = world.wallet[playerId];
  const playerInventory = world.inventory[playerId];
  const npcWallet = world.wallet[npcId];
  const buyer = world.buyer[npcId];
  
  if (!playerWallet || !playerInventory || !buyer) {
    return world;
  }
  
  // Find item in player inventory
  const playerItemIndex = playerInventory.items.findIndex(e => e.itemId === itemId);
  if (playerItemIndex === -1) return world;
  
  const playerItem = playerInventory.items[playerItemIndex]!;
  if (playerItem.quantity < quantity) return world;
  
  // Calculate sell price
  const basePrice = getItemBasePrice(itemId);
  let sellPrice = Math.round(basePrice * buyer.priceModifier);
  
  // TODO: Apply preference bonuses/penalties based on item category
  
  const totalValue = sellPrice * quantity;
  
  // Check if NPC has enough money (if they have a wallet)
  if (npcWallet && npcWallet.money < totalValue) return world;
  
  // Update player inventory
  const newPlayerItems = [...playerInventory.items];
  if (playerItem.quantity === quantity) {
    newPlayerItems.splice(playerItemIndex, 1);
  } else {
    newPlayerItems[playerItemIndex] = { ...playerItem, quantity: playerItem.quantity - quantity };
  }
  
  // Update wallets
  const newWallets = {
    ...world.wallet,
    [playerId]: { ...playerWallet, money: playerWallet.money + totalValue },
  };
  if (npcWallet) {
    newWallets[npcId] = { ...npcWallet, money: npcWallet.money - totalValue };
  }
  
  // Update NPC inventory (they now have the item)
  const newInventories = {
    ...world.inventory,
    [playerId]: { items: newPlayerItems },
  };
  
  const npcInventory = world.inventory[npcId];
  if (npcInventory) {
    const npcItemIndex = npcInventory.items.findIndex(e => e.itemId === itemId);
    const newNpcItems = [...npcInventory.items];
    if (npcItemIndex === -1) {
      newNpcItems.push({ itemId, quantity, unitPrice: sellPrice });
    } else {
      const existing = newNpcItems[npcItemIndex]!;
      newNpcItems[npcItemIndex] = { ...existing, quantity: existing.quantity + quantity };
    }
    newInventories[npcId] = { items: newNpcItems };
  }
  
  return {
    ...world,
    wallet: newWallets,
    inventory: newInventories,
  };
};

/** Player gets healed by a doctor */
export const healPlayer = (world: World, npcId: string): World => {
  const playerId = world.playerId;
  const playerWallet = world.wallet[playerId];
  const player = world.player[playerId];
  const doctor = world.doctor[npcId];
  
  if (!playerWallet || !player || !doctor) return world;
  if (playerWallet.money < doctor.healCost) return world;
  if (player.health >= player.maxHealth) return world;
  
  return {
    ...world,
    wallet: {
      ...world.wallet,
      [playerId]: { ...playerWallet, money: playerWallet.money - doctor.healCost },
    },
    player: {
      ...world.player,
      [playerId]: {
        ...player,
        health: Math.min(player.maxHealth, player.health + doctor.healAmount),
      },
    },
  };
};

/** Player travels to another city */
export const travelToCity = (world: World, cityId: string, fare: number = 0): World => {
  const playerId = world.playerId;
  const playerWallet = world.wallet[playerId];
  const playerPosition = world.position[playerId];
  
  if (!playerWallet || !playerPosition) return world;
  if (playerWallet.money < fare) return world;
  if (!(cityId in world.city)) return world;
  
  return {
    ...world,
    wallet: {
      ...world.wallet,
      [playerId]: { ...playerWallet, money: playerWallet.money - fare },
    },
    position: {
      ...world.position,
      [playerId]: { ...playerPosition, cityId, locationId: null },
    },
    currentCityId: cityId,
    currentLocationId: null,
    currentNpcId: null,
    screen: "city",
  };
};
