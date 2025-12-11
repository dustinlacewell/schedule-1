import { useEffect } from "react";

const NAV_KEYS = new Set(["Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

/**
 * Registers a keydown handler that auto-prevents default for navigation keys.
 * Use directly in screen components with their own handler logic.
 */
export const useKeys = (handler: (e: KeyboardEvent) => void) => {
  useEffect(() => {
    const wrapped = (e: KeyboardEvent) => {
      if (NAV_KEYS.has(e.key)) e.preventDefault();
      handler(e);
    };
    window.addEventListener("keydown", wrapped);
    return () => window.removeEventListener("keydown", wrapped);
  }, [handler]);
};
