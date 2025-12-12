/**
 * World Generation - Creates initial game state from templates
 * Templates are ONLY used here, never at runtime
 */

import type { World } from "./world";
import { createEmptyWorld, genId, resetIdCounter } from "./world";
import type {
  EntityId,
  LocationType,
  InventoryEntry,
} from "./components";

// ─────────────────────────────────────────────────────────────
// Templates (data-driven world definition)
// ─────────────────────────────────────────────────────────────

type CityTemplate = {
  id: string;
  name: string;
  description: string;
  priceModifier: number;
  requiredLocations: LocationType[];
  randomLocationPool: LocationType[];
  randomLocationCount: number;
};

type LocationTemplate = {
  type: LocationType;
  name: string;
  description: string;
  npcs: NpcSpawnConfig[];
};

type NpcSpawnConfig = {
  namePool: string[];
  catchphrasePool: string[];
  capabilities: {
    seller?: { stockTemplateId: string; priceModifier?: number; restockRate?: number };
    buyer?: { priceModifier?: number; preferredCategories?: string[]; dislikedCategories?: string[] };
    doctor?: { healAmount: number; healCost: number };
    ticketClerk?: { baseFare: number };
  };
  startingMoney?: number;
};

type StockTemplate = {
  items: { itemId: string; minQty: number; maxQty: number; priceMultiplier: number }[];
};

// ─────────────────────────────────────────────────────────────
// Template Data
// ─────────────────────────────────────────────────────────────

const cityTemplates: CityTemplate[] = [
  {
    id: "northtown",
    name: "Northtown",
    description: "A cold industrial city with opportunity for those who seek it.",
    priceModifier: 1.0,
    requiredLocations: ["airport", "hospital", "bus_station"],
    randomLocationPool: ["dealer_den", "market", "bar", "warehouse", "park"],
    randomLocationCount: 3,
  },
  {
    id: "westburg",
    name: "Westburg",
    description: "A sprawling coastal metropolis.",
    priceModifier: 1.2,
    requiredLocations: ["airport", "hospital"],
    randomLocationPool: ["dealer_den", "market", "bar", "warehouse"],
    randomLocationCount: 4,
  },
  {
    id: "easton",
    name: "Easton",
    description: "A quiet town with secrets beneath the surface.",
    priceModifier: 0.8,
    requiredLocations: ["bus_station", "hospital"],
    randomLocationPool: ["dealer_den", "bar", "park", "warehouse"],
    randomLocationCount: 3,
  },
];

const locationTemplates: Record<LocationType, LocationTemplate> = {
  airport: {
    type: "airport",
    name: "Airport",
    description: "A bustling hub of travel.",
    npcs: [
      {
        namePool: ["Ticket Agent", "Airport Clerk", "Gate Attendant"],
        catchphrasePool: ["Where to today?", "Have your ID ready.", "Next in line!"],
        capabilities: {
          ticketClerk: { baseFare: 200 },
        },
      },
    ],
  },
  bus_station: {
    type: "bus_station",
    name: "Bus Station",
    description: "Cheap travel for those with time.",
    npcs: [
      {
        namePool: ["Bus Driver", "Station Clerk"],
        catchphrasePool: ["All aboard!", "Exact change only."],
        capabilities: {
          ticketClerk: { baseFare: 50 },
        },
      },
    ],
  },
  hospital: {
    type: "hospital",
    name: "Hospital",
    description: "Medical care, no questions asked.",
    npcs: [
      {
        namePool: ["Dr. Smith", "Dr. Jones", "Nurse Ratchet"],
        catchphrasePool: ["What seems to be the problem?", "This might sting.", "Deep breaths."],
        capabilities: {
          doctor: { healAmount: 50, healCost: 100 },
        },
      },
    ],
  },
  dealer_den: {
    type: "dealer_den",
    name: "The Corner",
    description: "Sketchy but profitable.",
    npcs: [
      {
        namePool: ["Shady Pete", "Big Mike", "Slim", "Two-Tone", "Razor"],
        catchphrasePool: ["You buying or what?", "Keep it cool.", "I got what you need.", "Don't waste my time."],
        capabilities: {
          seller: { stockTemplateId: "drugs", priceModifier: 1.0, restockRate: 50 },
          buyer: { priceModifier: 0.7, preferredCategories: ["drugs"] },
        },
        startingMoney: 500,
      },
      {
        namePool: ["Quiet Lou", "The Kid", "Mumbles"],
        catchphrasePool: ["...", "Yeah.", "Whatever."],
        capabilities: {
          buyer: { priceModifier: 0.6 },
        },
        startingMoney: 300,
      },
    ],
  },
  market: {
    type: "market",
    name: "Street Market",
    description: "Legitimate goods, mostly.",
    npcs: [
      {
        namePool: ["Vendor", "Shopkeep", "Merchant"],
        catchphrasePool: ["Best prices in town!", "Quality goods!", "Take a look!"],
        capabilities: {
          seller: { stockTemplateId: "general", priceModifier: 1.1, restockRate: 100 },
        },
      },
    ],
  },
  bar: {
    type: "bar",
    name: "Dive Bar",
    description: "Cheap drinks and loose lips.",
    npcs: [
      {
        namePool: ["Bartender", "Barkeep"],
        catchphrasePool: ["What'll it be?", "Tab's running.", "Last call soon."],
        capabilities: {
          seller: { stockTemplateId: "drinks", priceModifier: 1.0, restockRate: 30 },
        },
      },
    ],
  },
  warehouse: {
    type: "warehouse",
    name: "Abandoned Warehouse",
    description: "Empty... or is it?",
    npcs: [
      {
        namePool: ["Fence", "The Collector", "Middleman"],
        catchphrasePool: ["No questions.", "Cash only.", "You didn't see me."],
        capabilities: {
          buyer: { priceModifier: 0.5 },
        },
        startingMoney: 1000,
      },
    ],
  },
  park: {
    type: "park",
    name: "City Park",
    description: "A quiet place to do business.",
    npcs: [
      {
        namePool: ["Jogger", "Dog Walker", "Bench Guy"],
        catchphrasePool: ["Nice day.", "Looking for something?", "I might know a guy."],
        capabilities: {
          buyer: { priceModifier: 0.65, preferredCategories: ["drugs"] },
        },
        startingMoney: 200,
      },
    ],
  },
  generic: {
    type: "generic",
    name: "Empty Lot",
    description: "Nothing here.",
    npcs: [],
  },
};

