import type { Locale } from "../config";
import { en } from "./en";
import { fr } from "./fr";
import { he } from "./he";
import type { Messages } from "./types";

const messages: Record<Locale, Messages> = {
  he,
  en,
  fr
};

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}

export type { Messages };
