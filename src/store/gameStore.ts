import { create } from "zustand";
import { cityTemplates, allCityTemplateIds, getCityTemplate } from "../data/cities";
import { locationTemplates, sampleLocationIds, getLocationTemplate, type LocationId, type StockTemplate } from "../data/locations";
import { npcTemplates, sampleNpcTemplateIds, getNpcTemplate, type NpcTemplateId } from "../data/npcs";
import { itemTemplates, getItemTemplate, type ItemId } from "../data/items";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type Screen = "city" | "location" | "npcList" | "npcInteract" | "travel";

export type FocusedPanel = "locations" | "npcs" | "playerInv" | "npcInv";

export type InventoryEntry = { quantity: number; price: number };
export type Inventory = Record<ItemId, InventoryEntry>;

// Runtime instances
export type NpcInstance = {
  id: string;
  templateId: NpcTemplateId;
  locationId: string | null;
  inventory: Inventory;
};

export type LocationInstance = {
  id: string;
  templateId: LocationId;
  cityId: string;
  npcIds: string[];
};

export type CityInstance = {
  id: string;
  templateId: string;
  locationIds: string[];
};

export type PlayerState = {
  money: number;
  health: number;
  inventory: Inventory;
};

export type Cursors = {
  locations: number;
  npcs: number;
  playerInv: number;
  npcInv: number;
};

export type GameState = {
  // World
  cities: Record<string, CityInstance>;
  locations: Record<string, LocationInstance>;
  npcs: Record<string, NpcInstance>;

  // Navigation
  currentCityId: string;
  currentLocationId: string | null;
  currentNpcId: string | null;

  // UI
  screen: Screen;
  focusedPanel: FocusedPanel;
  cursors: Cursors;

  // Player
  player: PlayerState;
};

export type GameActions = {
  // Navigation
  setScreen: (screen: Screen) => void;
  travelTo: (cityId: string) => void;
  enterLocation: (locationId: string) => void;
  enterNpc: (npcId: string) => void;
  back: () => void;

  // Focus & cursor
  cycleFocus: (direction: 1 | -1) => void;
  moveCursor: (delta: number) => void;

  // Trading
  buyFromNpc: () => void;
  sellToNpc: () => void;

  // NPC movement (symmetric)
  moveNpc: (npcId: string, newLocationId: string | null) => void;
};

export type GameStore = GameState & GameActions;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

let idCounter = 0;
const genId = (prefix: string) => `${prefix}_${++idCounter}`;

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateNpcInventory = (stockTemplate: StockTemplate, cityPriceMod: number): Inventory => {
  const inv: Inventory = {};
  for (const itemId in stockTemplate) {
    const entry = stockTemplate[itemId]!;
    const itemTpl = getItemTemplate(itemId);
    if (!itemTpl) continue;
    const qty = randInt(entry.minQty, entry.maxQty);
    const price = Math.round(itemTpl.basePrice * entry.priceMultiplier * cityPriceMod);
    inv[itemId] = { quantity: qty, price };
  }
  return inv;
};

const initializeWorld = (): Pick<GameState, "cities" | "locations" | "npcs"> => {
  const cities: Record<string, CityInstance> = {};
  const locations: Record<string, LocationInstance> = {};
  const npcs: Record<string, NpcInstance> = {};

  const cityIds = allCityTemplateIds();

  for (const cityTplId of cityIds) {
    const cityTpl = getCityTemplate(cityTplId);
    if (!cityTpl) continue;

    const cityId = genId("city");
    const cityInst: CityInstance = {
      id: cityId,
      templateId: cityTplId,
      locationIds: [],
    };

    // Sample 3-4 locations per city
    const locTplIds = sampleLocationIds(randInt(3, 4));

    for (const locTplId of locTplIds) {
      const locTpl = getLocationTemplate(locTplId);
      if (!locTpl) continue;

      const locId = genId("loc");
      const locInst: LocationInstance = {
        id: locId,
        templateId: locTplId,
        cityId,
        npcIds: [],
      };

      // 1-2 NPCs per location
      const npcCount = randInt(1, 2);
      const npcTplIds = sampleNpcTemplateIds(npcCount);

      for (const npcTplId of npcTplIds) {
        const npcTpl = getNpcTemplate(npcTplId);
        if (!npcTpl) continue;

        const npcId = genId("npc");
        const npcInst: NpcInstance = {
          id: npcId,
          templateId: npcTplId,
          locationId: locId,
          inventory: generateNpcInventory(locTpl.stockTemplate, cityTpl.priceModifier),
        };

        npcs[npcId] = npcInst;
        locInst.npcIds.push(npcId);
      }

      locations[locId] = locInst;
      cityInst.locationIds.push(locId);
    }

    cities[cityId] = cityInst;
  }

  return { cities, locations, npcs };
};

