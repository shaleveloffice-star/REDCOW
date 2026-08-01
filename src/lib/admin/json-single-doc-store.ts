import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { withJsonFileLock } from "@/lib/admin/json-file-lock";

const LOCAL_DATA_DIR = path.join(process.cwd(), "data", "local");

export function createJsonSingleDocStore<T extends Record<string, unknown>>(
  fileName: string,
  defaultValue: T
) {
  const filePath = path.join(LOCAL_DATA_DIR, fileName);
  const lockKey = fileName;

  async function ensureDir() {
    await mkdir(LOCAL_DATA_DIR, { recursive: true });
  }

  return {
    async get(): Promise<T> {
      return withJsonFileLock(lockKey, async () => {
        try {
          const raw = await readFile(filePath, "utf8");
          const parsed = JSON.parse(raw) as T;
          return { ...defaultValue, ...parsed };
        } catch {
          return { ...defaultValue };
        }
      });
    },

    async save(input: T): Promise<T> {
      return withJsonFileLock(lockKey, async () => {
        await ensureDir();
        const payload = `${JSON.stringify(input, null, 2)}\n`;
        await writeFile(filePath, payload, "utf8");

        const verify = await readFile(filePath, "utf8");
        if (verify !== payload) {
          throw new Error(`אימות כתיבה נכשל עבור ${fileName}`);
        }

        return { ...input };
      });
    }
  };
}
