import { create } from "zustand";
import type { ItemId } from "../data/items";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type InventoryEntry = { quantity: number; price: number };
export type Inventory = Record<ItemId, InventoryEntry>;

export type PlayerState = {
  money: number;
  health: number;
  inventory: Inventory;
};

export type PlayerActions = {
  addMoney: (amount: number) => void;
  removeMoney: (amount: number) => boolean;
  addItem: (itemId: ItemId, quantity: number, price: number) => void;
  removeItem: (itemId: ItemId, quantity: number) => boolean;
  setHealth: (health: number) => void;
};

export type PlayerStore = PlayerState & PlayerActions;

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  money: 500,
  health: 100,
  inventory: {},

  addMoney: (amount) => {
    set((s) => ({ money: s.money + amount }));
  },

  removeMoney: (amount) => {
    const { money } = get();
    if (money < amount) return false;
    set({ money: money - amount });
    return true;
  },

  addItem: (itemId, quantity, price) => {
    const { inventory } = get();
    const existing = inventory[itemId];
    set({
      inventory: {
        ...inventory,
        [itemId]: {
          quantity: (existing?.quantity ?? 0) + quantity,
          price,
        },
      },
    });
  },

  removeItem: (itemId, quantity) => {
    const { inventory } = get();
    const existing = inventory[itemId];
    if (!existing || existing.quantity < quantity) return false;

    const newQty = existing.quantity - quantity;
    const newInventory = { ...inventory };

    if (newQty <= 0) {
      delete newInventory[itemId];
    } else {
      newInventory[itemId] = { ...existing, quantity: newQty };
    }

    set({ inventory: newInventory });
    return true;
  },

  setHealth: (health) => {
    set({ health: Math.max(0, Math.min(100, health)) });
  },
}));
