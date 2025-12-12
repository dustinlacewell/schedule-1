# Issue 5: No Game Loop / Tick System

## The Problem

The game currently has no concept of time passing. Everything is reactive to player input only. There's no infrastructure for:

- NPCs moving between locations on their own
- Prices fluctuating over time
- Police heat decaying or escalating
- Day/night cycles
- Random events
- NPC schedules (e.g., "Doc is only at the pharmacy during the day")
- Restocking of NPC inventories

## Why This is a Problem

### 1. Static World
Without time, the world feels dead. NPCs stand in place forever. Prices never change. There's no urgency.

### 2. No Foundation for Core Mechanics
Drug trading games typically have:
- Price volatility (buy low, sell high in different cities)
- Time pressure (police closing in, debts coming due)
- NPC behavior patterns

None of these can exist without a tick system.

### 3. Bolting It On Later is Painful
If you add time-based features ad-hoc, you'll end up with:
- Multiple `setInterval` calls scattered across components
- Race conditions between different timers
- No way to pause/resume consistently
- No way to save/load game state at a point in time

## The Solution: Centralized Tick System

### Conceptual Model

```
┌─────────────────────────────────────────────────────────┐
│                      Tick Store                          │
│  - tick: number (current game tick)                     │
│  - paused: boolean                                       │
│  - speed: number (ticks per real second)                │
│  - advance(): void                                       │
└─────────────────────────────────────────────────────────┘
                            │
                            │ on tick change
                            ▼
┌─────────────────────────────────────────────────────────┐
│                       Systems                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ NPC AI   │  │ Economy  │  │  Police  │  │  Time   │ │
│  │ System   │  │  System  │  │  System  │  │ System  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            │ state changes
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Other Stores                          │
│  worldStore, playerStore, etc.                          │
└─────────────────────────────────────────────────────────┘
```

### Step 1: Create the Tick Store

```ts
// store/tickStore.ts
import { create } from "zustand";

export type TickState = {
  /** Current game tick (monotonically increasing) */
  tick: number;
  /** Whether the game is paused */
  paused: boolean;
  /** Game speed multiplier (1 = normal, 2 = fast, 0.5 = slow) */
  speed: number;
  /** Real-world timestamp of last tick (for delta calculations) */
  lastTickTime: number;
};

export type TickActions = {
  /** Advance the game by one tick */
  advance: () => void;
  /** Pause the game */
  pause: () => void;
  /** Resume the game */
  resume: () => void;
  /** Set game speed */
  setSpeed: (speed: number) => void;
  /** Reset tick counter (for new game) */
  reset: () => void;
};

export type TickStore = TickState & TickActions;

export const useTickStore = create<TickStore>((set, get) => ({
  tick: 0,
  paused: true,  // Start paused until game begins
  speed: 1,
  lastTickTime: Date.now(),

  advance: () => {
    const { paused } = get();
    if (paused) return;
    
    set((state) => ({
      tick: state.tick + 1,
      lastTickTime: Date.now(),
    }));
  },

  pause: () => set({ paused: true }),
  
  resume: () => set({ paused: false, lastTickTime: Date.now() }),
  
  setSpeed: (speed) => set({ speed: Math.max(0.1, Math.min(10, speed)) }),
  
  reset: () => set({ tick: 0, paused: true, lastTickTime: Date.now() }),
}));

// Selectors for game time
export const TICKS_PER_HOUR = 60;
export const TICKS_PER_DAY = TICKS_PER_HOUR * 24;

export const selectGameHour = (tick: number) => Math.floor(tick / TICKS_PER_HOUR) % 24;
export const selectGameDay = (tick: number) => Math.floor(tick / TICKS_PER_DAY);
export const selectTimeOfDay = (tick: number): "morning" | "afternoon" | "evening" | "night" => {
  const hour = selectGameHour(tick);
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
};
```

### Step 2: Create the Tick Runner

The tick runner is responsible for advancing time. It's separate from the store so you can control when/how ticks happen.

