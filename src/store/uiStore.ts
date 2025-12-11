import { create } from "zustand";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type FocusedPanel = "locations" | "npcs" | "playerInv" | "npcInv";

export type Cursors = {
  locations: number;
  npcs: number;
  playerInv: number;
  npcInv: number;
};

export type UiState = {
  focusedPanel: FocusedPanel;
  cursors: Cursors;
};

export type UiActions = {
  setFocusedPanel: (panel: FocusedPanel) => void;
  setCursor: (panel: FocusedPanel, value: number) => void;
  moveCursor: (panel: FocusedPanel, delta: number, maxLength: number) => void;
  cycleFocus: (panels: FocusedPanel[], direction: 1 | -1) => void;
  resetCursors: () => void;
};

export type UiStore = UiState & UiActions;

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

const initialCursors: Cursors = {
  locations: 0,
  npcs: 0,
  playerInv: 0,
  npcInv: 0,
};

export const useUiStore = create<UiStore>((set, get) => ({
  focusedPanel: "locations",
  cursors: { ...initialCursors },

  setFocusedPanel: (panel) => set({ focusedPanel: panel }),

  setCursor: (panel, value) => {
    const { cursors } = get();
    set({ cursors: { ...cursors, [panel]: Math.max(0, value) } });
  },

  moveCursor: (panel, delta, maxLength) => {
    const { cursors } = get();
    const current = cursors[panel];
    const next = Math.max(0, Math.min(current + delta, maxLength - 1));
    set({ cursors: { ...cursors, [panel]: next } });
  },

  cycleFocus: (panels, direction) => {
    const { focusedPanel } = get();
    if (panels.length === 0) return;
    const idx = panels.indexOf(focusedPanel);
    const next = (idx + direction + panels.length) % panels.length;
    set({ focusedPanel: panels[next]! });
  },

  resetCursors: () => {
    set({ cursors: { ...initialCursors } });
  },
}));
