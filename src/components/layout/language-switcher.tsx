"use client";

import { LOCALE_ACCESSIBLE_NAMES, LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";
import { useLocale } from "@/components/providers/locale-provider";

const FRAME_SPARKLES = [
  { x: "6%", y: "18%", delay: "0s", size: "sm" },
  { x: "18%", y: "8%", delay: "0.35s", size: "xs" },
  { x: "32%", y: "4%", delay: "0.7s", size: "sm" },
  { x: "48%", y: "2%", delay: "1.1s", size: "xs" },
  { x: "64%", y: "5%", delay: "0.2s", size: "sm" },
  { x: "78%", y: "10%", delay: "0.9s", size: "xs" },
  { x: "92%", y: "22%", delay: "0.45s", size: "sm" },
  { x: "96%", y: "48%", delay: "1.3s", size: "xs" },
  { x: "92%", y: "76%", delay: "0.15s", size: "sm" },
  { x: "78%", y: "90%", delay: "0.8s", size: "xs" },
  { x: "62%", y: "96%", delay: "0.55s", size: "sm" },
  { x: "46%", y: "98%", delay: "1.05s", size: "xs" },
  { x: "30%", y: "94%", delay: "0.25s", size: "sm" },
  { x: "16%", y: "88%", delay: "0.95s", size: "xs" },
  { x: "5%", y: "72%", delay: "0.4s", size: "sm" },
  { x: "2%", y: "48%", delay: "1.2s", size: "xs" }
] as const;

export function LanguageSwitcher() {
  const { locale, setLocale, messages } = useLocale();

  return (
    <div className="language-switcher" role="group" aria-label={messages.lang.label}>
      <span className="language-switcher-frame" aria-hidden="true">
        {FRAME_SPARKLES.map((sparkle, index) => (
          <span
            key={index}
            className={`language-switcher-sparkle is-${sparkle.size}`}
            style={{
              left: sparkle.x,
              top: sparkle.y,
              animationDelay: sparkle.delay
            }}
          />
        ))}
      </span>

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
