# Issue 2: Keyboard Handling is Scattered & Imperative

## The Problem

Every screen component has its own `useKeys` callback with duplicated logic:

```tsx
// CityScreen.tsx
useKeys(useCallback((e: KeyboardEvent) => {
  const { setScreen, enterLocation } = useNavigationStore.getState();
  const { moveCursor } = useUiStore.getState();
  const city = useWorldStore.getState().cities[currentCityId];

  if (e.key === "ArrowUp") moveCursor("locations", -1, locationCount);
  else if (e.key === "ArrowDown") moveCursor("locations", 1, locationCount);
  else if (e.key === "Enter") {
    const locId = city?.locationIds[useUiStore.getState().cursors.locations];
    if (locId) enterLocation(locId);
  } else if (e.key === "g") setScreen("travel");
}, [currentCityId, locationCount]));
```

```tsx
// NpcInteractScreen.tsx
useKeys(useCallback((e: KeyboardEvent) => {
  const { back } = useNavigationStore.getState();
  const { moveCursor, cycleFocus, focusedPanel } = useUiStore.getState();
  // ... similar pattern with different keys/actions
  if (e.key === "Tab") cycleFocus(["playerInv", "npcInv"], e.shiftKey ? -1 : 1);
  else if (e.key === "ArrowUp") moveCursor(focusedPanel, -1, /* ... */);
  // ...
}, [/* deps */]));
```

## Why This is a Problem

### 1. Duplicated Navigation Logic
Every screen reimplements:
- `ArrowUp` → move cursor up
- `ArrowDown` → move cursor down
- `Tab` → cycle focus (where applicable)
- `q` → go back

### 2. Hardcoded Key Bindings
Keys are scattered across files as string literals. To change "q" to "Escape" for back, you'd need to edit every screen.

### 3. No Key Binding Customization
Players can't remap keys. Accessibility is limited.

### 4. No Input Priority/Layering
What happens when you add:
- A modal dialog that should capture all input?
- A text input field?
- A confirmation popup?
- A pause menu?

Currently, the screen's `useKeys` would still fire. You'd need to add `if (modalOpen) return;` checks everywhere.

### 5. Difficult to Add Global Shortcuts
Where do you put "press P to pause" or "press I for inventory"? In every screen? In `App.tsx`?

### 6. Testing is Painful
To test keyboard behavior, you need to render the full screen component and simulate DOM events.

## The Solution: Input Layer Architecture

### Conceptual Model

```
┌─────────────────────────────────────────────────────────┐
│                    Raw Keyboard Event                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      Input Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Keymap    │→ │   Action    │→ │ Action Handlers │  │
│  │ (key→action)│  │  Resolver   │  │  (per context)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Game State Changes                    │
└─────────────────────────────────────────────────────────┘
```

### Step 1: Define Actions (Not Keys)

```ts
// input/actions.ts

/** All possible input actions in the game */
export type InputAction =
  // Navigation
  | "cursor_up"
  | "cursor_down"
  | "cursor_left"
  | "cursor_right"
  | "confirm"
  | "cancel"
  | "back"
  | "cycle_focus_next"
  | "cycle_focus_prev"
  // Screen-specific
  | "travel"
  | "buy"
  | "sell"
  // Global
  | "pause"
  | "inventory"
  | "help";
```

### Step 2: Create a Keymap

```ts
// input/keymap.ts
import type { InputAction } from "./actions";

export type Keymap = Record<string, InputAction>;

export const defaultKeymap: Keymap = {
  // Cursor movement
  ArrowUp: "cursor_up",
  ArrowDown: "cursor_down",
  ArrowLeft: "cursor_left",
  ArrowRight: "cursor_right",
  w: "cursor_up",
  s: "cursor_down",
  a: "cursor_left",
  d: "cursor_right",
  
  // Confirmation/cancellation
  Enter: "confirm",
  " ": "confirm",  // Space
  Escape: "cancel",
  q: "back",
  
  // Focus
  Tab: "cycle_focus_next",
  "Shift+Tab": "cycle_focus_prev",
  
  // Screen shortcuts
  g: "travel",
  i: "inventory",
  p: "pause",
  "?": "help",
};

// For key combinations
export const parseKeyEvent = (e: KeyboardEvent): string => {
  const parts: string[] = [];
  if (e.shiftKey && e.key !== "Shift") parts.push("Shift");
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.altKey) parts.push("Alt");
  parts.push(e.key);
  return parts.join("+");
};
```

