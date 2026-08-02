import "server-only";

import { unstable_cache } from "next/cache";

import type { Locale } from "@/i18n/config";
import {
  readCachedTranslation,
  readCachedTranslations,
  writeCachedTranslation,
  writeCachedTranslations
} from "@/lib/translation/cache";
import { translateProtectedTexts } from "@/lib/translation/google-translate";
import type { TranslationTargetLocale } from "@/lib/translation/types";

function asTargetLocale(locale: Locale): TranslationTargetLocale | null {
  if (locale === "en" || locale === "fr") {
    return locale;
  }
  return null;
}

async function translateMissingTexts(
  sourceTexts: string[],
  targetLocale: TranslationTargetLocale
): Promise<string[]> {
  const uniqueTexts = [...new Set(sourceTexts)];
  const cached = await readCachedTranslations(uniqueTexts, targetLocale);
  const missing = uniqueTexts.filter((text) => !cached.has(text));

  if (missing.length > 0) {
    const translated = await translateProtectedTexts(missing, targetLocale);
    if (translated) {
      await writeCachedTranslations(
        missing.map((sourceText, index) => ({
          sourceText,
          translatedText: translated[index] ?? sourceText
        })),
        targetLocale
      );
      missing.forEach((sourceText, index) => {
        cached.set(sourceText, translated[index] ?? sourceText);
      });
    } else {
      missing.forEach((sourceText) => cached.set(sourceText, sourceText));
    }
  }

  return sourceTexts.map((text) => cached.get(text) ?? text);
}

export async function translateTextForLocale(text: string, locale: Locale): Promise<string> {
  const targetLocale = asTargetLocale(locale);
  if (!targetLocale || !text.trim()) {
    return text;
  }

  const cached = await readCachedTranslation(text, targetLocale);
  if (cached) {
    return cached;
  }

  const [translated] = await translateMissingTexts([text], targetLocale);
  if (translated && translated !== text) {
    await writeCachedTranslation(text, targetLocale, translated);
  }
  return translated ?? text;
}

export async function translateTextsForLocale(texts: string[], locale: Locale): Promise<string[]> {
  const targetLocale = asTargetLocale(locale);
  if (!targetLocale) {
    return texts;
  }
  if (texts.length === 0) {
    return texts;
  }
  return translateMissingTexts(texts, targetLocale);
}

export function getCachedTranslatedTexts(texts: string[], locale: Locale) {
  const joinedKey = texts.join("\u0001");
  return unstable_cache(
    () => translateTextsForLocale(texts, locale),
    ["translation-batch", locale, joinedKey],
    { revalidate: false }
  )();
}

const SKIP_OBJECT_KEYS = new Set([
  "buttonHref",
  "href",
  "slug",
  "id",
  "categoryId",
  "imageUrl",
  "closeUpImageUrl",
  "galleryUrls",
  "imageAlt",
  "path",
  "url",
  "price",
  "sortOrder",
  "isActive",
  "createdAt",
  "updatedAt",
  "tags",
  "primaryKeyword"
]);

export async function translateValueForLocale<T>(value: T, locale: Locale, key?: string): Promise<T> {
  const targetLocale = asTargetLocale(locale);
  if (!targetLocale) {
    return value;
  }

  if (typeof value === "string") {
    if (key && SKIP_OBJECT_KEYS.has(key)) {
      return value;
    }
    return (await translateTextForLocale(value, locale)) as T;
  }

  if (Array.isArray(value)) {
    return (await Promise.all(value.map((entry) => translateValueForLocale(entry, locale)))) as T;
  }

  if (value && typeof value === "object") {
    const entries = await Promise.all(
      Object.entries(value as Record<string, unknown>).map(async ([entryKey, entryValue]) => [
        entryKey,
        SKIP_OBJECT_KEYS.has(entryKey)
          ? entryValue
          : await translateValueForLocale(entryValue, locale, entryKey)
      ])
    );
    return Object.fromEntries(entries) as T;
  }

  return value;
}
