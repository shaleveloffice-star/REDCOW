import "server-only";

import type { Locale } from "@/i18n/config";
import {
  applyTranslatedStrings,
  collectTranslatableStrings
} from "@/lib/translation/collect-translatable";
import { readCachedTranslations, writeCachedTranslations } from "@/lib/translation/cache";
import { AUTO_TRANSLATION_ENABLED } from "@/lib/translation/config";
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
  const uniqueTexts = [...new Set(sourceTexts.filter((text) => text.trim()))];
  if (uniqueTexts.length === 0) {
    return sourceTexts;
  }

  const cached = await readCachedTranslations(uniqueTexts, targetLocale);
  const missing = uniqueTexts.filter((text) => !cached.has(text));

  if (missing.length > 0) {
    const translated = await translateProtectedTexts(missing, targetLocale);
    if (translated) {
      try {
        await writeCachedTranslations(
          missing.map((sourceText, index) => ({
            sourceText,
            translatedText: translated[index] ?? sourceText
          })),
          targetLocale
        );
      } catch (error) {
        console.error("[translation] Cache persistence failed after API success", error);
      }

      missing.forEach((sourceText, index) => {
        cached.set(sourceText, translated[index] ?? sourceText);
      });
    } else {
      missing.forEach((sourceText) => cached.set(sourceText, sourceText));
    }
  }

  return sourceTexts.map((text) => cached.get(text) ?? text);
}

export async function translateTextsForLocale(texts: string[], locale: Locale): Promise<string[]> {
  if (!AUTO_TRANSLATION_ENABLED) {
    return texts;
  }
  const targetLocale = asTargetLocale(locale);
  if (!targetLocale) {
    return texts;
  }
  if (texts.length === 0) {
    return texts;
  }
  return translateMissingTexts(texts, targetLocale);
}

export async function translateTextForLocale(text: string, locale: Locale): Promise<string> {
  const targetLocale = asTargetLocale(locale);
  if (!targetLocale || !text.trim()) {
    return text;
  }

  const [translated] = await translateTextsForLocale([text], locale);
  return translated ?? text;
}

export async function translateValueForLocale<T>(value: T, locale: Locale): Promise<T> {
  if (!AUTO_TRANSLATION_ENABLED) {
    return value;
  }
  const targetLocale = asTargetLocale(locale);
  if (!targetLocale) {
    return value;
  }

  const strings = [...collectTranslatableStrings(value)];
  if (strings.length === 0) {
    return value;
  }

  const translatedStrings = await translateTextsForLocale(strings, locale);
  const translationMap = new Map(strings.map((source, index) => [source, translatedStrings[index] ?? source]));

  return applyTranslatedStrings(value, translationMap);
}
