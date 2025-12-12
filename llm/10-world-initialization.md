# Issue 10: World Initialization is Eager & Non-Deterministic

## Problem

```ts
// worldStore.ts
const initialWorld = initializeWorld();  // Runs at module load!

export const useWorldStore = create<WorldStore>((set, get) => ({
  ...initialWorld,
  // ...
}));
```

Issues:
1. **Eager execution** — World generates before app even renders
2. **No seed** — `Math.random()` means different world every refresh
3. **No reset** — Can't start a new game without page reload
4. **No save/load** — Can't reproduce a specific world state

## Solution: Deferred, Seeded Initialization

### Seeded RNG

```ts
// utils/rng.ts
export const createRng = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
};

// Usage
const rng = createRng(12345);
rng();  // Always same sequence for same seed
```

### Deferred World Creation

```ts
// store/worldStore.ts
export type WorldState = {
  initialized: boolean;
  seed: number | null;
  cities: Record<string, CityInstance>;
  locations: Record<string, LocationInstance>;
  npcs: Record<string, NpcInstance>;
};

export type WorldActions = {
  initializeWorld: (seed?: number) => void;
  resetWorld: () => void;
  // ...
};

export const useWorldStore = create<WorldStore>((set, get) => ({
  initialized: false,
  seed: null,
  cities: {},
  locations: {},
  npcs: {},

  initializeWorld: (seed = Date.now()) => {
    const rng = createRng(seed);
    const world = generateWorld(rng);  // Pass RNG to generator
    set({ ...world, initialized: true, seed });
  },

  resetWorld: () => {
    set({ initialized: false, seed: null, cities: {}, locations: {}, npcs: {} });
  },
}));
```

### Update Generator to Use RNG

```ts
const generateWorld = (rng: () => number): WorldState => {
  const randInt = (min: number, max: number) => 
    Math.floor(rng() * (max - min + 1)) + min;
  
  // Use randInt instead of Math.random() everywhere
  // ...
};
```

### Initialize on Game Start

```tsx
// App.tsx or a GameProvider
const App = () => {
  const initialized = useWorldStore((s) => s.initialized);
  const initializeWorld = useWorldStore((s) => s.initializeWorld);
  
  useEffect(() => {
    if (!initialized) {
      initializeWorld();  // Or initializeWorld(savedSeed) for load
    }
  }, []);
  
  if (!initialized) return <LoadingScreen />;
  return <Terminal />;
};
```

## Benefits

- **Reproducible** — Same seed = same world
- **Saveable** — Store seed + tick + player state = full save
- **Testable** — Use fixed seed in tests
- **Resettable** — New game without reload

## Related
- [Issue 5: Game Loop](./05-game-loop.md) — Tick system also needs seeded RNG
