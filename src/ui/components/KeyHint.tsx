import React from "react";

export type KeyHintProps = {
  hints: { key: string; label: string }[];
};

export const KeyHint: React.FC<KeyHintProps> = ({ hints }) => {
  return (
    <div className="flex flex-wrap gap-x-3 text-xs text-gray-400 px-1 py-0.5">
      {hints.map((h) => (
        <span key={h.key}>
          <span className="text-gray-300">[{h.key}]</span> {h.label}
        </span>
      ))}
    </div>
  );
};
