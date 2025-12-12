import React from "react";
import { type InputAction, getKeyDisplay } from "../../input/keymap";

/** Map of label -> action(s) */
export type HintActions = Record<string, InputAction | InputAction[]>;

export type KeyHintProps = {
  /** Map of label to action(s). Arrays combine keys with "/". */
  actions: HintActions;
};

export const KeyHint: React.FC<KeyHintProps> = ({ actions }) => {
  const hints = Object.entries(actions).map(([label, actionOrActions]) => {
    const actionList = Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions];
    const keys = actionList.map(getKeyDisplay).join("/");
    return { keys, label };
  });

  return (
    <div className="flex flex-wrap gap-x-3 text-xs text-gray-400 px-1 py-0.5">
      {hints.map((h) => (
        <span key={h.keys}>
          <span className="text-gray-300">[{h.keys}]</span> {h.label}
        </span>
      ))}
    </div>
  );
};
