import type { Locale } from "@/i18n/config";

export type TranslationTargetLocale = Exclude<Locale, "he">;

export type TranslationCacheEntry = {
  sourceHash: string;
  targetLocale: TranslationTargetLocale;
  sourceText: string;
  translatedText: string;
  updatedAt: string;
};
