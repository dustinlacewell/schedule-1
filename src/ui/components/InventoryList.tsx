import React, { useState, useEffect } from "react";
import { matchesAction } from "../../input/keymap";
import { getItemTemplate } from "../../data/items";
import type { Inventory } from "../../store/worldStore";

export type InventoryListProps = {
  inventory: Inventory;
  active: boolean;
  onSelect: (itemId: string) => void;
  maxVisible?: number;
  emptyMessage?: string;
};

export const InventoryList: React.FC<InventoryListProps> = ({
  inventory,
  active,
  onSelect,
  maxVisible = 8,
  emptyMessage = "(empty)",
}) => {
  const [cursor, setCursor] = useState(0);
  const entries = Object.entries(inventory).filter(([, e]) => e.quantity > 0);

  // Clamp cursor if entries shrink
  useEffect(() => {
    if (cursor >= entries.length && entries.length > 0) {
      setCursor(entries.length - 1);
    }
  }, [cursor, entries.length]);

  // Handle keyboard when active
  useEffect(() => {
    if (!active || entries.length === 0) return;

    const handler = (e: KeyboardEvent) => {
      if (matchesAction(e.key, "cursor_up")) {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (matchesAction(e.key, "cursor_down")) {
        e.preventDefault();
        setCursor((c) => Math.min(entries.length - 1, c + 1));
      } else if (matchesAction(e.key, "confirm")) {
        e.preventDefault();
        const entry = entries[cursor];
        if (entry) onSelect(entry[0]);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, entries, cursor, onSelect]);

  if (entries.length === 0) {
    return <div className="px-1 py-0.5 text-xs text-gray-500">{emptyMessage}</div>;
  }

  // Scrolling window
  let start = 0;
  if (entries.length > maxVisible) {
    const half = Math.floor(maxVisible / 2);
    start = Math.max(0, Math.min(cursor - half, entries.length - maxVisible));
  }
  const visible = entries.slice(start, start + maxVisible);

  return (
    <div className="px-1 py-0.5 text-xs font-mono">
      {visible.map(([itemId, entry], i) => {
        const realIndex = start + i;
        const isSelected = realIndex === cursor;
        const prefix = isSelected ? "> " : "  ";
        const tpl = getItemTemplate(itemId);
        const name = tpl?.name ?? itemId;
        return (
          <div key={itemId} className={isSelected ? "text-cyan-300" : ""}>
            {prefix}
            {name} x{entry.quantity}
            <span className="text-green-400 ml-2">${entry.price}</span>
          </div>
        );
      })}
    </div>
  );
};
