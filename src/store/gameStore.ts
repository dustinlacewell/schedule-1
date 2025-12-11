import { create } from "zustand";
import { cities } from "../data/cities.js";
import { drugs } from "../data/drugs.js";
import { type Market } from "../types.js";

export type Screen = "city" | "trade" | "travel" | "pharmacy";

export type Inventory = Map<string, number>;

export type PlayerState = {
  money: number;
  health: number;
  location: string;
  inventory: Inventory;
};

export type GameState = {
  player: PlayerState;
  screen: Screen;
};

export type GameActions = {
  setScreen: (screen: Screen) => void;
  buyItem: (key: string) => void;
  sellItem: (key: string) => void;
  travelTo: (cityKey: string) => void;
};

export type GameStore = GameState & GameActions;

const createInitialPlayer = (): PlayerState => ({
  money: 100,
  health: 100,
  location: "chicago",
  inventory: new Map<string, number>(),
});

const getMarketForCity = (cityKey: string): Market => {
  const city = cities[cityKey];
  return city?.market ?? {};
};

const getPrice = (cityKey: string, drugKey: string): number => {
  const market = getMarketForCity(cityKey);
  const price = market[drugKey];
  return price ?? 0;
};

export const useGameStore = create<GameStore>((set, get) => ({
  player: createInitialPlayer(),
  screen: "city",

  setScreen: (screen) => set({ screen }),

  buyItem: (drugKey) => {
    const { player } = get();
    const price = getPrice(player.location, drugKey);
    if (price <= 0) return;
    if (player.money < price) return;

    const nextInventory = new Map(player.inventory);
    const current = nextInventory.get(drugKey) ?? 0;
    nextInventory.set(drugKey, current + 1);

    set({
      player: {
        ...player,
        money: player.money - price,
        inventory: nextInventory,
      },
    });
  },

  sellItem: (drugKey) => {
    const { player } = get();
    const price = getPrice(player.location, drugKey);
    const current = player.inventory.get(drugKey) ?? 0;
    if (price <= 0 || current <= 0) return;

    const nextInventory = new Map(player.inventory);
    nextInventory.set(drugKey, current - 1);

    set({
      player: {
        ...player,
        money: player.money + price,
        inventory: nextInventory,
      },
    });
  },

  travelTo: (cityKey) => {
    if (!cities[cityKey]) return;
    const { player } = get();
    set({
      player: {
        ...player,
        location: cityKey,
      },
      screen: "city",
    });
  },
}));

export const getDrugKeys = (): string[] => Object.keys(drugs);
