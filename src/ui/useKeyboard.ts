import { useEffect } from "react";
import { useGameStore, getDrugKeys } from "../store/gameStore";
import { cities } from "../data/cities.js";
import { drugs } from "../data/drugs.js";

export const useKeyboard = () => {
  const screen = useGameStore((s) => s.screen);
  const setScreen = useGameStore((s) => s.setScreen);
  const buyItem = useGameStore((s) => s.buyItem);
  const sellItem = useGameStore((s) => s.sellItem);
  const travelTo = useGameStore((s) => s.travelTo);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;

      if (screen === "city") {
        if (key === "t") setScreen("trade");
        else if (key === "g") setScreen("travel");
        else if (key === "p") setScreen("pharmacy");
      } else if (screen === "trade") {
        if (key === "q") setScreen("city");

        for (const drugKey of getDrugKeys()) {
          const drug = drugs[drugKey]!;
          if (key === drug.buttonBuy) buyItem(drugKey);
          if (key === drug.buttonSell) sellItem(drugKey);
        }
      } else if (screen === "travel") {
        if (key === "q") setScreen("city");

        for (const cityKey in cities) {
          const city = cities[cityKey]!;
          if (key === city.button) {
            travelTo(cityKey);
          }
        }
      } else if (screen === "pharmacy") {
        if (key === "q") setScreen("city");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, setScreen, buyItem, sellItem, travelTo]);
};
