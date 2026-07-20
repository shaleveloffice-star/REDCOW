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
      try {
        await writeAll(initial);
      } catch (err) {
        console.warn(
          `[json-file-store] seed write failed for ${fileName}:`,
          err instanceof Error ? err.message : err
        );
      }
      return initial;
    }
  }

  async function writeAll(items: T[]): Promise<void> {
    await ensureDir();
    const payload = `${JSON.stringify(items, null, 2)}\n`;
    await writeFile(filePath, payload, "utf8");

    // Verify — OneDrive / ReadOnly can pretend to succeed or leave stale files.
    const verify = await readFile(filePath, "utf8");
    if (verify !== payload) {
      throw new Error(`אימות כתיבה נכשל עבור ${fileName}`);
    }
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
      try {
        await writeAll(items);
      } catch (err) {
        const detail = err instanceof Error ? err.message : "write failed";
        console.error(`[json-file-store] save failed for ${fileName}:`, detail);
        throw new Error(
          `שמירה לדיסק נכשלה (${fileName}). אם הפרויקט ב-OneDrive — סמנו את התיקייה Available offline או העתיקו מחוץ ל-OneDrive.`
        );
      }
      return { ...saved };
    },
    async remove(id: string): Promise<boolean> {
      const items = await readAll();
      const idx = items.findIndex((item) => item.id === id);
      if (idx < 0) return false;
      items.splice(idx, 1);
      try {
        await writeAll(items);
      } catch (err) {
        const detail = err instanceof Error ? err.message : "write failed";
        console.error(`[json-file-store] remove failed for ${fileName}:`, detail);
        throw new Error(`מחיקה מהדיסק נכשלה (${fileName}).`);
      }
      return true;
    }
  };
}
