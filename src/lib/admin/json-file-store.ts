import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const LOCAL_DATA_DIR = path.join(process.cwd(), "data", "local");

export function createJsonFileStore<T extends { id: string }>(fileName: string, seed: readonly T[]) {
  const filePath = path.join(LOCAL_DATA_DIR, fileName);

  async function ensureDir() {
    await mkdir(LOCAL_DATA_DIR, { recursive: true });
  }

  async function readAll(): Promise<T[]> {
    try {
      const raw = await readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as T[];
      return Array.isArray(parsed) ? parsed : seed.map((item) => ({ ...item }));
    } catch {
      const initial = seed.map((item) => ({ ...item }));
      await writeAll(initial);
      return initial;
    }
  }

  async function writeAll(items: T[]): Promise<void> {
    await ensureDir();
    await writeFile(filePath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
  }

  return {
    async getAll(): Promise<T[]> {
      const items = await readAll();
      return items.map((item) => ({ ...item }));
    },
    async getById(id: string): Promise<T | null> {
      const found = (await readAll()).find((item) => item.id === id);
      return found ? { ...found } : null;
    },
    async save(input: T): Promise<T> {
      const items = await readAll();
      const idx = items.findIndex((item) => item.id === input.id);
      const saved = { ...input };
      if (idx >= 0) {
        items[idx] = saved;
      } else {
        items.push(saved);
      }
      await writeAll(items);
      return { ...saved };
    },
    async remove(id: string): Promise<boolean> {
      const items = await readAll();
      const idx = items.findIndex((item) => item.id === id);
      if (idx < 0) return false;
      items.splice(idx, 1);
      await writeAll(items);
      return true;
    }
  };
}
