import React from "react";
import { Terminal } from "./Terminal";

export const App: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-black text-green-200 flex items-center justify-center font-mono">
      <Terminal />
    </div>
  );
};