```ts
// systems/tickRunner.ts
import { useTickStore } from "../store/tickStore";

const BASE_TICK_INTERVAL_MS = 1000; // 1 tick per second at speed 1

let intervalId: number | null = null;

export const startTickRunner = () => {
  if (intervalId !== null) return; // Already running
  
  const runTick = () => {
    const { paused, speed, advance } = useTickStore.getState();
    if (!paused) {
      advance();
    }
  };
  
  // Use a fixed interval, speed affects how many ticks per interval
  intervalId = window.setInterval(() => {
    const { speed } = useTickStore.getState();
    // At speed 2, we might want 2 ticks per interval
    // For simplicity, just adjust interval dynamically
    runTick();
  }, BASE_TICK_INTERVAL_MS);
};

export const stopTickRunner = () => {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// Alternative: Variable speed tick runner
export const startVariableTickRunner = () => {
  if (intervalId !== null) return;
  
  let lastTime = Date.now();
  let accumulator = 0;
  
  const frame = () => {
    const { paused, speed, advance } = useTickStore.getState();
    const now = Date.now();
    const delta = now - lastTime;
    lastTime = now;
    
    if (!paused) {
      accumulator += delta * speed;
      
      while (accumulator >= BASE_TICK_INTERVAL_MS) {
        advance();
        accumulator -= BASE_TICK_INTERVAL_MS;
      }
    }
    
    intervalId = window.requestAnimationFrame(frame) as unknown as number;
  };
  
  intervalId = window.requestAnimationFrame(frame) as unknown as number;
};
```

### Step 3: Create System Infrastructure

Systems are functions that run on each tick and update game state.

```ts
// systems/types.ts
export type System = {
  /** Unique identifier for the system */
  id: string;
  /** How often this system runs (1 = every tick, 10 = every 10 ticks) */
  interval: number;
  /** The system's update function */
  update: (tick: number) => void;
  /** Optional: only run when game is in certain states */
  enabled?: () => boolean;
};
```

```ts
// systems/registry.ts
import type { System } from "./types";
import { useTickStore } from "../store/tickStore";

const systems: System[] = [];

export const registerSystem = (system: System) => {
  systems.push(system);
};

export const unregisterSystem = (id: string) => {
  const idx = systems.findIndex((s) => s.id === id);
  if (idx >= 0) systems.splice(idx, 1);
};

/** Called by tick store subscription */
export const runSystems = (tick: number) => {
  for (const system of systems) {
    // Check interval
    if (tick % system.interval !== 0) continue;
    
    // Check enabled
    if (system.enabled && !system.enabled()) continue;
    
    // Run the system
    try {
      system.update(tick);
    } catch (error) {
      console.error(`System ${system.id} error:`, error);
    }
  }
};

// Subscribe to tick changes
useTickStore.subscribe(
  (state) => state.tick,
  (tick) => runSystems(tick)
);
```

### Step 4: Example Systems

```ts
// systems/npcBehavior.ts
import type { System } from "./types";
import { useWorldStore } from "../store/worldStore";
import { getNpcTemplate } from "../data/npcs";

/**
 * NPC Behavior System
 * - Moves NPCs between locations periodically
 * - Could be expanded with schedules, goals, etc.
 */
export const npcBehaviorSystem: System = {
  id: "npc-behavior",
  interval: 60, // Run every 60 ticks (1 game hour)
  
  update: (tick) => {
    const { npcs, locations, moveNpc } = useWorldStore.getState();
    
    for (const npcId in npcs) {
      const npc = npcs[npcId];
      if (!npc.locationId) continue;
      
      // 10% chance to move each hour
      if (Math.random() > 0.1) continue;
      
      // Find a random location in the same city
      const currentLoc = locations[npc.locationId];
      if (!currentLoc) continue;
      
      const cityLocations = Object.values(locations)
        .filter((loc) => loc.cityId === currentLoc.cityId && loc.id !== npc.locationId);
      
      if (cityLocations.length === 0) continue;
      
      const newLoc = cityLocations[Math.floor(Math.random() * cityLocations.length)];
      moveNpc(npcId, newLoc.id);
    }
  },
};
```

