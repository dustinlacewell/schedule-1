import React from "react";

export type CursorListItem = {
  id: string;
  label: string;
  sublabel?: string;
};

export type CursorListProps = {
  items: CursorListItem[];
  selectedIndex: number;
  maxVisible?: number;
  emptyMessage?: string;
};

export const CursorList: React.FC<CursorListProps> = ({
  items,
  selectedIndex,
  maxVisible = 10,
  emptyMessage = "(empty)",
}) => {
  if (items.length === 0) {
    return <div className="px-1 py-0.5 text-xs text-gray-500">{emptyMessage}</div>;
  }

  // Scrolling window
  let start = 0;
  if (items.length > maxVisible) {
    const half = Math.floor(maxVisible / 2);
    start = Math.max(0, Math.min(selectedIndex - half, items.length - maxVisible));
  }
  const visible = items.slice(start, start + maxVisible);

  return (
    <div className="px-1 py-0.5 text-xs">
      {visible.map((item, i) => {
        const realIndex = start + i;
        const isSelected = realIndex === selectedIndex;
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
