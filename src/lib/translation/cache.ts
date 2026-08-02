import "server-only";

import { createHash } from "node:crypto";

import { getAdminFirestore } from "@/lib/firebase/admin-runtime";
import { AUTO_TRANSLATION_ENABLED } from "@/lib/translation/config";
import type { TranslationTargetLocale } from "@/lib/translation/types";

const COLLECTION = "translationCache";
const FIRESTORE_GETALL_CHUNK = 10;

type MemoryStore = Map<string, string>;

let memoryCache: MemoryStore = new Map();

export function hashSourceText(sourceText: string): string {
  return createHash("sha256").update(sourceText).digest("hex").slice(0, 24);
}

export function buildTranslationCacheDocId(
  targetLocale: TranslationTargetLocale,
  sourceText: string
): string {
  return createHash("sha256").update(`${targetLocale}\0${sourceText}`).digest("hex");
}

function memoryKey(targetLocale: TranslationTargetLocale, sourceText: string): string {
  return `${targetLocale}:${hashSourceText(sourceText)}`;
}

function readFromMemory(
  sourceTexts: string[],
  targetLocale: TranslationTargetLocale
): Map<string, string> {
  const result = new Map<string, string>();
  for (const sourceText of sourceTexts) {
    const cached = memoryCache.get(memoryKey(targetLocale, sourceText));
    if (cached) {
      result.set(sourceText, cached);
    }
  }
  return result;
}

function writeToMemory(
  entries: Array<{ sourceText: string; translatedText: string }>,
  targetLocale: TranslationTargetLocale
): void {
  for (const entry of entries) {
    memoryCache.set(memoryKey(targetLocale, entry.sourceText), entry.translatedText);
  }
}

async function readFromFirestore(
  sourceTexts: string[],
  targetLocale: TranslationTargetLocale
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const db = await getAdminFirestore();
  if (!db || sourceTexts.length === 0) {
    return result;
  }

  try {
    for (let offset = 0; offset < sourceTexts.length; offset += FIRESTORE_GETALL_CHUNK) {
      const chunk = sourceTexts.slice(offset, offset + FIRESTORE_GETALL_CHUNK);
      const refs = chunk.map((sourceText) =>
        db.collection(COLLECTION).doc(buildTranslationCacheDocId(targetLocale, sourceText))
      );
      const snapshots = await db.getAll(...refs);

      snapshots.forEach((snapshot, index) => {
        if (!snapshot.exists) return;
        const data = snapshot.data() as {
          targetLocale?: TranslationTargetLocale;
          translatedText?: string;
        };
        if (data.targetLocale !== targetLocale) return;
        const translatedText = String(data.translatedText ?? "").trim();
        if (!translatedText) return;

        const sourceText = chunk[index];
        result.set(sourceText, translatedText);
        memoryCache.set(memoryKey(targetLocale, sourceText), translatedText);
      });
    }
  } catch (error) {
    console.error("[translation-cache] Firestore read failed", error);
  }

  return result;
}

async function writeToFirestore(
  entries: Array<{ sourceText: string; translatedText: string }>,
  targetLocale: TranslationTargetLocale
): Promise<void> {
  const db = await getAdminFirestore();
  if (!db || entries.length === 0) {
    return;
  }

  const now = new Date().toISOString();

  try {
    await Promise.all(
      entries.map(async (entry) => {
        const docId = buildTranslationCacheDocId(targetLocale, entry.sourceText);
        const ref = db.collection(COLLECTION).doc(docId);
        const existing = await ref.get();
        const payload: Record<string, string> = {
          sourceHash: hashSourceText(entry.sourceText),
          targetLocale,
          translatedText: entry.translatedText,
          updatedAt: now
        };
        if (!existing.exists) {
          payload.createdAt = now;
        }
        await ref.set(payload, { merge: true });
      })
    );
  } catch (error) {
    console.error("[translation-cache] Firestore write failed", error);
  }
}

export async function readCachedTranslations(
  sourceTexts: string[],
  targetLocale: TranslationTargetLocale
): Promise<Map<string, string>> {
  if (!AUTO_TRANSLATION_ENABLED) {
    return new Map();
  }
  const uniqueTexts = [...new Set(sourceTexts.filter((text) => text.trim()))];
  if (uniqueTexts.length === 0) {
    return new Map();
  }

  const result = readFromMemory(uniqueTexts, targetLocale);
  const missingFromMemory = uniqueTexts.filter((text) => !result.has(text));
  if (missingFromMemory.length === 0) {
    return result;
  }

  const fromFirestore = await readFromFirestore(missingFromMemory, targetLocale);
  for (const [sourceText, translatedText] of fromFirestore) {
    result.set(sourceText, translatedText);
  }

  return result;
}

export async function readCachedTranslation(
  sourceText: string,
  targetLocale: TranslationTargetLocale
): Promise<string | null> {
  const cached = await readCachedTranslations([sourceText], targetLocale);
  return cached.get(sourceText) ?? null;
}

export async function writeCachedTranslations(
  entries: Array<{ sourceText: string; translatedText: string }>,
  targetLocale: TranslationTargetLocale
): Promise<void> {
  if (!AUTO_TRANSLATION_ENABLED) {
    return;
  }
  if (entries.length === 0) {
    return;
  }

  writeToMemory(entries, targetLocale);

  try {
    await writeToFirestore(entries, targetLocale);
  } catch (error) {
    console.error("[translation-cache] Unexpected Firestore write error", error);
  }
}

export async function writeCachedTranslation(
  sourceText: string,
  targetLocale: TranslationTargetLocale,
  translatedText: string
): Promise<void> {
  await writeCachedTranslations([{ sourceText, translatedText }], targetLocale);
}