const createInitialPlayer = (): PlayerState => ({
  money: 500,
  health: 100,
  inventory: {},
});

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

const world = initializeWorld();
const firstCityId = Object.keys(world.cities)[0] ?? "";

export const useGameStore = create<GameStore>((set, get) => ({
  ...world,
  currentCityId: firstCityId,
  currentLocationId: null,
  currentNpcId: null,
  screen: "city",
  focusedPanel: "locations",
  cursors: { locations: 0, npcs: 0, playerInv: 0, npcInv: 0 },
  player: createInitialPlayer(),

  // ─── Navigation ───────────────────────────────────────────

  setScreen: (screen) => set({ screen }),

  travelTo: (cityId) => {
    const { cities } = get();
    if (!cities[cityId]) return;
    set({
      currentCityId: cityId,
      currentLocationId: null,
      currentNpcId: null,
      screen: "city",
      focusedPanel: "locations",
      cursors: { locations: 0, npcs: 0, playerInv: 0, npcInv: 0 },
    });
  },

  enterLocation: (locationId) => {
    const { locations } = get();
    const loc = locations[locationId];
    if (!loc) return;
    set({
      currentLocationId: locationId,
      currentNpcId: null,
      screen: "npcList",
      focusedPanel: "npcs",
      cursors: { ...get().cursors, npcs: 0 },
    });
  },

  enterNpc: (npcId) => {
    const { npcs } = get();
    if (!npcs[npcId]) return;
    set({
      currentNpcId: npcId,
      screen: "npcInteract",
      focusedPanel: "npcInv",
      cursors: { ...get().cursors, playerInv: 0, npcInv: 0 },
    });
  },

  back: () => {
    const { screen } = get();
    if (screen === "npcInteract") {
      set({ currentNpcId: null, screen: "npcList", focusedPanel: "npcs" });
    } else if (screen === "npcList") {
      set({ currentLocationId: null, screen: "city", focusedPanel: "locations" });
    } else if (screen === "travel") {
      set({ screen: "city", focusedPanel: "locations" });
    }
  },

  // ─── Focus & Cursor ───────────────────────────────────────

  cycleFocus: (direction) => {
    const { screen, focusedPanel } = get();
    let ring: FocusedPanel[] = [];

    if (screen === "city") ring = ["locations"];
    else if (screen === "npcList") ring = ["npcs"];
    else if (screen === "npcInteract") ring = ["playerInv", "npcInv"];
    else if (screen === "travel") ring = ["locations"];

    if (ring.length === 0) return;

    const idx = ring.indexOf(focusedPanel);
    const next = (idx + direction + ring.length) % ring.length;
    set({ focusedPanel: ring[next]! });
  },

  moveCursor: (delta) => {
    const { focusedPanel, cursors, cities, locations, npcs, currentCityId, currentLocationId, currentNpcId, player } = get();

    const clamp = (val: number, max: number) => Math.max(0, Math.min(val, max - 1));

    if (focusedPanel === "locations") {
      const city = cities[currentCityId];
      const len = city?.locationIds.length ?? 0;
      set({ cursors: { ...cursors, locations: clamp(cursors.locations + delta, len) } });
    } else if (focusedPanel === "npcs") {
      const loc = currentLocationId ? locations[currentLocationId] : null;
      const len = loc?.npcIds.length ?? 0;
      set({ cursors: { ...cursors, npcs: clamp(cursors.npcs + delta, len) } });
    } else if (focusedPanel === "playerInv") {
      const len = Object.keys(player.inventory).length;
      set({ cursors: { ...cursors, playerInv: clamp(cursors.playerInv + delta, len) } });
    } else if (focusedPanel === "npcInv") {
      const npc = currentNpcId ? npcs[currentNpcId] : null;
      const len = npc ? Object.keys(npc.inventory).length : 0;
      set({ cursors: { ...cursors, npcInv: clamp(cursors.npcInv + delta, len) } });
    }
  },

  // ─── Trading ──────────────────────────────────────────────

  buyFromNpc: () => {
    const { npcs, currentNpcId, player, cursors } = get();
    if (!currentNpcId) return;
    const npc = npcs[currentNpcId];
    if (!npc) return;

    const itemIds = Object.keys(npc.inventory);
    const itemId = itemIds[cursors.npcInv];
    if (!itemId) return;

    const npcEntry = npc.inventory[itemId];
    if (!npcEntry || npcEntry.quantity <= 0) return;
    if (player.money < npcEntry.price) return;

    // Update NPC inventory
    const newNpcInv = { ...npc.inventory, [itemId]: { ...npcEntry, quantity: npcEntry.quantity - 1 } };
    const newNpcs = { ...npcs, [currentNpcId]: { ...npc, inventory: newNpcInv } };

    // Update player inventory
    const playerEntry = player.inventory[itemId];
    const newPlayerInv = {
      ...player.inventory,
      [itemId]: { quantity: (playerEntry?.quantity ?? 0) + 1, price: npcEntry.price },
    };

    set({
      npcs: newNpcs,
      player: { ...player, money: player.money - npcEntry.price, inventory: newPlayerInv },
    });
  },

  sellToNpc: () => {
    const { npcs, currentNpcId, player, cursors } = get();
    if (!currentNpcId) return;
    const npc = npcs[currentNpcId];
    if (!npc) return;

    const itemIds = Object.keys(player.inventory);
    const itemId = itemIds[cursors.playerInv];
    if (!itemId) return;

    const playerEntry = player.inventory[itemId];
    if (!playerEntry || playerEntry.quantity <= 0) return;

    // Determine sell price (use NPC's price if they have it, else player's last buy price * 0.8)
    const npcEntry = npc.inventory[itemId];
    const sellPrice = npcEntry?.price ?? Math.round(playerEntry.price * 0.8);

    // Update player inventory
    const newQty = playerEntry.quantity - 1;
    const newPlayerInv = { ...player.inventory };
    if (newQty <= 0) {
      delete newPlayerInv[itemId];
    } else {
      newPlayerInv[itemId] = { ...playerEntry, quantity: newQty };
    }

    // Update NPC inventory
    const newNpcInv = { ...npc.inventory };
    if (npcEntry) {
      newNpcInv[itemId] = { ...npcEntry, quantity: npcEntry.quantity + 1 };
    } else {
      newNpcInv[itemId] = { quantity: 1, price: sellPrice };
    }
    const newNpcs = { ...npcs, [currentNpcId]: { ...npc, inventory: newNpcInv } };

    // Adjust cursor if needed
    const newLen = Object.keys(newPlayerInv).length;
    const newCursor = Math.min(cursors.playerInv, Math.max(0, newLen - 1));

    set({
      npcs: newNpcs,
      player: { ...player, money: player.money + sellPrice, inventory: newPlayerInv },
      cursors: { ...cursors, playerInv: newCursor },
    });
  },

  // ─── NPC Movement (symmetric) ─────────────────────────────

  moveNpc: (npcId, newLocationId) => {
    const { npcs, locations } = get();
    const npc = npcs[npcId];
    if (!npc) return;

    const oldLocationId = npc.locationId;

    // Remove from old location
    let newLocations = { ...locations };
    if (oldLocationId && newLocations[oldLocationId]) {
      const oldLoc = newLocations[oldLocationId]!;
      newLocations[oldLocationId] = {
        ...oldLoc,
        npcIds: oldLoc.npcIds.filter((id) => id !== npcId),
      };
    }

    // Add to new location
    if (newLocationId && newLocations[newLocationId]) {
      const newLoc = newLocations[newLocationId]!;
      newLocations[newLocationId] = {
        ...newLoc,
        npcIds: [...newLoc.npcIds, npcId],
      };
    }

    // Update NPC
    const newNpcs = { ...npcs, [npcId]: { ...npc, locationId: newLocationId } };

    set({ npcs: newNpcs, locations: newLocations });
  },
}));

