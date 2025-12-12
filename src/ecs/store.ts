/**
 * ECS Store - Zustand store wrapping the ECS world
 */

import { create } from "zustand";
import type { World, Screen } from "./world";
import type { EntityId } from "./components";
import { generateWorld } from "./worldgen";
import { advanceTime, buyItem, sellItem, healPlayer, travelToCity } from "./systems";
import {
  selectCurrentCity,
  selectCurrentLocation,
  selectCurrentNpc,
  selectCurrentCityLocations,
  selectCurrentLocationNpcs,
  selectPlayer,
  selectAllCities,
  type CityView,
  type LocationView,
  type NpcView,
  type PlayerView,
} from "./views";

// ─────────────────────────────────────────────────────────────
// Store Actions
// ─────────────────────────────────────────────────────────────

type GameActions = {
  // Tick
  tick: (ticks?: number) => void;
  
  // Navigation
  enterLocation: (locationId: EntityId) => void;
  exitLocation: () => void;
  talkToNpc: (npcId: EntityId) => void;
  stopTalking: () => void;
  goToTravelScreen: () => void;
  
  // Player actions
  buyItem: (npcId: EntityId, itemId: string, quantity?: number) => void;
  sellItem: (npcId: EntityId, itemId: string, quantity?: number) => void;
  heal: (npcId: EntityId) => void;
  travel: (cityId: EntityId, fare?: number, travelTime?: number) => void;
};

export type GameStore = World & GameActions;

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
  ...generateWorld(),
  
  // Tick
  tick: (ticks: number = 1) => set(world => advanceTime(world, ticks)),
  
  // Navigation (moving within city costs time)
  enterLocation: (locationId) => set(world => {
    // No time cost if already at this location
    if (world.currentLocationId === locationId) {
      return {
        ...world,
        currentNpcId: null,
        screen: "location" as Screen,
      };
    }
    
    const next = advanceTime(world, 60);  // 1 hour to walk to location
    return {
      ...next,
      currentLocationId: locationId,
      currentNpcId: null,
      screen: "location" as Screen,
    };
  }),
  
  // Go back to city view (keeps current location)
  exitLocation: () => set({
    currentNpcId: null,
    screen: "city",
  }),
  
  talkToNpc: (npcId) => set({
    currentNpcId: npcId,
    screen: "npc",
  }),
  
  stopTalking: () => set(world => ({
    currentNpcId: null,
    screen: world.currentLocationId ? "location" : "city",
  })),
  
  goToTravelScreen: () => set({
    screen: "travel",
  }),
  
  // Player actions (each advances time)
  buyItem: (npcId, itemId, quantity = 1) => set(world => {
    let next = buyItem(world, npcId, itemId, quantity);
    next = advanceTime(next, 1);  // 1 minute
    return next;
  }),
  
  sellItem: (npcId, itemId, quantity = 1) => set(world => {
    let next = sellItem(world, npcId, itemId, quantity);
    next = advanceTime(next, 1);  // 1 minute
    return next;
  }),
  
  heal: (npcId) => set(world => {
    let next = healPlayer(world, npcId);
    next = advanceTime(next, 5);  // 5 minutes
    return next;
  }),
  
  travel: (cityId, fare = 0, travelTime = 7 * 1440) => set(world => {
    let next = travelToCity(world, cityId, fare);
    next = advanceTime(next, travelTime);
    return next;
  }),
}));

// ─────────────────────────────────────────────────────────────
// Selector Hooks (for React components)
// ─────────────────────────────────────────────────────────────

import { useMemo } from "react";

export const useScreen = (): Screen =>
  useGameStore(state => state.screen);

export const useGameTime = () => {
  const gameTick = useGameStore(state => state.gameTick);
  
  return useMemo(() => {
    const day = Math.floor(gameTick / 1440) + 1;  // 1440 mins/day
    const hour = Math.floor((gameTick % 1440) / 60);
    const minute = gameTick % 60;
    const hourStr = hour.toString().padStart(2, "0");
    const minStr = minute.toString().padStart(2, "0");
    return {
      day,
      hour,
      minute,
      display: `Day ${day}, ${hourStr}:${minStr}`,
    };
  }, [gameTick]);
};

export const useCurrentCity = (): CityView | null => {
  const cityId = useGameStore(state => state.currentCityId);
  const identity = useGameStore(state => state.identity[cityId]);
  const city = useGameStore(state => state.city[cityId]);
  
  return useMemo(() => {
    if (!identity || !city) return null;
    return {
      id: cityId,
      name: identity.name,
      description: identity.description ?? "",
      priceModifier: city.priceModifier,
    };
  }, [cityId, identity, city]);
};

export const useCurrentCityLocations = (): LocationView[] => {
  const cityId = useGameStore(state => state.currentCityId);
  const locations = useGameStore(state => state.location);
  const identities = useGameStore(state => state.identity);
  const positions = useGameStore(state => state.position);
  const players = useGameStore(state => state.player);
  
  return useMemo(() => {
    return Object.entries(locations)
      .filter(([_, loc]) => loc.cityId === cityId)
      .map(([id, loc]) => {
        const identity = identities[id];
        if (!identity) return null;
        
        // Count NPCs at this location
        const npcCount = Object.entries(positions)
          .filter(([eid, pos]) => 
            pos.locationId === id && 
            eid in identities &&
            !(eid in players)
          )
          .length;
        
        return {
          id,
          cityId: loc.cityId,
          name: identity.name,
          description: identity.description ?? "",
          locationType: loc.locationType,
          npcCount,
        };
      })
      .filter((l): l is LocationView => l !== null);
  }, [cityId, locations, identities, positions, players]);
};

