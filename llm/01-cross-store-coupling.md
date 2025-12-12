# Issue 1: Cross-Store Coupling in Navigation

## The Problem

The `navigationStore` currently has direct knowledge of and manipulates the `uiStore`:

```ts
// navigationStore.ts
setScreen: (screen) => {
  set({ screen });
  const ui = useUiStore.getState();
  if (screen === "city" || screen === "travel") {
    ui.setFocusedPanel("locations");
    ui.setCursor("locations", 0);
  } else if (screen === "npcList") {
    ui.setFocusedPanel("npcs");
    ui.setCursor("npcs", 0);
  } else if (screen === "npcInteract") {
    ui.setFocusedPanel("npcInv");
    ui.setCursor("npcInv", 0);
    ui.setCursor("playerInv", 0);
  }
},
```

This pattern is repeated in `travelTo`, `enterLocation`, `enterNpc`, and `back`.

## Why This is a Problem

### 1. Violation of Single Responsibility
The navigation store should only care about *where* the player is in the game world and UI hierarchy. It shouldn't know:
- What panels exist on each screen
- What the default focus should be
- How cursors should be reset

### 2. Shotgun Surgery
Every time you add a new screen, you must:
1. Add the screen type to the `Screen` union
2. Update `setScreen` with the new screen's UI defaults
3. Potentially update `back()` with new back-navigation logic
4. Update any other navigation actions that might transition to this screen

### 3. Hidden Dependencies
Looking at `navigationStore.ts` imports, you see `useUiStore`. This creates a dependency graph:
```
navigationStore → uiStore
```
But the *semantic* dependency is much deeper—navigation "knows" the entire UI structure of every screen.

### 4. Testing Difficulty
To test navigation, you now need to mock or include the entire UI store. The tests become integration tests rather than unit tests.

## The Solution: Screen Configuration Registry

### Step 1: Define Screen Configurations

Create a new file that declares the UI requirements for each screen:

```ts
// ui/screens/registry.ts
import type { Screen } from "../../store/navigationStore";
import type { FocusedPanel } from "../../store/uiStore";

export type ScreenConfig = {
  /** The panel that should be focused when entering this screen */
  defaultPanel: FocusedPanel;
  /** Cursors to reset to 0 when entering this screen */
  cursorsToReset: FocusedPanel[];
  /** Panels available for Tab cycling on this screen */
  focusRing: FocusedPanel[];
  /** The screen to go back to (null = no back action) */
  backTarget: Screen | null;
  /** State to clear when going back */
  clearOnBack?: ("currentLocationId" | "currentNpcId")[];
};

export const screenConfigs: Record<Screen, ScreenConfig> = {
  city: {
    defaultPanel: "locations",
    cursorsToReset: ["locations"],
    focusRing: ["locations"],
    backTarget: null,
  },
  travel: {
    defaultPanel: "locations",
    cursorsToReset: ["locations"],
    focusRing: ["locations"],
    backTarget: "city",
  },
  npcList: {
    defaultPanel: "npcs",
    cursorsToReset: ["npcs"],
    focusRing: ["npcs"],
    backTarget: "city",
    clearOnBack: ["currentLocationId"],
  },
  npcInteract: {
    defaultPanel: "npcInv",
    cursorsToReset: ["npcInv", "playerInv"],
    focusRing: ["playerInv", "npcInv"],
    backTarget: "npcList",
    clearOnBack: ["currentNpcId"],
  },
  location: {
    defaultPanel: "locations",
    cursorsToReset: ["locations"],
    focusRing: ["locations"],
    backTarget: "city",
  },
};
```

### Step 2: Create a Screen Transition Helper

```ts
// store/helpers/screenTransition.ts
import { useNavigationStore } from "../navigationStore";
import { useUiStore } from "../uiStore";
import { screenConfigs } from "../../ui/screens/registry";
import type { Screen } from "../navigationStore";

export const transitionToScreen = (screen: Screen) => {
  const config = screenConfigs[screen];
  const ui = useUiStore.getState();
  
  // Apply UI defaults from config
  ui.setFocusedPanel(config.defaultPanel);
  for (const cursor of config.cursorsToReset) {
    ui.setCursor(cursor, 0);
  }
};

export const goBack = () => {
  const { screen } = useNavigationStore.getState();
  const config = screenConfigs[screen];
  
  if (!config.backTarget) return false;
  
  // Clear navigation state as specified
  const clearState: Partial<Record<string, null>> = {};
  for (const key of config.clearOnBack ?? []) {
    clearState[key] = null;
  }
  
  useNavigationStore.setState({
    screen: config.backTarget,
    ...clearState,
  });
  
  transitionToScreen(config.backTarget);
  return true;
};
```

### Step 3: Simplify Navigation Store

```ts
// navigationStore.ts (simplified)
import { create } from "zustand";
import { getFirstCityId } from "./worldStore";
import { transitionToScreen } from "./helpers/screenTransition";

export type Screen = "city" | "location" | "npcList" | "npcInteract" | "travel";

export type NavigationState = {
  screen: Screen;
  currentCityId: string;
  currentLocationId: string | null;
  currentNpcId: string | null;
};

export type NavigationActions = {
  setScreen: (screen: Screen) => void;
  travelTo: (cityId: string) => void;
  enterLocation: (locationId: string) => void;
  enterNpc: (npcId: string) => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  screen: "city",
  currentCityId: getFirstCityId(),
  currentLocationId: null,
  currentNpcId: null,

  setScreen: (screen) => {
    set({ screen });
    transitionToScreen(screen);
  },

  travelTo: (cityId) => {
    set({
      currentCityId: cityId,
      currentLocationId: null,
      currentNpcId: null,
      screen: "city",
    });
    transitionToScreen("city");
  },

  enterLocation: (locationId) => {
    set({
      currentLocationId: locationId,
      currentNpcId: null,
      screen: "npcList",
    });
    transitionToScreen("npcList");
  },

  enterNpc: (npcId) => {
    set({
      currentNpcId: npcId,
      screen: "npcInteract",
    });
    transitionToScreen("npcInteract");
  },
}));
```

## Benefits of This Approach

### 1. Adding New Screens is Declarative
To add a new "inventory" screen:
```ts
// Just add to the registry
inventory: {
  defaultPanel: "playerInv",
  cursorsToReset: ["playerInv"],
  focusRing: ["playerInv"],
  backTarget: "city",
},
```

### 2. Screen Components Can Read Their Own Config
```tsx
// In any screen component
const config = screenConfigs[screen];
// Use config.focusRing for Tab cycling
```

### 3. Back Navigation is Automatic
The `goBack()` helper reads the config and does the right thing. No more manual `back()` implementations.

### 4. Easy to Extend
Need to add transition animations? Sound effects? Analytics? Add them to `transitionToScreen()` once.

## Migration Path

1. Create `ui/screens/registry.ts` with configs for existing screens
2. Create `store/helpers/screenTransition.ts`
3. Update `navigationStore.ts` to use the helpers
4. Update screen components to use `screenConfigs` for their focus rings
5. Remove the `back` action from navigation store, use `goBack()` helper instead

## Related Issues
- [Issue 7: Screen Type Will Explode](./07-screen-type-explosion.md) — The registry pattern also helps with screen hierarchy
- [Issue 9: Cursor Management is Fragile](./09-cursor-management.md) — Cursors become part of screen config
