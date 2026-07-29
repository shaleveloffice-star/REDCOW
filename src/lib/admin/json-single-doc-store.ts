import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const LOCAL_DATA_DIR = path.join(process.cwd(), "data", "local");

export function createJsonSingleDocStore<T extends Record<string, unknown>>(
  fileName: string,
  defaultValue: T
) {
  const filePath = path.join(LOCAL_DATA_DIR, fileName);

  async function ensureDir() {
    await mkdir(LOCAL_DATA_DIR, { recursive: true });
  }

  return {
    async get(): Promise<T> {
      try {
        const raw = await readFile(filePath, "utf8");
        const parsed = JSON.parse(raw) as T;
        return { ...defaultValue, ...parsed };
      } catch {
        return { ...defaultValue };
      }
    },

    async save(input: T): Promise<T> {
      await ensureDir();
      const payload = `${JSON.stringify(input, null, 2)}\n`;
      await writeFile(filePath, payload, "utf8");
      return { ...input };
    }
  };
}
