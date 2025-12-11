// NPC templates - flat registry of all possible NPCs
// Likes/hates affect pricing when trading

import type { ItemId } from "./items";

export type NpcTemplateId = string;

export type NpcTemplate = {
  id: NpcTemplateId;
  name: string;
  likes: ItemId[];
  hates: ItemId[];
  catchphrase: string;
};

export const npcTemplates: Record<NpcTemplateId, NpcTemplate> = {
  cyber: {
    id: "cyber",
    name: "Cyber",
    likes: ["weed"],
    hates: ["coke"],
    catchphrase: "I say a lot of things all the time.",
  },
  ldle: {
    id: "ldle",
    name: "ldle",
    likes: ["weed", "meth"],
    hates: ["coke"],
    catchphrase: "Blinks.",
  },
  valen: {
    id: "valen",
    name: "Valen",
    likes: ["coke"],
    hates: ["weed", "meth"],
    catchphrase: "I don't know what to tell you.",
  },
  doc: {
    id: "doc",
    name: "Doc",
    likes: ["diazepam", "codeine"],
    hates: [],
    catchphrase: "What seems to be the problem?",
  },
  sketchy_pete: {
    id: "sketchy_pete",
    name: "Sketchy Pete",
    likes: ["meth"],
    hates: ["paracetamol"],
    catchphrase: "You didn't see me here.",
  },
  maria: {
    id: "maria",
    name: "Maria",
    likes: ["weed", "ibuprofen"],
    hates: ["meth"],
    catchphrase: "Keep it chill, yeah?",
  },
};

export const getNpcTemplate = (id: NpcTemplateId): NpcTemplate | undefined =>
  npcTemplates[id];

export const allNpcTemplateIds = (): NpcTemplateId[] => Object.keys(npcTemplates);

export const sampleNpcTemplateIds = (count: number): NpcTemplateId[] => {
  const shuffled = allNpcTemplateIds()
    .map((id) => ({ id, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ id }) => id);
  return shuffled.slice(0, count);
};
