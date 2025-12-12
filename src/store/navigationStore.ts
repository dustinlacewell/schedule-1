import { create } from "zustand";
import { getFirstCityId } from "./worldStore";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

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
  back: () => void;
};

export type NavigationStore = NavigationState & NavigationActions;

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  screen: "city",
  currentCityId: getFirstCityId(),
  currentLocationId: null,
  currentNpcId: null,

  setScreen: (screen) => set({ screen }),

  travelTo: (cityId) => set({
    currentCityId: cityId,
    currentLocationId: null,
    currentNpcId: null,
    screen: "city",
  }),

  enterLocation: (locationId) => set({
    currentLocationId: locationId,
    currentNpcId: null,
    screen: "npcList",
  }),

  enterNpc: (npcId) => set({
    currentNpcId: npcId,
    screen: "npcInteract",
  }),

  back: () => {
    const { screen } = get();
    if (screen === "npcInteract") {
      set({ currentNpcId: null, screen: "npcList" });
    } else if (screen === "npcList") {
      set({ currentLocationId: null, screen: "city" });
    } else if (screen === "travel") {
      set({ screen: "city" });
    }
  },
}));
