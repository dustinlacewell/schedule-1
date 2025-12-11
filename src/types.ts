// Legacy types - kept for reference but no longer used by the web UI.
// All game types are now defined in:
//   - src/data/items.ts (ItemTemplate)
//   - src/data/locations.ts (LocationTemplate)
//   - src/data/npcs.ts (NpcTemplate)
//   - src/data/cities.ts (CityTemplate)
//   - src/store/gameStore.ts (runtime instances + player state)

export type Action = {
  key: string;
  label: string;
  action: () => void | true;
  hidden?: boolean;
};

export type ActionRecord = Record<string, Action>;

export type ActionSet = {
  render: () => void;
  handle: (key: string) => void | true;
};