// ─────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────

export const selectCurrentCity = (state: GameState) => {
  const inst = state.cities[state.currentCityId];
  if (!inst) return null;
  const tpl = getCityTemplate(inst.templateId);
  return tpl ? { ...tpl, ...inst } : null;
};

export const selectCurrentLocation = (state: GameState) => {
  if (!state.currentLocationId) return null;
  const inst = state.locations[state.currentLocationId];
  if (!inst) return null;
  const tpl = getLocationTemplate(inst.templateId);
  return tpl ? { ...tpl, ...inst } : null;
};

export const selectCurrentNpc = (state: GameState) => {
  if (!state.currentNpcId) return null;
  const inst = state.npcs[state.currentNpcId];
  if (!inst) return null;
  const tpl = getNpcTemplate(inst.templateId);
  return tpl ? { ...tpl, ...inst } : null;
};

export const selectLocationsForCity = (state: GameState) => {
  const city = state.cities[state.currentCityId];
  if (!city) return [];
  return city.locationIds.map((id) => {
    const inst = state.locations[id];
    if (!inst) return null;
    const tpl = getLocationTemplate(inst.templateId);
    return tpl ? { ...tpl, ...inst } : null;
  }).filter(Boolean);
};

export const selectNpcsForLocation = (state: GameState) => {
  if (!state.currentLocationId) return [];
  const loc = state.locations[state.currentLocationId];
  if (!loc) return [];
  return loc.npcIds.map((id) => {
    const inst = state.npcs[id];
    if (!inst) return null;
    const tpl = getNpcTemplate(inst.templateId);
    return tpl ? { ...tpl, ...inst } : null;
  }).filter(Boolean);
};
