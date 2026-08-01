import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type { SeoContentDocument } from "@/types/seo-content";

const LOCAL_DATA_DIR = path.join(process.cwd(), "data", "local");
const FILE_PATH = path.join(LOCAL_DATA_DIR, "seo-content.json");

export const localSeoContentStore = {
  async get(): Promise<SeoContentDocument> {
    try {
      const raw = await readFile(FILE_PATH, "utf8");
      const parsed = JSON.parse(raw) as SeoContentDocument;
      return parsed ?? {};
    } catch {
      return {};
    }
  },

  async save(input: SeoContentDocument): Promise<SeoContentDocument> {
    await mkdir(LOCAL_DATA_DIR, { recursive: true });
    const payload = `${JSON.stringify(input, null, 2)}\n`;
    await writeFile(FILE_PATH, payload, "utf8");
    return { ...input };
  }
};