### Step 3: Define Action Handlers Per Context

```ts
// input/handlers/types.ts
import type { InputAction } from "../actions";

export type ActionHandler = () => void | boolean;
export type ActionHandlerMap = Partial<Record<InputAction, ActionHandler>>;
```

```ts
// input/handlers/global.ts
import type { ActionHandlerMap } from "./types";
import { useNavigationStore } from "../../store/navigationStore";

/** Handlers that work on any screen */
export const globalHandlers: ActionHandlerMap = {
  back: () => {
    // Use the goBack helper from issue 1
    return goBack();
  },
  pause: () => {
    // Toggle pause state
  },
  inventory: () => {
    useNavigationStore.getState().setScreen("inventory");
  },
};
```

```ts
// input/handlers/cityScreen.ts
import type { ActionHandlerMap } from "./types";
import { useNavigationStore } from "../../store/navigationStore";
import { useUiStore } from "../../store/uiStore";
import { useWorldStore } from "../../store/worldStore";

export const createCityHandlers = (): ActionHandlerMap => ({
  cursor_up: () => {
    const { currentCityId } = useNavigationStore.getState();
    const city = useWorldStore.getState().cities[currentCityId];
    useUiStore.getState().moveCursor("locations", -1, city?.locationIds.length ?? 0);
  },
  
  cursor_down: () => {
    const { currentCityId } = useNavigationStore.getState();
    const city = useWorldStore.getState().cities[currentCityId];
    useUiStore.getState().moveCursor("locations", 1, city?.locationIds.length ?? 0);
  },
  
  confirm: () => {
    const { currentCityId, enterLocation } = useNavigationStore.getState();
    const city = useWorldStore.getState().cities[currentCityId];
    const cursor = useUiStore.getState().cursors.locations;
    const locId = city?.locationIds[cursor];
    if (locId) enterLocation(locId);
  },
  
  travel: () => {
    useNavigationStore.getState().setScreen("travel");
  },
});
```

### Step 4: Create the Input Dispatcher

```ts
// input/dispatcher.ts
import { useEffect } from "react";
import type { Screen } from "../store/navigationStore";
import { useNavigationStore } from "../store/navigationStore";
import { defaultKeymap, parseKeyEvent } from "./keymap";
import { globalHandlers } from "./handlers/global";
import { createCityHandlers } from "./handlers/cityScreen";
import { createNpcInteractHandlers } from "./handlers/npcInteractScreen";
// ... other screen handlers

const NAV_KEYS = new Set(["Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "]);

/** Get handlers for the current screen */
const getScreenHandlers = (screen: Screen) => {
  switch (screen) {
    case "city": return createCityHandlers();
    case "npcInteract": return createNpcInteractHandlers();
    case "travel": return createTravelHandlers();
    case "npcList": return createNpcListHandlers();
    default: return {};
  }
};

/** Main input dispatcher - call once at app root */
export const useInputDispatcher = () => {
  const screen = useNavigationStore((s) => s.screen);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Parse the key event to a keymap key
      const keyCombo = parseKeyEvent(e);
      const action = defaultKeymap[keyCombo];
      
      if (!action) return;
      
      // Prevent default for navigation keys
      if (NAV_KEYS.has(e.key)) {
        e.preventDefault();
      }
      
      // Try screen-specific handler first
      const screenHandlers = getScreenHandlers(screen);
      const screenHandler = screenHandlers[action];
      if (screenHandler) {
        const handled = screenHandler();
        if (handled !== false) return;
      }
      
      // Fall back to global handler
      const globalHandler = globalHandlers[action];
      if (globalHandler) {
        globalHandler();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screen]);
};
```

