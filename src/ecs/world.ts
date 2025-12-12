/**
 * ECS World - The game state container
 */

import type { ComponentTables, EntityId } from "./components";

export type World = ComponentTables & {
  // Global game state
  gameTick: number;
  playerId: EntityId;
  
  // Navigation state (where is the player looking)
  currentCityId: EntityId;
  currentLocationId: EntityId | null;
  currentNpcId: EntityId | null;
  
  // Screen state
  screen: Screen;
};

export type Screen =
  | "city"
  | "location"
  | "npc"
  | "travel";

// ─────────────────────────────────────────────────────────────
// Entity Helpers
// ─────────────────────────────────────────────────────────────

let idCounter = 0;

export const genId = (prefix: string): EntityId =>
  `${prefix}_${++idCounter}`;

export const resetIdCounter = () => {
  idCounter = 0;
};

/** Check if an entity has a component */
export const hasComponent = <K extends keyof ComponentTables>(
  world: World,
  entityId: EntityId,
  component: K
): boolean => entityId in world[component];

/** Get all entity IDs that have a specific component */
export const entitiesWith = <K extends keyof ComponentTables>(
  world: World,
  component: K
): EntityId[] => Object.keys(world[component]);

/** Get all entity IDs that have ALL specified components */
export const entitiesWithAll = (
  world: World,
  ...components: (keyof ComponentTables)[]
): EntityId[] => {
  if (components.length === 0) return [];
  
  const [first, ...rest] = components;
  const candidates = entitiesWith(world, first!);
  
  return candidates.filter(id =>
    rest.every(comp => hasComponent(world, id, comp))
  );
};

// ─────────────────────────────────────────────────────────────
// Empty World Factory
// ─────────────────────────────────────────────────────────────

export const createEmptyWorld = (): World => ({
  // Component tables
  identity: {},
  position: {},
  wallet: {},
  inventory: {},
  seller: {},
  buyer: {},
  doctor: {},
  ticketClerk: {},
  location: {},
  city: {},
  player: {},
  
  // Global state
  gameTick: 0,
  playerId: "",
  currentCityId: "",
  currentLocationId: null,
  currentNpcId: null,
  screen: "city",
});
