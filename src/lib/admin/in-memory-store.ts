export function createInMemoryStore<T extends { id: string }>(seed: readonly T[]) {
  let cache: T[] | null = null;

  function mutable(): T[] {
    if (!cache) {
      cache = seed.map((item) => ({ ...item }));
    }
    return cache;
  }

  return {
    getAll(): Promise<T[]> {
      return Promise.resolve(mutable().map((item) => ({ ...item })));
    },
    getById(id: string): Promise<T | null> {
      const found = mutable().find((item) => item.id === id);
      return Promise.resolve(found ? { ...found } : null);
    },
    save(input: T): Promise<T> {
      const items = mutable();
      const idx = items.findIndex((item) => item.id === input.id);
      const saved = { ...input };
      if (idx >= 0) {
        items[idx] = saved;
      } else {
        items.push(saved);
      }
      return Promise.resolve({ ...saved });
    },
    remove(id: string): Promise<boolean> {
      const items = mutable();
      const idx = items.findIndex((item) => item.id === id);
      if (idx < 0) return Promise.resolve(false);
      items.splice(idx, 1);
      return Promise.resolve(true);
    }
  };
}
