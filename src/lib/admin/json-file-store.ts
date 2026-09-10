import { readFile } from "fs/promises";
import path from "path";
import { withJsonFileLock } from "@/lib/admin/json-file-lock";
import { isMissingFile, writeJsonAtomic } from "@/lib/admin/atomic-json";

export function createJsonFileStore<T extends { id: string }>(fileName: string, seed: readonly T[]) {
  const filePath = path.join(process.cwd(), "data", "local", fileName);
  async function readAll(): Promise<T[]> {
    try {
      const parsed: unknown = JSON.parse(await readFile(filePath, "utf8"));
      if (!Array.isArray(parsed)) throw new Error(`Invalid collection in ${fileName}`);
      return parsed as T[];
    } catch (error) {
      if (isMissingFile(error)) return structuredClone([...seed]);
      throw error;
    }
  }
  return {
    async getAll(): Promise<T[]> {
      return withJsonFileLock(filePath, async () => structuredClone(await readAll()));
    },
    async getById(id: string): Promise<T | null> {
      return withJsonFileLock(filePath, async () => structuredClone((await readAll()).find(x => x.id === id) ?? null));
    },
    async update<R>(mutate: (items: T[]) => { items: T[]; result: R }): Promise<R> {
      return withJsonFileLock(filePath, async () => {
        const next = mutate(await readAll());
        await writeJsonAtomic(filePath, next.items);
        return structuredClone(next.result);
      });
    },
    async save(input: T): Promise<T> {
      return this.update(items => ({ items: items.some(x => x.id === input.id) ? items.map(x => x.id === input.id ? structuredClone(input) : x) : [...items, structuredClone(input)], result: input }));
    },
    async remove(id: string): Promise<boolean> {
      return this.update(items => ({ items: items.filter(x => x.id !== id), result: items.some(x => x.id === id) }));
    }
  };
}
