"use client";

import { usePathname } from "next/navigation";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";

import { useTranslations } from "@/components/providers/locale-provider";
import { IconAccessible, IconClose } from "@/components/shared/site-icons";
import {
  focusElement,
  getFocusableElements,
  inertBackground,
  isFocusRestoreTarget,
  trapFocus
} from "@/lib/a11y/focus-trap";
import {
  DEFAULT_A11Y_PREFERENCES,
  applyA11yPreferences,
  readA11yPreferences,
  saveA11yPreferences,
  type A11yPreferences
} from "@/lib/a11y/preferences";

export function AccessibilityWidget() {
  const t = useTranslations();
  const pathname = usePathname();
  const titleId = useId();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPreferences>(DEFAULT_A11Y_PREFERENCES);

  const isAdmin = pathname.startsWith("/admin");

  useLayoutEffect(() => {
    const stored = readA11yPreferences();
    setPrefs(stored);
    applyA11yPreferences(stored);
  }, []);

  const updatePrefs = useCallback((next: A11yPreferences) => {
    setPrefs(next);
    saveA11yPreferences(next);
  }, []);

  useLayoutEffect(() => {
    if (!open || isAdmin) return;

    const opener =
      (toggleRef.current && toggleRef.current.isConnected ? toggleRef.current : null) ??
      (document.activeElement instanceof HTMLElement ? document.activeElement : null);

    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) {
      return;
    }

    const restoreInert = inertBackground(root);
    focusElement(closeRef.current ?? getFocusableElements(panel)[0]);
    const releaseTrap = trapFocus(panel);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      releaseTrap();
      restoreInert();
      window.removeEventListener("keydown", onKeyDown);
      if (isFocusRestoreTarget(opener)) {
        focusElement(opener);
      }
    };
  }, [open, isAdmin]);

  if (isAdmin) {
    return null;
  }

  return (
    <div ref={rootRef} className="a11y-widget">
      <button
        ref={toggleRef}
        type="button"
        className="a11y-widget-toggle"
        aria-label={open ? t.a11y.closeWidget : t.a11y.openWidget}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
      >
        <IconAccessible className="a11y-widget-toggle-icon" />
        <span className="a11y-widget-toggle-label">{t.a11y.openWidget}</span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className="a11y-widget-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="a11y-widget-panel-head">
            <h2 id={titleId} className="a11y-widget-panel-title">
              {t.a11y.widgetTitle}
            </h2>
            <button
              ref={closeRef}
              type="button"
              className="a11y-widget-close"
              aria-label={t.a11y.closeWidget}
              onClick={() => setOpen(false)}
            >
              <IconClose />
            </button>
          </div>

          <div className="a11y-widget-group">
            <p className="a11y-widget-label" id={`${panelId}-text`}>
              {t.a11y.textSize}
            </p>
            <div className="a11y-widget-text-controls" role="group" aria-labelledby={`${panelId}-text`}>
              <button
                type="button"
                className="a11y-widget-action"
                onClick={() => updatePrefs({ ...prefs, font: Math.max(0, prefs.font - 1) as A11yPreferences["font"] })}
                disabled={prefs.font === 0}
              >
                {t.a11y.decreaseText}
              </button>
              <span className="a11y-widget-text-value" aria-live="polite">
                {prefs.font === 0 ? "100%" : prefs.font === 1 ? "115%" : "130%"}
              </span>
              <button
                type="button"
                className="a11y-widget-action"
                onClick={() => updatePrefs({ ...prefs, font: Math.min(2, prefs.font + 1) as A11yPreferences["font"] })}
                disabled={prefs.font === 2}
              >
                {t.a11y.increaseText}
              </button>
            </div>
          </div>

          <div className="a11y-widget-actions">
            <button
              type="button"
              className="a11y-widget-toggle-option"
              aria-pressed={prefs.contrast}
              onClick={() => updatePrefs({ ...prefs, contrast: !prefs.contrast })}
            >
              {t.a11y.highContrast}
            </button>
            <button
              type="button"
              className="a11y-widget-toggle-option"
              aria-pressed={prefs.links}
              onClick={() => updatePrefs({ ...prefs, links: !prefs.links })}
            >
              {t.a11y.highlightLinks}
            </button>
            <button
              type="button"
              className="a11y-widget-toggle-option"
              aria-pressed={prefs.motion}
              onClick={() => updatePrefs({ ...prefs, motion: !prefs.motion })}
            >
              {t.a11y.reduceMotion}
            </button>
          </div>

          <button
            type="button"
            className="a11y-widget-reset"
            onClick={() => updatePrefs({ ...DEFAULT_A11Y_PREFERENCES })}
          >
            {t.a11y.reset}
          </button>

          <a className="a11y-widget-statement" href="/accessibility" onClick={() => setOpen(false)}>
            {t.footer.accessibility}
          </a>
        </div>
      ) : null}
    </div>
  );
}
