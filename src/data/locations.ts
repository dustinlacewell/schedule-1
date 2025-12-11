// Location templates - flat registry of all possible locations
// Each location has a stock template that defines what items NPCs there will sell

import type { ItemId } from "./items";

export type LocationId = string;

export type StockEntry = {
  minQty: number;
  maxQty: number;
  priceMultiplier: number; // multiplied by item basePrice
};

export type StockTemplate = Record<ItemId, StockEntry>;

export type LocationTemplate = {
  id: LocationId;
  name: string;
  description: string;
  heat: number;
  stockTemplate: StockTemplate;
};

export const locationTemplates: Record<LocationId, LocationTemplate> = {
  alley: {
    id: "alley",
    name: "Dark Alley",
    description: "A shady alleyway filled with graffiti and the smell of damp concrete.",
    heat: 0,
    stockTemplate: {
      weed: { minQty: 5, maxQty: 15, priceMultiplier: 0.8 },
      coke: { minQty: 2, maxQty: 8, priceMultiplier: 1.0 },
      meth: { minQty: 1, maxQty: 5, priceMultiplier: 1.1 },
    },
  },
  street_corner: {
    id: "street_corner",
    name: "Street Corner",
    description: "A busy street corner where people hustle and bustle about their day.",
    heat: 10,
    stockTemplate: {
      weed: { minQty: 3, maxQty: 10, priceMultiplier: 1.0 },
      coke: { minQty: 1, maxQty: 5, priceMultiplier: 1.2 },
    },
  },
  nightclub: {
    id: "nightclub",
    name: "Nightclub",
    description: "A loud and vibrant nightclub with flashing lights and thumping music.",
    heat: 2,
    stockTemplate: {
      coke: { minQty: 5, maxQty: 12, priceMultiplier: 1.3 },
      meth: { minQty: 2, maxQty: 6, priceMultiplier: 1.2 },
    },
  },
  park: {
    id: "park",
    name: "City Park",
    description: "A peaceful park with green trees and a small pond, a rare oasis in the urban jungle.",
    heat: 5,
    stockTemplate: {
      weed: { minQty: 8, maxQty: 20, priceMultiplier: 0.9 },
    },
  },
  arcade: {
    id: "arcade",
    name: "Arcade",
    description: "A retro arcade filled with the sounds of pinball machines and video games.",
    heat: 3,
    stockTemplate: {
      weed: { minQty: 2, maxQty: 8, priceMultiplier: 1.1 },
    },
  },
  diner: {
    id: "diner",
    name: "24/7 Diner",
    description: "A classic diner that's open all night, serving comfort food to night owls and insomniacs.",
    heat: 6,
    stockTemplate: {
      weed: { minQty: 1, maxQty: 5, priceMultiplier: 1.0 },
      codeine: { minQty: 1, maxQty: 3, priceMultiplier: 1.2 },
    },
  },
  underpass: {
    id: "underpass",
    name: "Underpass",
    description: "A dimly lit underpass where the echoes of footsteps create an eerie atmosphere.",
    heat: 3,
    stockTemplate: {
      meth: { minQty: 3, maxQty: 10, priceMultiplier: 0.85 },
      coke: { minQty: 2, maxQty: 6, priceMultiplier: 0.9 },
    },
  },
  dive_bar: {
    id: "dive_bar",
    name: "Dive Bar",
    description: "A gritty dive bar with sticky floors and cheap drinks, frequented by the city's rougher crowd.",
    heat: 4,
    stockTemplate: {
      weed: { minQty: 3, maxQty: 8, priceMultiplier: 1.0 },
      coke: { minQty: 1, maxQty: 4, priceMultiplier: 1.1 },
      codeine: { minQty: 1, maxQty: 2, priceMultiplier: 1.3 },
    },
  },
  pharmacy: {
    id: "pharmacy",
    name: "Pharmacy",
    description: "A small pharmacy with a helpful but suspicious pharmacist behind the counter.",
    heat: 8,
    stockTemplate: {
      diazepam: { minQty: 5, maxQty: 15, priceMultiplier: 1.0 },
      paracetamol: { minQty: 10, maxQty: 30, priceMultiplier: 1.0 },
      ibuprofen: { minQty: 8, maxQty: 25, priceMultiplier: 1.0 },
      codeine: { minQty: 3, maxQty: 10, priceMultiplier: 1.0 },
      amoxicillin: { minQty: 4, maxQty: 12, priceMultiplier: 1.0 },
    },
  },
};

export const getLocationTemplate = (id: LocationId): LocationTemplate | undefined =>
  locationTemplates[id];

export const allLocationIds = (): LocationId[] => Object.keys(locationTemplates);

export const sampleLocationIds = (count: number): LocationId[] => {
  const shuffled = allLocationIds()
    .map((id) => ({ id, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ id }) => id);
  return shuffled.slice(0, count);
};