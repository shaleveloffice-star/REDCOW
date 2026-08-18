export const LOCALES = ["he", "en", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "he";

export const LOCALE_COOKIE = "nb-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  he: "עב",
  en: "EN",
  fr: "FR"
};

export const LOCALE_ACCESSIBLE_NAMES: Record<Locale, string> = {
  he: "עברית",
  en: "English",
  fr: "Français"
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value !== undefined && value !== null && LOCALES.includes(value as Locale);
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "he" ? "rtl" : "ltr";
}