const stockTemplates: Record<string, StockTemplate> = {
  drugs: {
    items: [
      { itemId: "weed", minQty: 5, maxQty: 20, priceMultiplier: 1.0 },
      { itemId: "coke", minQty: 1, maxQty: 5, priceMultiplier: 1.0 },
      { itemId: "meth", minQty: 2, maxQty: 8, priceMultiplier: 1.0 },
    ],
  },
  general: {
    items: [
      { itemId: "bandages", minQty: 3, maxQty: 10, priceMultiplier: 1.0 },
      { itemId: "energy_drink", minQty: 5, maxQty: 15, priceMultiplier: 1.0 },
    ],
  },
  drinks: {
    items: [
      { itemId: "beer", minQty: 10, maxQty: 30, priceMultiplier: 1.0 },
      { itemId: "whiskey", minQty: 3, maxQty: 10, priceMultiplier: 1.0 },
    ],
  },
};

const itemData: Record<string, { name: string; basePrice: number; category: string }> = {
  weed: { name: "Weed", basePrice: 20, category: "drugs" },
  coke: { name: "Cocaine", basePrice: 150, category: "drugs" },
  meth: { name: "Meth", basePrice: 80, category: "drugs" },
  bandages: { name: "Bandages", basePrice: 15, category: "medical" },
  energy_drink: { name: "Energy Drink", basePrice: 5, category: "consumable" },
  beer: { name: "Beer", basePrice: 8, category: "drinks" },
  whiskey: { name: "Whiskey", basePrice: 25, category: "drinks" },
};

// ─────────────────────────────────────────────────────────────
// Generation Helpers
// ─────────────────────────────────────────────────────────────

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]!;

const pickRandomN = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

const generateInventory = (
  stockTemplateId: string,
  priceModifier: number,
  cityPriceModifier: number
): InventoryEntry[] => {
  const template = stockTemplates[stockTemplateId];
  if (!template) return [];
  
  return template.items.map(item => {
    const itemInfo = itemData[item.itemId];
    if (!itemInfo) return null;
    
    return {
      itemId: item.itemId,
      quantity: randInt(item.minQty, item.maxQty),
      unitPrice: Math.round(itemInfo.basePrice * item.priceMultiplier * priceModifier * cityPriceModifier),
    };
  }).filter((e): e is InventoryEntry => e !== null);
};

// ─────────────────────────────────────────────────────────────
// World Generator
// ─────────────────────────────────────────────────────────────

