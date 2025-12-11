import React from "react";
import { getItemTemplate, type ItemId } from "../../data/items";
import type { Inventory } from "../../store/gameStore";

export type InventoryListProps = {
  inventory: Inventory;
  selectedIndex: number;
  maxVisible?: number;
  emptyMessage?: string;
};

export const InventoryList: React.FC<InventoryListProps> = ({
  inventory,
  selectedIndex,
  maxVisible = 8,
  emptyMessage = "(empty)",
}) => {
  const entries = Object.entries(inventory).filter(([, e]) => e.quantity > 0);

  if (entries.length === 0) {
    return <div className="px-1 py-0.5 text-xs text-gray-500">{emptyMessage}</div>;
  }

  // Scrolling window
  let start = 0;
  if (entries.length > maxVisible) {
    const half = Math.floor(maxVisible / 2);
    start = Math.max(0, Math.min(selectedIndex - half, entries.length - maxVisible));
  }
  const visible = entries.slice(start, start + maxVisible);

  return (
    <div className="px-1 py-0.5 text-xs font-mono">
      {visible.map(([itemId, entry], i) => {
        const realIndex = start + i;
        const isSelected = realIndex === selectedIndex;
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
