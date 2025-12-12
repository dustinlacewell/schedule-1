import React, { useState, useEffect } from "react";
import { matchesAction } from "../../input/keymap";

export type CursorListItem = {
  id: string;
  label: string;
  sublabel?: string;
};

export type CursorListProps = {
  items: CursorListItem[];
  active: boolean;
  onSelect: (id: string) => void;
  onCancel?: () => void;
  maxVisible?: number;
  emptyMessage?: string;
};

export const CursorList: React.FC<CursorListProps> = ({
  items,
  active,
  onSelect,
  onCancel,
  maxVisible = 10,
  emptyMessage = "(empty)",
}) => {
  const [cursor, setCursor] = useState(0);

  // Reset cursor when items change
  useEffect(() => {
    setCursor(0);
  }, [items.length]);

  // Clamp cursor if items shrink
  useEffect(() => {
    if (cursor >= items.length && items.length > 0) {
      setCursor(items.length - 1);
    }
  }, [cursor, items.length]);

  // Handle keyboard when active
  useEffect(() => {
    if (!active || items.length === 0) return;

    const handler = (e: KeyboardEvent) => {
      if (matchesAction(e.key, "cursor_up")) {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (matchesAction(e.key, "cursor_down")) {
        e.preventDefault();
        setCursor((c) => Math.min(items.length - 1, c + 1));
      } else if (matchesAction(e.key, "confirm")) {
        e.preventDefault();
        const item = items[cursor];
        if (item) onSelect(item.id);
      } else if (matchesAction(e.key, "cancel") && onCancel) {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, items, cursor, onSelect, onCancel]);

  if (items.length === 0) {
    return <div className="px-1 py-0.5 text-xs text-gray-500">{emptyMessage}</div>;
  }

  // Scrolling window
  let start = 0;
  if (items.length > maxVisible) {
    const half = Math.floor(maxVisible / 2);
    start = Math.max(0, Math.min(cursor - half, items.length - maxVisible));
  }
  const visible = items.slice(start, start + maxVisible);

  return (
    <div className="px-1 py-0.5 text-xs">
      {visible.map((item, i) => {
        const realIndex = start + i;
        const isSelected = realIndex === cursor;
        const prefix = isSelected ? "> " : "  ";
        return (
          <div key={item.id} className={isSelected ? "text-cyan-300" : ""}>
            {prefix}
            {item.label}
            {item.sublabel && <span className="text-gray-500 ml-2">{item.sublabel}</span>}
          </div>
        );
      })}
    </div>
  );
};
