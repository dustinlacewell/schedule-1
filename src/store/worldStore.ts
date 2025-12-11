import { create } from "zustand";
import { allCityTemplateIds, getCityTemplate } from "../data/cities";
import { sampleLocationIds, getLocationTemplate, type StockTemplate } from "../data/locations";
import { sampleNpcTemplateIds, getNpcTemplate, type NpcTemplateId } from "../data/npcs";
import { getItemTemplate, type ItemId } from "../data/items";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type InventoryEntry = { quantity: number; price: number };
export type Inventory = Record<ItemId, InventoryEntry>;

export type NpcInstance = {
  id: string;
  templateId: NpcTemplateId;
  locationId: string | null;
  inventory: Inventory;
};

export type LocationInstance = {
  id: string;
  templateId: string;
  cityId: string;
  npcIds: string[];
};

export type CityInstance = {
  id: string;
  templateId: string;
  locationIds: string[];
};

export type WorldState = {
  cities: Record<string, CityInstance>;
  locations: Record<string, LocationInstance>;
  npcs: Record<string, NpcInstance>;
};

export type WorldActions = {
  moveNpc: (npcId: string, newLocationId: string | null) => void;
  updateNpcInventory: (npcId: string, inventory: Inventory) => void;
};

export type WorldStore = WorldState & WorldActions;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

let idCounter = 0;
const genId = (prefix: string) => `${prefix}_${++idCounter}`;

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateNpcInventory = (
  stockTemplate: StockTemplate,
  cityPriceMod: number
): Inventory => {
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

const initializeWorld = (): WorldState => {
  const cities: Record<string, CityInstance> = {};
  const locations: Record<string, LocationInstance> = {};
  const npcs: Record<string, NpcInstance> = {};

  const cityTplIds = allCityTemplateIds();

  for (const cityTplId of cityTplIds) {
    const cityTpl = getCityTemplate(cityTplId);
    if (!cityTpl) continue;

    const cityId = genId("city");
    const cityInst: CityInstance = {
      id: cityId,
      templateId: cityTplId,
      locationIds: [],
    };

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

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

const initialWorld = initializeWorld();

export const useWorldStore = create<WorldStore>((set, get) => ({
  ...initialWorld,

  moveNpc: (npcId, newLocationId) => {
    const { npcs, locations } = get();
    const npc = npcs[npcId];
    if (!npc) return;

    const oldLocationId = npc.locationId;
    let newLocations = { ...locations };

    // Remove from old location
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

    const newNpcs = { ...npcs, [npcId]: { ...npc, locationId: newLocationId } };
    set({ npcs: newNpcs, locations: newLocations });
  },

  updateNpcInventory: (npcId, inventory) => {
    const { npcs } = get();
    const npc = npcs[npcId];
    if (!npc) return;
    set({ npcs: { ...npcs, [npcId]: { ...npc, inventory } } });
  },
}));

// Export first city ID for initialization
export const getFirstCityId = () => Object.keys(initialWorld.cities)[0] ?? "";
