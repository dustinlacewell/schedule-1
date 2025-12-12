# Issue 4: Duplicate Type Definitions

## The Problem

The same types are defined in multiple files:

**In `worldStore.ts`:**
```ts
export type InventoryEntry = { quantity: number; price: number };
export type Inventory = Record<ItemId, InventoryEntry>;
```

**In `playerStore.ts`:**
```ts
export type InventoryEntry = { quantity: number; price: number };
export type Inventory = Record<ItemId, InventoryEntry>;
```

**In `gameStore.ts` (the dead code):**
```ts
export type InventoryEntry = { quantity: number; price: number };
export type Inventory = Record<ItemId, InventoryEntry>;
```

## Why This is a Problem

### 1. Divergence Risk
If you update `InventoryEntry` in one file but not the other, you'll have subtle type mismatches. TypeScript might not catch it if the structures are still compatible.

### 2. Import Confusion
When importing `Inventory`, which file do you import from?
```ts
import { Inventory } from "../store/worldStore";
// or
import { Inventory } from "../store/playerStore";
```

Both work, but it's arbitrary and inconsistent.

### 3. Refactoring Difficulty
If you need to add a field to `InventoryEntry` (e.g., `acquiredAt: number` for tracking when items were bought), you need to update multiple files.

### 4. Documentation Fragmentation
Where do you document what `InventoryEntry` means? In both files? Neither?

## Current Type Landscape

Let's audit all the types and where they live:

| Type | Defined In | Used By |
|------|-----------|---------|
| `InventoryEntry` | worldStore, playerStore, gameStore | Trading, display |
| `Inventory` | worldStore, playerStore, gameStore | NPCs, Player |
| `NpcInstance` | worldStore, gameStore | World state |
| `LocationInstance` | worldStore, gameStore | World state |
| `CityInstance` | worldStore, gameStore | World state |
| `Screen` | navigationStore, gameStore | Navigation |
| `FocusedPanel` | uiStore, gameStore | UI state |
| `Cursors` | uiStore, gameStore | UI state |
| `ItemId` | items.ts | Everywhere |
| `NpcTemplateId` | npcs.ts | NPCs |
| `LocationId` | locations.ts | Locations |
| `CityTemplateId` | cities.ts | Cities |

## The Solution: Centralized Type Definitions

### Step 1: Create a Types Directory

```
src/
  types/
    index.ts        # Re-exports everything
    inventory.ts    # Inventory-related types
    entities.ts     # Instance types (NPC, Location, City)
    ui.ts           # UI state types
    navigation.ts   # Navigation types
```

### Step 2: Define Shared Types

```ts
// types/inventory.ts
import type { ItemId } from "../data/items";

/**
 * A single entry in an inventory, tracking quantity and price.
 * Price represents the last transaction price for this item.
 */
export type InventoryEntry = {
  quantity: number;
  /** Price per unit at time of acquisition/last trade */
  price: number;
};

/**
 * An inventory is a mapping from item IDs to their entries.
 * Empty slots are simply absent from the record.
 */
export type Inventory = Record<ItemId, InventoryEntry>;
```

```ts
// types/entities.ts
import type { NpcTemplateId } from "../data/npcs";
import type { LocationId } from "../data/locations";
import type { CityTemplateId } from "../data/cities";
import type { Inventory } from "./inventory";

/**
 * Runtime instance of an NPC in the game world.
 * References a template for static data.
 */
export type NpcInstance = {
  /** Unique runtime ID */
  id: string;
  /** Reference to the NPC template */
  templateId: NpcTemplateId;
  /** Current location (null if not at any location) */
  locationId: string | null;
  /** NPC's current inventory */
  inventory: Inventory;
};

/**
 * Runtime instance of a location in a city.
 */
export type LocationInstance = {
  id: string;
  templateId: LocationId;
  cityId: string;
  /** IDs of NPCs currently at this location */
  npcIds: string[];
};

/**
 * Runtime instance of a city in the game world.
 */
export type CityInstance = {
  id: string;
  templateId: CityTemplateId;
  /** IDs of locations in this city */
  locationIds: string[];
};
```

