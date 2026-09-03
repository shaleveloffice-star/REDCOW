"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { IconClose } from "@/components/shared/site-icons";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  focusElement,
  getFocusableElements,
  inertBackground,
  trapFocus
} from "@/lib/a11y/focus-trap";

const STORAGE_KEY = "nb-opening-announcement-v1";

export function SiteOpeningAnnouncement() {
  const t = useTranslations();
  const titleId = useId();
  const descId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      // private mode / blocked storage — still show once per session
    }
    setOpen(true);
  }, []);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const root = rootRef.current;
    const dialog = dialogRef.current;
    if (!root || !dialog) {
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    const restoreInert = inertBackground(root);
    focusElement(closeRef.current ?? getFocusableElements(dialog)[0]);
    const releaseTrap = trapFocus(dialog);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      releaseTrap();
      restoreInert();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div ref={rootRef} className="opening-announce-root" role="presentation">
      <button
        type="button"
        className="opening-announce-backdrop"
        aria-label={t.openingBanner.popupClose}
        onClick={dismiss}
      />
      <div
        ref={dialogRef}
        className="opening-announce"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <button
          ref={closeRef}
          type="button"
          className="opening-announce-close"
          aria-label={t.openingBanner.popupClose}
          onClick={dismiss}
        >
          <IconClose />
        </button>

        <p className="opening-announce-kicker">NB BURGER</p>
        <h2 id={titleId} className="opening-announce-title">
          {t.openingBanner.popupTitle}
        </h2>

        <div id={descId} className="opening-announce-body">
          <p>{t.openingBanner.popupLead}</p>
          <p>{t.openingBanner.popupBody}</p>
          <p className="opening-announce-closing">{t.openingBanner.popupClosing}</p>
        </div>

        <button type="button" className="opening-announce-cta" onClick={dismiss}>
          {t.openingBanner.popupCta}
        </button>
      </div>
    </div>
  );
}
