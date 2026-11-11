"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { IconLanguage } from "@/components/shared/site-icons";
import { LOCALE_ACCESSIBLE_NAMES, LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";

const LANGUAGE_PREVIEW_INTERVAL = 5000;

export function FloatingLanguageButton() {
  const { locale, setLocale, messages } = useLocale();
  const [open, setOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(() => LOCALES.indexOf(locale));
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const selectedIndex = LOCALES.indexOf(locale);
    setPreviewIndex(selectedIndex);
    if (open) return;
    let steps: number[] = [];
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      steps = [];
      setPreviewIndex((selectedIndex + 1) % LOCALES.length);
      for (let step = 2; step <= LOCALES.length; step++) {
        steps.push(window.setTimeout(() => {
          setPreviewIndex((selectedIndex + step) % LOCALES.length);
        }, (step - 1) * 180));
      }
    }, LANGUAGE_PREVIEW_INTERVAL);
    return () => {
      window.clearInterval(timer);
      steps.forEach(id => window.clearTimeout(id));
    };
  }, [locale, open]);
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectLocale = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`floating-lang floating-lang-glass is-expanded${open ? " is-open" : ""}`}
    >
      {open ? (
        <div id={menuId} className="floating-lang-menu" role="menu" aria-label={messages.lang.label}>
          {LOCALES.map((code) => {
            const isActive = code === locale;
            return (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                className={`floating-lang-option${isActive ? " is-active" : ""}`}
                aria-checked={isActive}
                aria-label={`${messages.lang.switchTo}: ${LOCALE_ACCESSIBLE_NAMES[code]}`}
                onClick={() => selectLocale(code)}
              >
                <span className="floating-lang-option-code">{LOCALE_LABELS[code]}</span>
                <span className="floating-lang-option-name">{LOCALE_ACCESSIBLE_NAMES[code]}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <button
        type="button"
        className="floating-lang-toggle"
        aria-label={messages.lang.label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <IconLanguage className="floating-lang-icon" />
        <span className="floating-lang-current" aria-hidden="true" dir="auto">
          {LOCALE_LABELS[open ? locale : LOCALES[previewIndex]]}
        </span>
      </button>
    </div>
  );
}
