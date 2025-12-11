import React from "react";

export type PanelProps = {
  title?: string;
  focused?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export const Panel: React.FC<PanelProps> = ({ title, focused, className, children }) => {
  const borderColor = focused ? "border-white" : "border-gray-600";

  return (
    <div className={`border ${borderColor} flex flex-col ${className ?? ""}`}>
      {title && (
        <div className={`border-b ${borderColor} px-1 py-0.5 text-xs font-bold`}>
          {title}
        </div>
      )}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};
