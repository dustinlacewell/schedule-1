# Issue 7: Screen Type Will Explode

## Problem

```ts
export type Screen = "city" | "location" | "npcList" | "npcInteract" | "travel";
```

When you add inventory, crafting, phone, map, journal, settings, shop, bank, hideout, police station, hospital... this union becomes unmanageable.

Worse: `back()` logic, focus rings, and key handlers all have switch statements on screen type.

## Solution: Hierarchical Screens

### Option A: Tagged Union

```ts
type Screen = 
  | { type: "world"; sub: "city" | "location" | "npcList" | "npcInteract" }
  | { type: "menu"; sub: "inventory" | "crafting" | "settings" }
  | { type: "overlay"; sub: "dialog" | "confirm" | "toast" }
  | { type: "travel" };
```

### Option B: Screen Stack

For modals/overlays that need to return to previous screen:

```ts
type NavigationState = {
  screenStack: Screen[];  // Push/pop for modals
  // ...
};

const pushScreen = (screen: Screen) => {
  set((s) => ({ screenStack: [...s.screenStack, screen] }));
};

const popScreen = () => {
  set((s) => ({ screenStack: s.screenStack.slice(0, -1) }));
};

const currentScreen = () => screenStack[screenStack.length - 1];
```

### Option C: Screen Registry (Recommended)

Combine with Issue 1's solution:

```ts
// ui/screens/registry.ts
export const screenConfigs: Record<string, ScreenConfig> = {
  "world:city": { ... },
  "world:npcList": { ... },
  "menu:inventory": { ... },
  "overlay:confirm": { capturesInput: true, ... },
};
```

New screens just add entries to the registry. No switch statements to update.

## Benefits

- Adding screens is declarative
- Back navigation is automatic (pop stack or use config)
- Overlays/modals work naturally
- Type safety maintained via registry keys

## Related
- [Issue 1: Cross-Store Coupling](./01-cross-store-coupling.md) — Screen configs solve both
