import { useEffect } from "react";
import { type InputAction, matchesAction } from "../../input/keymap";

export type ActionMap = Partial<Record<InputAction, () => void>>;

/**
 * Registers keyboard handlers using semantic actions.
 * Actions are mapped to keys via the central keymap.
 */
export function useActions(actionMap: ActionMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      for (const [action, callback] of Object.entries(actionMap)) {
        if (callback && matchesAction(e.key, action as InputAction)) {
          e.preventDefault();
          callback();
          return;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actionMap]);
}
