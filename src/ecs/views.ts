/**
 * ECS Views - Composed "projections" of entities for React consumption
 * These flatten component data into convenient shapes
 */

import type { World } from "./world";
import type { EntityId, InventoryEntry, LocationType } from "./components";

// ─────────────────────────────────────────────────────────────
// View Types (what React components see)
// ─────────────────────────────────────────────────────────────

export type CityView = {
  id: EntityId;
  name: string;
  description: string;
  priceModifier: number;
};

export type LocationView = {
  id: EntityId;
  cityId: EntityId;
  name: string;
  description: string;
  locationType: LocationType;
  npcCount: number;
};

export type NpcView = {
  id: EntityId;
  name: string;
  catchphrase: string;
  locationId: EntityId | null;
  money: number | null;
  inventory: InventoryEntry[] | null;
  canSell: boolean;
  canBuy: boolean;
  canHeal: boolean;
  canSellTickets: boolean;
};

export type PlayerView = {
  id: EntityId;
  money: number;
  health: number;
  maxHealth: number;
  inventory: InventoryEntry[];
  cityId: EntityId;
  locationId: EntityId | null;
};

// ─────────────────────────────────────────────────────────────
// Selectors (World -> Views)
// ─────────────────────────────────────────────────────────────

export const selectCity = (world: World, cityId: EntityId): CityView | null => {
  const identity = world.identity[cityId];
  const city = world.city[cityId];
  if (!identity || !city) return null;
  
  return {
    id: cityId,
    name: identity.name,
    description: identity.description ?? "",
    priceModifier: city.priceModifier,
  };
};

export const selectAllCities = (world: World): CityView[] => {
  return Object.keys(world.city)
    .map(id => selectCity(world, id))
    .filter((c): c is CityView => c !== null);
};

export const selectLocation = (world: World, locationId: EntityId): LocationView | null => {
  const identity = world.identity[locationId];
  const location = world.location[locationId];
  if (!identity || !location) return null;
  
  // Count NPCs at this location
  const npcCount = Object.entries(world.position)
    .filter(([id, pos]) => 
      pos.locationId === locationId && 
      id in world.identity &&
      !(id in world.player)  // Exclude player
    )
    .length;
  
  return {
    id: locationId,
    cityId: location.cityId,
    name: identity.name,
    description: identity.description ?? "",
    locationType: location.locationType,
    npcCount,
  };
};

export const selectLocationsInCity = (world: World, cityId: EntityId): LocationView[] => {
  return Object.entries(world.location)
    .filter(([_, loc]) => loc.cityId === cityId)
    .map(([id]) => selectLocation(world, id))
    .filter((l): l is LocationView => l !== null);
};

export const selectNpc = (world: World, npcId: EntityId): NpcView | null => {
  const identity = world.identity[npcId];
  const position = world.position[npcId];
  if (!identity || !position) return null;
  if (npcId in world.player) return null;  // Player is not an NPC
  
  const wallet = world.wallet[npcId];
  const inventory = world.inventory[npcId];
  
  return {
    id: npcId,
    name: identity.name,
    catchphrase: identity.catchphrase ?? "",
    locationId: position.locationId,
    money: wallet?.money ?? null,
    inventory: inventory?.items ?? null,
    canSell: npcId in world.seller,
    canBuy: npcId in world.buyer,
    canHeal: npcId in world.doctor,
    canSellTickets: npcId in world.ticketClerk,
  };
};

export const selectNpcsAtLocation = (world: World, locationId: EntityId): NpcView[] => {
  return Object.entries(world.position)
    .filter(([_, pos]) => pos.locationId === locationId)
    .map(([id]) => selectNpc(world, id))
    .filter((n): n is NpcView => n !== null);
};

export const selectPlayer = (world: World): PlayerView | null => {
  const playerId = world.playerId;
  if (!playerId) return null;
  
  const player = world.player[playerId];
  const wallet = world.wallet[playerId];
  const inventory = world.inventory[playerId];
  const position = world.position[playerId];
  
  if (!player || !wallet || !inventory || !position) return null;
  
  return {
    id: playerId,
    money: wallet.money,
    health: player.health,
    maxHealth: player.maxHealth,
    inventory: inventory.items,
    cityId: position.cityId,
    locationId: position.locationId,
  };
};

// ─────────────────────────────────────────────────────────────
// Navigation Selectors (current context)
// ─────────────────────────────────────────────────────────────

export const selectCurrentCity = (world: World): CityView | null =>
  selectCity(world, world.currentCityId);

export const selectCurrentLocation = (world: World): LocationView | null =>
  world.currentLocationId ? selectLocation(world, world.currentLocationId) : null;

export const selectCurrentNpc = (world: World): NpcView | null =>
  world.currentNpcId ? selectNpc(world, world.currentNpcId) : null;

export const selectCurrentLocationNpcs = (world: World): NpcView[] =>
  world.currentLocationId ? selectNpcsAtLocation(world, world.currentLocationId) : [];

export const selectCurrentCityLocations = (world: World): LocationView[] =>
  selectLocationsInCity(world, world.currentCityId);