### Step 5: Use in App Root

```tsx
// ui/App.tsx
import { useInputDispatcher } from "../input/dispatcher";
import { Terminal } from "./Terminal";

export const App: React.FC = () => {
  useInputDispatcher();
  
  return (
    <div className="h-screen w-screen bg-black text-green-200 flex items-center justify-center font-mono">
      <Terminal />
    </div>
  );
};
```

### Step 6: Remove useKeys from Screen Components

Screen components become purely presentational:

```tsx
// screens/CityScreen.tsx
export const CityScreen: React.FC = () => {
  const currentCityId = useNavigationStore((s) => s.currentCityId);
  const cities = useWorldStore((s) => s.cities);
  const locations = useWorldStore((s) => s.locations);
  const focusedPanel = useUiStore((s) => s.focusedPanel);
  const cursor = useUiStore((s) => s.cursors.locations);

  // ... just rendering, no useKeys!
  
  return (
    <div className="flex flex-col h-full gap-1">
      {/* ... */}
    </div>
  );
};
```

## Advanced: Input Layers for Modals

When you need modals/dialogs to capture input:

```ts
// input/layers.ts
type InputLayer = {
  id: string;
  handlers: ActionHandlerMap;
  capturesAll?: boolean;  // If true, don't fall through to lower layers
};

const inputLayers: InputLayer[] = [];

export const pushInputLayer = (layer: InputLayer) => {
  inputLayers.push(layer);
};

export const popInputLayer = (id: string) => {
  const idx = inputLayers.findIndex(l => l.id === id);
  if (idx >= 0) inputLayers.splice(idx, 1);
};

export const getActiveHandlers = (screen: Screen): ActionHandlerMap => {
  // Check layers from top to bottom
  for (let i = inputLayers.length - 1; i >= 0; i--) {
    const layer = inputLayers[i];
    if (layer.capturesAll) {
      return layer.handlers;
    }
  }
  // No capturing layer, return screen handlers merged with global
  return { ...globalHandlers, ...getScreenHandlers(screen) };
};
```

Usage for a confirmation dialog:

```tsx
const ConfirmDialog: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => {
  useEffect(() => {
    pushInputLayer({
      id: "confirm-dialog",
      capturesAll: true,
      handlers: {
        confirm: () => { onConfirm(); popInputLayer("confirm-dialog"); },
        cancel: () => { onCancel(); popInputLayer("confirm-dialog"); },
        back: () => { onCancel(); popInputLayer("confirm-dialog"); },
      },
    });
    return () => popInputLayer("confirm-dialog");
  }, [onConfirm, onCancel]);
  
  return <div>Are you sure? [Enter] Yes / [Esc] No</div>;
};
```

## Benefits

1. **Single source of truth for key bindings** — Change once in keymap, affects everywhere
2. **Actions are testable** — Test handlers directly without DOM events
3. **Easy to add global shortcuts** — Just add to `globalHandlers`
4. **Modal/dialog support** — Input layers handle priority
5. **Player customization ready** — Swap `defaultKeymap` with user preferences
6. **Screen components are simpler** — Pure rendering, no input logic

## Migration Path

1. Create `input/actions.ts` with action types
2. Create `input/keymap.ts` with default bindings
3. Create `input/handlers/` with handlers for each screen
4. Create `input/dispatcher.ts`
5. Add `useInputDispatcher()` to `App.tsx`
6. Remove `useKeys` from each screen component one at a time
7. Delete `ui/hooks/useScreenKeys.ts`

## Related Issues
- [Issue 1: Cross-Store Coupling](./01-cross-store-coupling.md) — Screen configs can include available actions
- [Issue 8: No Event Bus](./08-event-bus.md) — Actions could emit events for side effects
