"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { IconLanguage } from "@/components/shared/site-icons";
import { LOCALE_ACCESSIBLE_NAMES, LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";

const SCROLL_EXPAND_RATIO = 0.05;

export function FloatingLanguageButton() {
  const { locale, setLocale, messages } = useLocale();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    let frame = 0;

    const updateExpanded = () => {
      frame = 0;
      const pageHeight = Math.max(document.documentElement.scrollHeight, 1);
      setExpanded(window.scrollY >= pageHeight * SCROLL_EXPAND_RATIO);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateExpanded);
    };

    updateExpanded();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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
      className={`floating-lang${open ? " is-open" : ""}${expanded ? " is-expanded" : ""}`}
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
        <span className="floating-lang-current" aria-hidden={!expanded}>
          {LOCALE_LABELS[locale]}
        </span>
      </button>
    </div>
  );
}
