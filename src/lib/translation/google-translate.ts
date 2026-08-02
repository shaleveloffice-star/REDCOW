import "server-only";

import type { TranslationTargetLocale } from "@/lib/translation/types";
import {
  protectTranslatableText,
  restoreProtectedText,
  shouldSkipTranslation
} from "@/lib/translation/protect-terms";

const BATCH_SIZE = 100;

type GoogleTranslateResponse = {
  data?: {
    translations?: Array<{ translatedText?: string }>;
  };
  error?: {
    message?: string;
  };
};

function getApiKey(): string | undefined {
  return process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY?.trim();
}

async function callGoogleTranslateApi(
  texts: string[],
  targetLocale: TranslationTargetLocale
): Promise<string[] | null> {
  const apiKey = getApiKey();
  if (!apiKey || texts.length === 0) {
    return null;
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: texts,
          source: "he",
          target: targetLocale,
          format: "text"
        }),
        cache: "no-store"
      }
    );

    if (!response.ok) {
      console.error(
        "[translation] Google Translate API error",
        response.status,
        await response.text().catch(() => "")
      );
      return null;
    }

    const payload = (await response.json()) as GoogleTranslateResponse;
    if (payload.error) {
      console.error("[translation] Google Translate API error", payload.error.message ?? payload.error);
      return null;
    }

    const translations = payload.data?.translations ?? [];
    return texts.map((source, index) => translations[index]?.translatedText?.trim() || source);
  } catch (error) {
    console.error("[translation] Google Translate request failed", error);
    return null;
  }
}

export async function translateProtectedTexts(
  sourceTexts: string[],
  targetLocale: TranslationTargetLocale
): Promise<string[] | null> {
  const prepared = sourceTexts.map((sourceText) => {
    if (shouldSkipTranslation(sourceText)) {
      return { sourceText, skip: true as const, protectedText: sourceText, segments: [] };
    }
    const { protectedText, segments } = protectTranslatableText(sourceText);
    return { sourceText, skip: false as const, protectedText, segments };
  });

  const toTranslate = prepared.filter((entry) => !entry.skip);
  if (toTranslate.length === 0) {
    return sourceTexts;
  }

  const translatedChunks: string[] = [];

  for (let index = 0; index < toTranslate.length; index += BATCH_SIZE) {
    const chunk = toTranslate.slice(index, index + BATCH_SIZE);
    const apiResult = await callGoogleTranslateApi(
      chunk.map((entry) => entry.protectedText),
      targetLocale
    );
    if (!apiResult) {
      return null;
    }
    translatedChunks.push(...apiResult);
  }

  let translatedIndex = 0;
  return prepared.map((entry) => {
    if (entry.skip) {
      return entry.sourceText;
    }
    const translated = translatedChunks[translatedIndex] ?? entry.sourceText;
    translatedIndex += 1;
    return restoreProtectedText(translated, entry.segments);
  });
}
