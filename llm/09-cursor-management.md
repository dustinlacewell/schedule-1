# Issue 9: Cursor Management is Fragile

## Problem

Cursors are keyed by panel name:

```ts
export type Cursors = {
  locations: number;
  npcs: number;
  playerInv: number;
  npcInv: number;
};
```

This doesn't scale for:
- Multiple inventory panels (crafting has input + output)
- Nested menus (settings > audio > volume slider)
- Dialog choice lists
- Dynamic lists (search results)

Adding a new panel = edit the Cursors type + uiStore + every place that resets cursors.

## Solution: Dynamic Cursor Registry

```ts
// store/uiStore.ts
export type UiState = {
  focusedPanel: string;  // No longer a union
  cursors: Record<string, number>;  // Dynamic keys
};

export type UiActions = {
  setCursor: (panel: string, value: number) => void;
  moveCursor: (panel: string, delta: number, maxLength: number) => void;
  resetCursor: (panel: string) => void;
  resetAllCursors: () => void;
};
```

### Screen Configs Declare Their Cursors

```ts
// ui/screens/registry.ts
export type ScreenConfig = {
  defaultPanel: string;
  panels: string[];  // All panels on this screen
  // ...
};

export const screenConfigs = {
  npcInteract: {
    defaultPanel: "npcInv",
    panels: ["playerInv", "npcInv"],
  },
  crafting: {
    defaultPanel: "recipes",
    panels: ["recipes", "ingredients", "output"],
  },
};
```

### Components Register Panels

For dynamic panels (e.g., dialog choices):

```tsx
const DialogChoices: React.FC<{ choices: string[] }> = ({ choices }) => {
  const panelId = "dialog-choices";
  const cursor = useUiStore((s) => s.cursors[panelId] ?? 0);
  
  useEffect(() => {
    // Reset cursor when choices change
    useUiStore.getState().setCursor(panelId, 0);
  }, [choices]);
  
  return <CursorList items={choices} selectedIndex={cursor} />;
};
```

## Benefits

- No type changes when adding panels
- Screens declare their own panel structure
- Dynamic panels (dialogs, search) work naturally
- Cursor state is self-cleaning (unused keys don't matter)

## Related
- [Issue 1: Cross-Store Coupling](./01-cross-store-coupling.md) — Screen configs include panel info
- [Issue 7: Screen Type Explosion](./07-screen-type-explosion.md) — Same registry pattern
