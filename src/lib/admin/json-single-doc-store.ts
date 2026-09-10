import { readFile } from "fs/promises";
import path from "path";
import { withJsonFileLock } from "@/lib/admin/json-file-lock";
import { isMissingFile, writeJsonAtomic } from "@/lib/admin/atomic-json";

export function createJsonSingleDocStore<T extends Record<string, unknown>>(fileName: string, defaultValue: T) {
  const filePath = path.join(process.cwd(), "data", "local", fileName);
  async function read(): Promise<T> {
    try {
      const parsed: unknown = JSON.parse(await readFile(filePath, "utf8"));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`Invalid document in ${fileName}`);
      return { ...structuredClone(defaultValue), ...parsed } as T;
    } catch (error) {
      if (isMissingFile(error)) return structuredClone(defaultValue);
      throw error;
    }
  }
  return {
    async get(): Promise<T> { return withJsonFileLock(filePath, read); },
    async save(input: T): Promise<T> { return this.update(() => input); },
    async update(mutate: (current: T) => T): Promise<T> {
      return withJsonFileLock(filePath, async () => {
        const next = mutate(await read());
        await writeJsonAtomic(filePath, next);
        return structuredClone(next);
      });
    }
  };
}
