// ECS Module Exports

// Store and hooks (main interface for React)
export {
  useGameStore,
  useScreen,
  useGameTime,
  useCurrentCity,
  useCurrentLocation,
  useCurrentNpc,
  useCurrentCityLocations,
  useCurrentLocationNpcs,
  usePlayer,
  useAllCities,
  useNavigation,
  useTradeActions,
  useHealAction,
} from "./store";

// View types (for component props)
export type {
  CityView,
  LocationView,
  NpcView,
  PlayerView,
} from "./views";

// World types (rarely needed directly)
export type { World, Screen } from "./world";

// Component types (for advanced use)
export type {
  EntityId,
  InventoryEntry,
  LocationType,
} from "./components";

// Item helpers
export { getItemName, getItemCategory, getItemBasePrice } from "./worldgen";
