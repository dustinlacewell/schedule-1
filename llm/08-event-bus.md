# Issue 8: No Event/Message Bus

## Problem

When player buys drugs, you might want to:
- Play a sound
- Show a toast
- Update NPC relationship
- Increase police heat
- Log to journal
- Trigger achievement

Currently `buyFromNpc()` would need to call all these directly. Every new side effect = edit the trade function.

## Solution: Event Bus

```ts
// events/types.ts
export type GameEvent =
  | { type: "trade"; buyer: string; seller: string; itemId: string; qty: number; price: number }
  | { type: "npc_moved"; npcId: string; from: string | null; to: string | null }
  | { type: "player_traveled"; from: string; to: string }
  | { type: "police_alert"; level: number; reason: string }
  | { type: "time_advanced"; tick: number; hour: number; day: number };
```

```ts
// events/bus.ts
type Listener<T> = (event: T) => void;

const listeners = new Map<string, Set<Listener<any>>>();

export const emit = <T extends GameEvent>(event: T) => {
  const set = listeners.get(event.type);
  if (set) {
    for (const listener of set) {
      listener(event);
    }
  }
};

export const on = <T extends GameEvent["type"]>(
  type: T,
  listener: Listener<Extract<GameEvent, { type: T }>>
) => {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type)!.add(listener);
  return () => listeners.get(type)!.delete(listener);
};
```

### Usage in Trade

```ts
// actions/trade.ts
export const buyFromNpc = () => {
  // ... existing logic ...
  
  emit({
    type: "trade",
    buyer: "player",
    seller: currentNpcId,
    itemId,
    qty: 1,
    price: npcEntry.price,
  });
};
```

### Listeners Subscribe Independently

```ts
// systems/audio.ts
on("trade", () => playSfx("cash_register"));

// systems/police.ts
on("trade", (e) => {
  if (isDrugItem(e.itemId)) increaseHeat(5);
});

// systems/npcMemory.ts
on("trade", (e) => {
  updateRelationship(e.seller, +1);
});
```

## Benefits

- Decoupled: trade logic doesn't know about audio, police, etc.
- Extensible: add listeners without editing emitters
- Debuggable: log all events in one place
- Replayable: record events for save/load or debugging

## Related
- [Issue 5: Game Loop](./05-game-loop.md) — Systems can listen to events
- [Issue 6: NPC Behavior](./06-npc-behavior.md) — NPCs react to events
