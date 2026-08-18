"use client";

import { LOCALE_ACCESSIBLE_NAMES, LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";
import { useLocale } from "@/components/providers/locale-provider";

export function LanguageSwitcher() {
  const { locale, setLocale, messages } = useLocale();

  return (
    <div className="language-switcher" role="group" aria-label={messages.lang.label}>
      {LOCALES.map((code) => {
        const isActive = code === locale;

        return (
          <button
            key={code}
            type="button"
            className={`language-switcher-btn${isActive ? " is-active" : ""}`}
            aria-label={`${messages.lang.switchTo}: ${LOCALE_ACCESSIBLE_NAMES[code]}`}
            aria-pressed={isActive}
            onClick={() => setLocale(code as Locale)}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
