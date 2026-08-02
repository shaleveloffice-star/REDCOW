import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { TranslationTargetLocale } from "@/lib/translation/types";

const CACHE_DIR = path.join(process.cwd(), "data", "local");
const CACHE_FILE = path.join(CACHE_DIR, "translation-cache.json");

type CacheStore = Record<string, string>;

let memoryCache: CacheStore | null = null;
let loadPromise: Promise<CacheStore> | null = null;

function hashSource(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 24);
}

function cacheKey(targetLocale: TranslationTargetLocale, sourceText: string): string {
  return `${targetLocale}:${hashSource(sourceText)}`;
}

async function loadCacheStore(): Promise<CacheStore> {
  if (memoryCache) return memoryCache;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const raw = await readFile(CACHE_FILE, "utf8");
      memoryCache = JSON.parse(raw) as CacheStore;
    } catch {
      memoryCache = {};
    }
    return memoryCache;
  })();

  return loadPromise;
}

async function persistCacheStore(store: CacheStore): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(store, null, 2), "utf8");
  memoryCache = store;
}

export async function readCachedTranslation(
  sourceText: string,
  targetLocale: TranslationTargetLocale
): Promise<string | null> {
  const store = await loadCacheStore();
  return store[cacheKey(targetLocale, sourceText)] ?? null;
}

export async function writeCachedTranslation(
  sourceText: string,
  targetLocale: TranslationTargetLocale,
  translatedText: string
): Promise<void> {
  const store = await loadCacheStore();
  store[cacheKey(targetLocale, sourceText)] = translatedText;
  await persistCacheStore(store);
}

export async function readCachedTranslations(
  sourceTexts: string[],
  targetLocale: TranslationTargetLocale
): Promise<Map<string, string>> {
  const store = await loadCacheStore();
  const result = new Map<string, string>();

  for (const sourceText of sourceTexts) {
    const cached = store[cacheKey(targetLocale, sourceText)];
    if (cached) {
      result.set(sourceText, cached);
    }
  }

  return result;
}

export async function writeCachedTranslations(
  entries: Array<{ sourceText: string; translatedText: string }>,
  targetLocale: TranslationTargetLocale
): Promise<void> {
  if (entries.length === 0) return;

  const store = await loadCacheStore();
  for (const entry of entries) {
    store[cacheKey(targetLocale, entry.sourceText)] = entry.translatedText;
  }
  await persistCacheStore(store);
}
