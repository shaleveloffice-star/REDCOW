import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { withJsonFileLock } from "@/lib/admin/json-file-lock";
import { isReadOnlyServerless } from "@/lib/seo-content/local-seo-mirror";
import type { SeoContentDocument } from "@/types/seo-content";

const LOCAL_DATA_DIR = path.join(process.cwd(), "data", "local");
const FILE_PATH = path.join(LOCAL_DATA_DIR, "seo-content.json");

async function writePayload(input: SeoContentDocument): Promise<void> {
  await mkdir(LOCAL_DATA_DIR, { recursive: true });
  const payload = `${JSON.stringify(input, null, 2)}\n`;
  await writeFile(FILE_PATH, payload, "utf8");

  const verify = await readFile(FILE_PATH, "utf8");
  if (verify !== payload) {
    throw new Error("אימות כתיבה נכשל עבור seo-content.json");
  }
}

export const localSeoContentStore = {
  async get(): Promise<SeoContentDocument> {
    return withJsonFileLock("seo-content.json", async () => {
      try {
        const raw = await readFile(FILE_PATH, "utf8");
        const parsed = JSON.parse(raw) as SeoContentDocument;
        return parsed ?? {};
      } catch {
        return {};
      }
    });
  },

  async save(input: SeoContentDocument): Promise<SeoContentDocument> {
    return withJsonFileLock("seo-content.json", async () => {
      try {
        await writePayload(input);
      } catch (error) {
        const detail = error instanceof Error ? error.message : "write failed";
        console.error("[seo-content] local save failed:", detail);
        throw new Error(
          "שמירת תוכן SEO לדיסק נכשלה. אם הפרויקט ב-OneDrive — סמנו Available offline או העתיקו מחוץ ל-OneDrive."
        );
      }
      return { ...input };
    });
  },

  async saveOptional(input: SeoContentDocument): Promise<void> {
    if (isReadOnlyServerless()) return;

    await withJsonFileLock("seo-content.json", async () => {
      try {
        await writePayload(input);
      } catch (error) {
        const detail = error instanceof Error ? error.message : "write failed";
        console.warn("[seo-content] local mirror skipped:", detail);
      }
    });
  }
};
