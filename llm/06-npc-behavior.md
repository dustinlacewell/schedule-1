# Issue 6: NPC Behavior Has No Home

## Problem

NPCs are static data bags. The only NPC logic is `moveNpc()` and `updateNpcInventory()` in worldStore, but nothing drives them. No schedules, reactions, goals, relationships, or memory.

When you add AI, where does it go? Stores should hold state, not logic. Components should render, not simulate.

## Solution: Systems Directory

Create `src/systems/` for game logic that runs on ticks:

```
src/systems/
  npcBehavior.ts   # Movement, schedules, decisions
  npcMemory.ts     # Relationship tracking
  economy.ts       # Price fluctuation
```

### Extend NPC Instance

```ts
// types/entities.ts
export type NpcBehaviorState = {
  currentActivity: string;
  playerStanding: number;  // -100 to +100
  tradeCount: number;
  lastInteractionTick: number | null;
};

export type NpcInstance = {
  id: string;
  templateId: NpcTemplateId;
  locationId: string | null;
  inventory: Inventory;
  behavior: NpcBehaviorState;  // NEW
};
```

### Extend NPC Template

```ts
// data/npcs.ts
export type NpcPersonality = {
  wanderlust: number;      // 0-1, likelihood to move
  volatility: number;      // 0-1, price mood swings
  activeHours: { start: number; end: number };
};

export type NpcTemplate = {
  id: NpcTemplateId;
  name: string;
  likes: ItemId[];
  hates: ItemId[];
  catchphrase: string;
  personality: NpcPersonality;  // NEW
};
```

### NPC Behavior System

```ts
// systems/npcBehavior.ts
import type { System } from "./types";
import { useWorldStore } from "../store/worldStore";
import { selectGameHour } from "../store/tickStore";

export const npcBehaviorSystem: System = {
  id: "npc-behavior",
  interval: 60,  // Every game hour
  
  update: (tick) => {
    const { npcs, locations, moveNpc } = useWorldStore.getState();
    const hour = selectGameHour(tick);
    
    for (const npcId in npcs) {
      const npc = npcs[npcId];
      // Movement logic, schedule checks, etc.
    }
  },
};
```

## Benefits

- Clear separation: templates (static) vs instances (runtime) vs systems (logic)
- Testable: call system.update(tick) directly
- Extensible: add new behaviors without touching stores

## Related
- [Issue 5: Game Loop](./05-game-loop.md) — Systems need ticks to run
- [Issue 8: Event Bus](./08-event-bus.md) — NPCs can react to events
