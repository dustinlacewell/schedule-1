/**
 * ECS Components - Pure data bags, one concern each
 */

// ─────────────────────────────────────────────────────────────
// Core Components (most entities have these)
// ─────────────────────────────────────────────────────────────

/** Display name and flavor text */
export type IdentityComponent = {
  name: string;
  description?: string;
  catchphrase?: string;
};

/** Physical location in the world */
export type PositionComponent = {
  cityId: string;
  locationId: string | null;  // null = traveling or in city but not at location
};

/** Money */
export type WalletComponent = {
  money: number;
  maxMoney?: number;       // Cap (optional)
  incomeRate?: number;     // Per tick (optional)
  lastIncomeTick?: number;
};

/** Item storage */
export type InventoryComponent = {
  items: InventoryEntry[];
};

export type InventoryEntry = {
  itemId: string;
  quantity: number;
  unitPrice: number;  // What they paid / will sell for
};

// ─────────────────────────────────────────────────────────────
// Behavior Components (define what an entity can do)
// ─────────────────────────────────────────────────────────────

/** Can sell items to player */
export type SellerComponent = {
  priceModifier: number;      // Markup (1.0 = base price)
  stockTemplateId: string;    // Which stock template to use for restock
  restockRate: number;        // Ticks between restocks
  lastRestockTick: number;
};

/** Can buy items from player */
export type BuyerComponent = {
  priceModifier: number;      // How much of base price they pay (0.8 = 80%)
  preferredCategories: string[];  // Pay more for these
  dislikedCategories: string[];   // Pay less for these
  preferenceBonus: number;    // Multiplier for preferred (e.g., 1.2)
  dislikePenalty: number;     // Multiplier for disliked (e.g., 0.5)
};

/** Can heal the player */
export type DoctorComponent = {
  healAmount: number;
  healCost: number;
};

/** Can sell travel tickets */
export type TicketClerkComponent = {
  destinationCityIds: string[];  // Which cities they can send you to
  baseFare: number;
};

// ─────────────────────────────────────────────────────────────
// Location Components (for location entities)
// ─────────────────────────────────────────────────────────────

/** Marks an entity as a location */
export type LocationComponent = {
  cityId: string;
  locationType: LocationType;
};

export type LocationType =
  | "generic"
  | "airport"
  | "bus_station"
  | "hospital"
  | "dealer_den"
  | "market"
  | "bar"
  | "warehouse"
  | "park";

// ─────────────────────────────────────────────────────────────
// City Components (for city entities)
// ─────────────────────────────────────────────────────────────

/** Marks an entity as a city */
export type CityComponent = {
  priceModifier: number;  // Affects all prices in this city
};

// ─────────────────────────────────────────────────────────────
// Player Components (player-specific)
// ─────────────────────────────────────────────────────────────

/** Marks the player entity */
export type PlayerComponent = {
  health: number;
  maxHealth: number;
};

// ─────────────────────────────────────────────────────────────
// Component Table Type (all components in one place)
// ─────────────────────────────────────────────────────────────

export type EntityId = string;

export type ComponentTables = {
  identity: Record<EntityId, IdentityComponent>;
  position: Record<EntityId, PositionComponent>;
  wallet: Record<EntityId, WalletComponent>;
  inventory: Record<EntityId, InventoryComponent>;
  seller: Record<EntityId, SellerComponent>;
  buyer: Record<EntityId, BuyerComponent>;
  doctor: Record<EntityId, DoctorComponent>;
  ticketClerk: Record<EntityId, TicketClerkComponent>;
  location: Record<EntityId, LocationComponent>;
  city: Record<EntityId, CityComponent>;
  player: Record<EntityId, PlayerComponent>;
};
