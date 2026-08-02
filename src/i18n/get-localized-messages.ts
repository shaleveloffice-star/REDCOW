import "server-only";

import { cache } from "react";

import type { Locale } from "@/i18n/config";
import { getMessages, type Messages } from "@/i18n/messages";
import { translateValueForLocale } from "@/lib/translation/translate-texts";

export const getLocalizedMessages = cache(async (locale: Locale): Promise<Messages> => {
  if (locale === "he") {
    return getMessages("he");
  }

  try {
    return await translateValueForLocale(getMessages("he"), locale);
  } catch (error) {
    console.error("[translation] Failed to localize UI messages", error);
    return getMessages("he");
  }
});