```ts
// systems/economy.ts
import type { System } from "./types";
import { useWorldStore } from "../store/worldStore";
import { getItemTemplate } from "../data/items";

/**
 * Economy System
 * - Fluctuates prices over time
 * - Restocks NPC inventories
 */
export const economySystem: System = {
  id: "economy",
  interval: 120, // Run every 2 game hours
  
  update: (tick) => {
    const { npcs, updateNpcInventory } = useWorldStore.getState();
    
    for (const npcId in npcs) {
      const npc = npcs[npcId];
      const newInventory = { ...npc.inventory };
      
      for (const itemId in newInventory) {
        const entry = newInventory[itemId];
        const template = getItemTemplate(itemId);
        if (!template) continue;
        
        // Price fluctuation: ±5%
        const fluctuation = 1 + (Math.random() - 0.5) * 0.1;
        const newPrice = Math.round(entry.price * fluctuation);
        
        // Clamp to reasonable bounds (50% - 200% of base)
        const minPrice = Math.round(template.basePrice * 0.5);
        const maxPrice = Math.round(template.basePrice * 2);
        
        newInventory[itemId] = {
          ...entry,
          price: Math.max(minPrice, Math.min(maxPrice, newPrice)),
        };
      }
      
      updateNpcInventory(npcId, newInventory);
    }
  },
};
```

```ts
// systems/index.ts
import { registerSystem } from "./registry";
import { npcBehaviorSystem } from "./npcBehavior";
import { economySystem } from "./economy";

export const initializeSystems = () => {
  registerSystem(npcBehaviorSystem);
  registerSystem(economySystem);
  // Register more systems here
};
```

### Step 5: Initialize in App

```tsx
// main.tsx
import { initializeSystems } from "./systems";
import { startTickRunner } from "./systems/tickRunner";

// Initialize systems before rendering
initializeSystems();

// Start the tick runner
startTickRunner();

// Then render the app
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 6: Display Game Time in UI

```tsx
// ui/components/GameClock.tsx
import React from "react";
import { useTickStore, selectGameHour, selectGameDay, selectTimeOfDay } from "../../store/tickStore";

export const GameClock: React.FC = () => {
  const tick = useTickStore((s) => s.tick);
  const paused = useTickStore((s) => s.paused);
  
  const hour = selectGameHour(tick);
  const day = selectGameDay(tick);
  const timeOfDay = selectTimeOfDay(tick);
  
  const hourStr = hour.toString().padStart(2, "0");
  
  return (
    <div className="text-xs">
      <span>Day {day + 1}</span>
      <span className="mx-2">{hourStr}:00</span>
      <span className="text-gray-500">({timeOfDay})</span>
      {paused && <span className="ml-2 text-yellow-400">[PAUSED]</span>}
    </div>
  );
};
```

## Advanced: Deterministic Ticks for Save/Load

For save/load to work correctly, you need deterministic behavior:

```ts
// systems/tickRunner.ts

// Seeded random number generator
let rngSeed = 12345;

export const setRngSeed = (seed: number) => {
  rngSeed = seed;
};

export const seededRandom = () => {
  // Simple LCG
  rngSeed = (rngSeed * 1103515245 + 12345) & 0x7fffffff;
  return rngSeed / 0x7fffffff;
};

// Use seededRandom() instead of Math.random() in systems
```

## Benefits

1. **Centralized time management** — One place controls game time
2. **Pausable** — Pause menu, dialogs, etc. can pause time
3. **Saveable** — Just save the tick number and RNG seed
4. **Extensible** — Add new systems without touching existing code
5. **Testable** — Run systems with specific tick values
6. **Speed control** — Fast-forward, slow-mo for debugging

## Migration Steps

1. Create `store/tickStore.ts`
2. Create `systems/` directory with types and registry
3. Create initial systems (npcBehavior, economy)
4. Create `systems/tickRunner.ts`
5. Initialize in `main.tsx`
6. Add `GameClock` component to HUD
7. Add pause/resume to input handling

## Related Issues
- [Issue 6: NPC Behavior Has No Home](./06-npc-behavior.md) — Systems are where NPC AI lives
- [Issue 8: No Event Bus](./08-event-bus.md) — Systems can emit events
- [Issue 10: World Initialization](./10-world-initialization.md) — Tick system needs seeded RNG
