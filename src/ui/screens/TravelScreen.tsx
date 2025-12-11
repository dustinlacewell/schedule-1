import React from "react";
import { cities } from "../../data/cities.js";

export const TravelScreen: React.FC = () => {
  return (
    <div className="flex flex-col text-xs gap-1">
      <div>=== TRAVEL ===</div>
      {Object.entries(cities).map(([key, city]) => (
        <div key={key}>
          {city.button}: Go to {city.name}
        </div>
      ))}
      <div className="mt-2">q: Back</div>
    </div>
  );
};
