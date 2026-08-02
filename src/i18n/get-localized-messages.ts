import type { Locale } from "@/i18n/config";
import { getMessages, type Messages } from "@/i18n/messages";

/** Static locale messages — no runtime translation. */
export function getLocalizedMessages(locale: Locale): Messages {
  return getMessages(locale);
}
