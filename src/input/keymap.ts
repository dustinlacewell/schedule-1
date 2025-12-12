/** All semantic input actions */
export type InputAction =
  | "cursor_up"
  | "cursor_down"
  | "confirm"
  | "cancel"
  | "cycle_focus"
  | "travel";

/** Maps actions to the keys that trigger them */
export const keymap: Record<InputAction, string[]> = {
  cursor_up: ["ArrowUp", "w"],
  cursor_down: ["ArrowDown", "s"],
  confirm: ["Enter", " "],
  cancel: ["Escape", "q"],
  cycle_focus: ["Tab"],
  travel: ["g"],
};

/** Check if a key matches an action */
export const matchesAction = (key: string, action: InputAction): boolean =>
  keymap[action].includes(key);

/** Get the display string for an action's primary key */
export const getKeyDisplay = (action: InputAction): string => {
  const key = keymap[action][0] ?? "";
  switch (key) {
    case "ArrowUp": return "↑";
    case "ArrowDown": return "↓";
    case "ArrowLeft": return "←";
    case "ArrowRight": return "→";
    case " ": return "Space";
    case "Escape": return "Esc";
    default: return key;
  }
};
