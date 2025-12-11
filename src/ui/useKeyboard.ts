import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";

export const useKeyboard = () => {
  const screen = useGameStore((s) => s.screen);
  const focusedPanel = useGameStore((s) => s.focusedPanel);
  const cursors = useGameStore((s) => s.cursors);
  const cities = useGameStore((s) => s.cities);
  const locations = useGameStore((s) => s.locations);
  const currentCityId = useGameStore((s) => s.currentCityId);
  const currentLocationId = useGameStore((s) => s.currentLocationId);

  const setScreen = useGameStore((s) => s.setScreen);
  const travelTo = useGameStore((s) => s.travelTo);
  const enterLocation = useGameStore((s) => s.enterLocation);
  const enterNpc = useGameStore((s) => s.enterNpc);
  const back = useGameStore((s) => s.back);
  const cycleFocus = useGameStore((s) => s.cycleFocus);
  const moveCursor = useGameStore((s) => s.moveCursor);
  const buyFromNpc = useGameStore((s) => s.buyFromNpc);
  const sellToNpc = useGameStore((s) => s.sellToNpc);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;

      // Global: quit
      if (key === "Q") {
        // Could add a quit confirmation later
        return;
      }

      // ─── City Screen ─────────────────────────────────────────
      if (screen === "city") {
        if (key === "ArrowUp") moveCursor(-1);
        else if (key === "ArrowDown") moveCursor(1);
        else if (key === "Enter") {
          const city = cities[currentCityId];
          const locId = city?.locationIds[cursors.locations];
          if (locId) enterLocation(locId);
        } else if (key === "g") {
          setScreen("travel");
        } else if (key === "q") {
          // On city screen, q could quit or do nothing
        }
        return;
      }

      // ─── Travel Screen ───────────────────────────────────────
      if (screen === "travel") {
        if (key === "ArrowUp") moveCursor(-1);
        else if (key === "ArrowDown") moveCursor(1);
        else if (key === "Enter") {
          const cityList = Object.values(cities);
          const city = cityList[cursors.locations];
          if (city) travelTo(city.id);
        } else if (key === "q") {
          back();
        }
        return;
      }

      // ─── NPC List Screen ─────────────────────────────────────
      if (screen === "npcList") {
        if (key === "ArrowUp") moveCursor(-1);
        else if (key === "ArrowDown") moveCursor(1);
        else if (key === "Enter") {
          const loc = currentLocationId ? locations[currentLocationId] : null;
          const npcId = loc?.npcIds[cursors.npcs];
          if (npcId) enterNpc(npcId);
        } else if (key === "q") {
          back();
        }
        return;
      }

      // ─── NPC Interact Screen ─────────────────────────────────
      if (screen === "npcInteract") {
        if (key === "Tab") {
          cycleFocus(e.shiftKey ? -1 : 1);
        } else if (key === "ArrowUp") {
          moveCursor(-1);
        } else if (key === "ArrowDown") {
          moveCursor(1);
        } else if (key === "ArrowLeft" || (key === "Enter" && focusedPanel === "npcInv")) {
          // Buy from NPC
          buyFromNpc();
        } else if (key === "ArrowRight" || (key === "Enter" && focusedPanel === "playerInv")) {
          // Sell to NPC
          sellToNpc();
        } else if (key === "q") {
          back();
        }
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    screen,
    focusedPanel,
    cursors,
    cities,
    locations,
    currentCityId,
    currentLocationId,
    setScreen,
    travelTo,
    enterLocation,
    enterNpc,
    back,
    cycleFocus,
    moveCursor,
    buyFromNpc,
    sellToNpc,
  ]);
};
