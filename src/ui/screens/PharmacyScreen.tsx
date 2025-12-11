import React, { useState } from "react";
import { useGameStore } from "../../store/gameStore";
import { AsciiTable } from "../components/AsciiTable";
import type { StoreStock } from "../../exchange.js";

const pharmacy: StoreStock = {
  diazepam: { quantity: 10, price: 50 },
  paracetamol: { quantity: 20, price: 10 },
  ibuprofen: { quantity: 15, price: 15 },
  codeine: { quantity: 5, price: 100 },
  amoxicillin: { quantity: 8, price: 80 },
};

export const PharmacyScreen: React.FC = () => {
  const [items, setItems] = useState(pharmacy);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  const player = useGameStore((s) => s.player);
  const setPlayer = useGameStore.setState;

  const keys = Object.keys(items);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      setErrorIndex(null);
      if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev - 1 + keys.length) % keys.length);
      } else if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % keys.length);
      } else if (e.key === "ArrowLeft") {
        const key = keys[selectedIndex]!;
        const stockItem = items[key]!;
        const count = player.inventory.get(key) ?? 0;
        if (count <= 0) {
          setErrorIndex(selectedIndex);
          return;
        }
        const nextInv = new Map(player.inventory);
        nextInv.set(key, count - 1);
        const nextItems = { ...items, [key]: { ...stockItem, quantity: stockItem.quantity + 1 } };
        setItems(nextItems);
        setPlayer({ player: { ...player, money: player.money + stockItem.price, inventory: nextInv } });
      } else if (e.key === "ArrowRight") {
        const key = keys[selectedIndex]!;
        const stockItem = items[key]!;
        if (stockItem.quantity <= 0 || player.money < stockItem.price) {
          setErrorIndex(selectedIndex);
          return;
        }
        const nextInv = new Map(player.inventory);
        const count = nextInv.get(key) ?? 0;
        nextInv.set(key, count + 1);
        const nextItems = { ...items, [key]: { ...stockItem, quantity: stockItem.quantity - 1 } };
        setItems(nextItems);
        setPlayer({ player: { ...player, money: player.money - stockItem.price, inventory: nextInv } });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [items, keys, player, selectedIndex, setPlayer]);

  const rows = keys.map((key) => {
    const item = items[key]!;
    const owned = player.inventory.get(key) ?? 0;
    return {
      name: key,
      price: `$${item.price}`,
      stock: String(item.quantity),
      owned: String(owned),
    };
  });

  return (
    <div className="flex flex-col text-xs gap-1">
      <div>=== PHARMACY ===</div>
      <AsciiTable
        columns={[
          { key: "name", label: "Name" },
          { key: "price", label: "Price" },
          { key: "stock", label: "Stock" },
          { key: "owned", label: "Owned" },
        ]}
        rows={rows}
        selectedIndex={selectedIndex}
        errorIndex={errorIndex}
      />
      <div className="mt-1">Use ↑/↓ to select, ← to sell, → to buy, q to back.</div>
    </div>
  );
};