```ts
// types/ui.ts

/**
 * Panels that can receive keyboard focus.
 * Each panel typically has its own cursor.
 */
export type FocusedPanel = "locations" | "npcs" | "playerInv" | "npcInv";

/**
 * Cursor positions for each focusable panel.
 * Cursors are 0-indexed into the panel's list.
 */
export type Cursors = {
  locations: number;
  npcs: number;
  playerInv: number;
  npcInv: number;
};
```

```ts
// types/navigation.ts

/**
 * All possible screens in the game.
 * Each screen represents a distinct UI state.
 */
export type Screen = "city" | "location" | "npcList" | "npcInteract" | "travel";
```

```ts
// types/index.ts
export * from "./inventory";
export * from "./entities";
export * from "./ui";
export * from "./navigation";
```

### Step 3: Update Stores to Import Types

```ts
// store/worldStore.ts
import { create } from "zustand";
import type { NpcInstance, LocationInstance, CityInstance, Inventory } from "../types";
// ... rest of imports

export type WorldState = {
  cities: Record<string, CityInstance>;
  locations: Record<string, LocationInstance>;
  npcs: Record<string, NpcInstance>;
};

// Remove local type definitions
```

```ts
// store/playerStore.ts
import { create } from "zustand";
import type { Inventory, InventoryEntry } from "../types";
import type { ItemId } from "../data/items";

export type PlayerState = {
  money: number;
  health: number;
  inventory: Inventory;
};

// Remove local type definitions
```

```ts
// store/uiStore.ts
import { create } from "zustand";
import type { FocusedPanel, Cursors } from "../types";

// Remove local type definitions
```

```ts
// store/navigationStore.ts
import { create } from "zustand";
import type { Screen } from "../types";

// Remove local type definitions
```

### Step 4: Update store/index.ts

```ts
// store/index.ts

// Re-export stores
export { useWorldStore } from "./worldStore";
export { usePlayerStore } from "./playerStore";
export { useNavigationStore } from "./navigationStore";
export { useUiStore } from "./uiStore";
export { buyFromNpc, sellToNpc } from "./tradeStore";

// Re-export types from central location
export type {
  Inventory,
  InventoryEntry,
  NpcInstance,
  LocationInstance,
  CityInstance,
  FocusedPanel,
  Cursors,
  Screen,
} from "../types";

// Re-export store-specific types
export type { WorldStore, WorldState, WorldActions } from "./worldStore";
export type { PlayerStore, PlayerState, PlayerActions } from "./playerStore";
export type { NavigationStore, NavigationState, NavigationActions } from "./navigationStore";
export type { UiStore, UiState, UiActions } from "./uiStore";
```

## Naming Conventions

Establish clear conventions for type names:

| Pattern | Meaning | Example |
|---------|---------|---------|
| `*Template` | Static data definition | `NpcTemplate`, `CityTemplate` |
| `*Instance` | Runtime instance | `NpcInstance`, `CityInstance` |
| `*State` | Zustand store state | `PlayerState`, `WorldState` |
| `*Actions` | Zustand store actions | `PlayerActions`, `WorldActions` |
| `*Store` | Combined state + actions | `PlayerStore`, `WorldStore` |
| `*Id` | String identifier type | `ItemId`, `LocationId` |

## Where Types Should Live

| Type Category | Location | Rationale |
|--------------|----------|-----------|
| Template types | `data/*.ts` | Co-located with template data |
| Instance types | `types/entities.ts` | Shared across stores |
| Store state/actions | `store/*.ts` | Specific to that store |
| Shared primitives | `types/*.ts` | Used by multiple modules |
| UI component props | Component file | Specific to that component |

## Migration Steps

1. Create `src/types/` directory
2. Create type files with proper documentation
3. Update each store to import from `types/`
4. Remove duplicate type definitions from stores
5. Update `store/index.ts` to re-export from `types/`
6. Search codebase for any imports of the old type locations
7. Delete `gameStore.ts` (see Issue 3)

## Verification

```bash
# Check for duplicate type definitions
grep -r "export type InventoryEntry" src/
# Should only show types/inventory.ts

# Check for duplicate type definitions
grep -r "export type Inventory =" src/
# Should only show types/inventory.ts
```

## Related Issues
- [Issue 3: Dead Code](./03-dead-code.md) — gameStore.ts has duplicate types
- [Issue 5: No Game Loop](./05-game-loop.md) — New tick-related types will go in `types/`