export const generateWorld = (): World => {
  resetIdCounter();
  const world = createEmptyWorld();
  
  // Track all city IDs for ticket clerks
  const allCityIds: EntityId[] = [];
  
  // Generate cities
  for (const cityTpl of cityTemplates) {
    const cityId = genId("city");
    allCityIds.push(cityId);
    
    // City entity
    world.identity[cityId] = {
      name: cityTpl.name,
      description: cityTpl.description,
    };
    world.city[cityId] = {
      priceModifier: cityTpl.priceModifier,
    };
    
    // Determine locations for this city
    const locationTypes = [
      ...cityTpl.requiredLocations,
      ...pickRandomN(cityTpl.randomLocationPool, cityTpl.randomLocationCount),
    ];
    
    // Generate locations
    for (const locType of locationTypes) {
      const locTpl = locationTemplates[locType];
      const locationId = genId("loc");
      
      world.identity[locationId] = {
        name: locTpl.name,
        description: locTpl.description,
      };
      world.location[locationId] = {
        cityId,
        locationType: locType,
      };
      
      // Generate NPCs for this location
      for (const npcConfig of locTpl.npcs) {
        const npcId = genId("npc");
        
        world.identity[npcId] = {
          name: pickRandom(npcConfig.namePool),
          catchphrase: pickRandom(npcConfig.catchphrasePool),
        };
        
        world.position[npcId] = {
          cityId,
          locationId,
        };
        
        // Wallet (if they have money)
        if (npcConfig.startingMoney !== undefined || npcConfig.capabilities.buyer) {
          world.wallet[npcId] = {
            money: npcConfig.startingMoney ?? 500,
            maxMoney: (npcConfig.startingMoney ?? 500) * 2,
            incomeRate: 10,
            lastIncomeTick: 0,
          };
        }
        
        // Seller capability
        if (npcConfig.capabilities.seller) {
          const sellerCfg = npcConfig.capabilities.seller;
          world.seller[npcId] = {
            priceModifier: sellerCfg.priceModifier ?? 1.0,
            stockTemplateId: sellerCfg.stockTemplateId,
            restockRate: sellerCfg.restockRate ?? 50,
            lastRestockTick: 0,
          };
          
          // Generate initial inventory
          world.inventory[npcId] = {
            items: generateInventory(
              sellerCfg.stockTemplateId,
              sellerCfg.priceModifier ?? 1.0,
              cityTpl.priceModifier
            ),
          };
        }
        
        // Buyer capability
        if (npcConfig.capabilities.buyer) {
          const buyerCfg = npcConfig.capabilities.buyer;
          world.buyer[npcId] = {
            priceModifier: buyerCfg.priceModifier ?? 0.7,
            preferredCategories: buyerCfg.preferredCategories ?? [],
            dislikedCategories: buyerCfg.dislikedCategories ?? [],
            preferenceBonus: 1.2,
            dislikePenalty: 0.5,
          };
        }
        
        // Doctor capability
        if (npcConfig.capabilities.doctor) {
          world.doctor[npcId] = npcConfig.capabilities.doctor;
        }
        
        // Ticket clerk capability (destinations filled in later)
        if (npcConfig.capabilities.ticketClerk) {
          world.ticketClerk[npcId] = {
            destinationCityIds: [],  // Filled in after all cities exist
            baseFare: npcConfig.capabilities.ticketClerk.baseFare,
          };
        }
      }
    }
  }
  
  // Fill in ticket clerk destinations (all other cities)
  for (const [npcId, clerk] of Object.entries(world.ticketClerk)) {
    const npcPosition = world.position[npcId];
    if (npcPosition) {
      clerk.destinationCityIds = allCityIds.filter(id => id !== npcPosition.cityId);
    }
  }
  
  // Create player
  const playerId = genId("player");
  const startCityId = allCityIds[0]!;
  
  world.identity[playerId] = {
    name: "Player",
  };
  world.position[playerId] = {
    cityId: startCityId,
    locationId: null,
  };
  world.wallet[playerId] = {
    money: 500,
  };
  world.inventory[playerId] = {
    items: [],
  };
  world.player[playerId] = {
    health: 100,
    maxHealth: 100,
  };
  
  // Set initial state
  world.playerId = playerId;
  world.currentCityId = startCityId;
  
  return world;
};

// Export item data for UI
export const getItemName = (itemId: string): string =>
  itemData[itemId]?.name ?? itemId;

export const getItemCategory = (itemId: string): string =>
  itemData[itemId]?.category ?? "unknown";

export const getItemBasePrice = (itemId: string): number =>
  itemData[itemId]?.basePrice ?? 0;
