// Item templates - flat registry of all items in the game

export type ItemId = string;

export type ItemTemplate = {
  id: ItemId;
  name: string;
  category: "drug" | "pharmaceutical" | "other";
  basePrice: number;
  props?: Record<string, unknown>;
};

export const itemTemplates: Record<ItemId, ItemTemplate> = {
  weed: {
    id: "weed",
    name: "Weed",
    category: "drug",
    basePrice: 15,
    props: { addictiveness: 0.2 },
  },
  coke: {
    id: "coke",
    name: "Coke",
    category: "drug",
    basePrice: 80,
    props: { addictiveness: 0.5 },
  },
  meth: {
    id: "meth",
    name: "Meth",
    category: "drug",
    basePrice: 120,
    props: { addictiveness: 0.8 },
  },
  diazepam: {
    id: "diazepam",
    name: "Diazepam",
    category: "pharmaceutical",
    basePrice: 50,
    props: { addictiveness: 0.4 },
  },
  paracetamol: {
    id: "paracetamol",
    name: "Paracetamol",
    category: "pharmaceutical",
    basePrice: 10,
    props: { addictiveness: 0.1 },
  },
  ibuprofen: {
    id: "ibuprofen",
    name: "Ibuprofen",
    category: "pharmaceutical",
    basePrice: 15,
    props: { addictiveness: 0.1 },
  },
  codeine: {
    id: "codeine",
    name: "Codeine",
    category: "pharmaceutical",
    basePrice: 100,
    props: { addictiveness: 0.6 },
  },
  amoxicillin: {
    id: "amoxicillin",
    name: "Amoxicillin",
    category: "pharmaceutical",
    basePrice: 80,
    props: { addictiveness: 0.2 },
  },
};

export const getItemTemplate = (id: ItemId): ItemTemplate | undefined =>
  itemTemplates[id];