export const useCurrentLocation = (): LocationView | null => {
  const locationId = useGameStore(state => state.currentLocationId);
  const location = useGameStore(state => locationId ? state.location[locationId] : null);
  const identity = useGameStore(state => locationId ? state.identity[locationId] : null);
  const positions = useGameStore(state => state.position);
  const identities = useGameStore(state => state.identity);
  const players = useGameStore(state => state.player);
  
  return useMemo(() => {
    if (!locationId || !location || !identity) return null;
    
    const npcCount = Object.entries(positions)
      .filter(([eid, pos]) => 
        pos.locationId === locationId && 
        eid in identities &&
        !(eid in players)
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
  }, [locationId, location, identity, positions, identities, players]);
};

export const useCurrentLocationNpcs = (): NpcView[] => {
  const locationId = useGameStore(state => state.currentLocationId);
  const positions = useGameStore(state => state.position);
  const identities = useGameStore(state => state.identity);
  const wallets = useGameStore(state => state.wallet);
  const inventories = useGameStore(state => state.inventory);
  const sellers = useGameStore(state => state.seller);
  const buyers = useGameStore(state => state.buyer);
  const doctors = useGameStore(state => state.doctor);
  const ticketClerks = useGameStore(state => state.ticketClerk);
  const players = useGameStore(state => state.player);
  
  return useMemo(() => {
    if (!locationId) return [];
    
    return Object.entries(positions)
      .filter(([id, pos]) => pos.locationId === locationId && !(id in players))
      .map(([id, pos]) => {
        const identity = identities[id];
        if (!identity) return null;
        
        return {
          id,
          name: identity.name,
          catchphrase: identity.catchphrase ?? "",
          locationId: pos.locationId,
          money: wallets[id]?.money ?? null,
          inventory: inventories[id]?.items ?? null,
          canSell: id in sellers,
          canBuy: id in buyers,
          canHeal: id in doctors,
          canSellTickets: id in ticketClerks,
        };
      })
      .filter((n): n is NpcView => n !== null);
  }, [locationId, positions, identities, wallets, inventories, sellers, buyers, doctors, ticketClerks, players]);
};

export const useCurrentNpc = (): NpcView | null => {
  const npcId = useGameStore(state => state.currentNpcId);
  const identity = useGameStore(state => npcId ? state.identity[npcId] : null);
  const position = useGameStore(state => npcId ? state.position[npcId] : null);
  const wallet = useGameStore(state => npcId ? state.wallet[npcId] : null);
  const inventory = useGameStore(state => npcId ? state.inventory[npcId] : null);
  const isSeller = useGameStore(state => npcId ? npcId in state.seller : false);
  const isBuyer = useGameStore(state => npcId ? npcId in state.buyer : false);
  const isDoctor = useGameStore(state => npcId ? npcId in state.doctor : false);
  const isTicketClerk = useGameStore(state => npcId ? npcId in state.ticketClerk : false);
  
  return useMemo(() => {
    if (!npcId || !identity || !position) return null;
    
    return {
      id: npcId,
      name: identity.name,
      catchphrase: identity.catchphrase ?? "",
      locationId: position.locationId,
      money: wallet?.money ?? null,
      inventory: inventory?.items ?? null,
      canSell: isSeller,
      canBuy: isBuyer,
      canHeal: isDoctor,
      canSellTickets: isTicketClerk,
    };
  }, [npcId, identity, position, wallet, inventory, isSeller, isBuyer, isDoctor, isTicketClerk]);
};

export const usePlayer = (): PlayerView | null => {
  const playerId = useGameStore(state => state.playerId);
  const player = useGameStore(state => state.player[playerId]);
  const wallet = useGameStore(state => state.wallet[playerId]);
  const inventory = useGameStore(state => state.inventory[playerId]);
  const position = useGameStore(state => state.position[playerId]);
  
  return useMemo(() => {
    if (!playerId || !player || !wallet || !inventory || !position) return null;
    
    return {
      id: playerId,
      money: wallet.money,
      health: player.health,
      maxHealth: player.maxHealth,
      inventory: inventory.items,
      cityId: position.cityId,
      locationId: position.locationId,
    };
  }, [playerId, player, wallet, inventory, position]);
};

export const useAllCities = (): CityView[] => {
  const cities = useGameStore(state => state.city);
  const identities = useGameStore(state => state.identity);
  
  return useMemo(() => {
    return Object.keys(cities)
      .map(id => {
        const identity = identities[id];
        const city = cities[id];
        if (!identity || !city) return null;
        
        return {
          id,
          name: identity.name,
          description: identity.description ?? "",
          priceModifier: city.priceModifier,
        };
      })
      .filter((c): c is CityView => c !== null);
  }, [cities, identities]);
};

// ─────────────────────────────────────────────────────────────
// Action Hooks (for React components)
// ─────────────────────────────────────────────────────────────

export const useNavigation = () => ({
  enterLocation: useGameStore(s => s.enterLocation),
  exitLocation: useGameStore(s => s.exitLocation),
  talkToNpc: useGameStore(s => s.talkToNpc),
  stopTalking: useGameStore(s => s.stopTalking),
  goToTravelScreen: useGameStore(s => s.goToTravelScreen),
  travel: useGameStore(s => s.travel),
});

export const useTradeActions = () => ({
  buyItem: useGameStore(s => s.buyItem),
  sellItem: useGameStore(s => s.sellItem),
});

export const useHealAction = () =>
  useGameStore(s => s.heal);
