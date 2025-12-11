// City templates - flat registry of all cities
// Cities are instantiated at runtime with locations and NPCs

export type CityTemplateId = string;

export type CityTemplate = {
  id: CityTemplateId;
  name: string;
  description: string;
  priceModifier: number; // global multiplier for prices in this city
};

export const cityTemplates: Record<CityTemplateId, CityTemplate> = {
  chicago: {
    id: "chicago",
    name: "Chicago",
    description: "The Windy City. Deep dish pizza and deeper pockets.",
    priceModifier: 1.0,
  },
  new_york: {
    id: "new_york",
    name: "New York",
    description: "The city that never sleeps. High demand, high prices.",
    priceModifier: 1.2,
  },
  portland: {
    id: "portland",
    name: "Portland",
    description: "Keep it weird. Relaxed vibes and cheaper greens.",
    priceModifier: 0.9,
  },
};

export const getCityTemplate = (id: CityTemplateId): CityTemplate | undefined =>
  cityTemplates[id];

export const allCityTemplateIds = (): CityTemplateId[] => Object.keys(cityTemplates);