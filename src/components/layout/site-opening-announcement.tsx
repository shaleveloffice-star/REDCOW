"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { IconClose } from "@/components/shared/site-icons";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  focusElement,
  getFocusableElements,
  inertBackground,
  trapFocus
} from "@/lib/a11y/focus-trap";
import { isSafePublicHref } from "@/lib/security/safe-url";
import type { AnnouncementPopupConfig } from "@/types/content";

const STORAGE_PREFIX = "nb-announcement-popup:";

type StoredDismiss = {
  version: string;
  dismissedAt: number;
};

function storageKey(version: string) {
  return `${STORAGE_PREFIX}${version.trim() || "v1"}`;
}

function wasDismissed(config: AnnouncementPopupConfig): boolean {
  try {
    const raw = window.localStorage.getItem(storageKey(config.version));
    if (!raw) return false;
    const parsed = JSON.parse(raw) as StoredDismiss;
    if (!parsed || parsed.version !== config.version) return false;
    if (!config.dismissDays || config.dismissDays <= 0) return true;
    const expiresAt = parsed.dismissedAt + config.dismissDays * 24 * 60 * 60 * 1000;
    return Date.now() < expiresAt;
  } catch {
    return false;
  }
}

function rememberDismiss(config: AnnouncementPopupConfig) {
  try {
    const payload: StoredDismiss = {
      version: config.version,
      dismissedAt: Date.now()
    };
    window.localStorage.setItem(storageKey(config.version), JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function splitBody(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

type SiteOpeningAnnouncementProps = {
  config: AnnouncementPopupConfig;
};

export function SiteOpeningAnnouncement({ config }: SiteOpeningAnnouncementProps) {
  const t = useTranslations();
  const titleId = useId();
  const descId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const paragraphs = useMemo(() => splitBody(config.body), [config.body]);
  const safeHref = config.ctaHref.trim() && isSafePublicHref(config.ctaHref) ? config.ctaHref.trim() : "";
  const showImage =
    config.imagePosition !== "none" && Boolean(config.imageUrl.trim());

  useEffect(() => {
    if (!config.enabled || !config.title.trim()) return;
    if (wasDismissed(config)) return;

    const delayMs = Math.max(0, config.delaySeconds) * 1000;
    const timer = window.setTimeout(() => setOpen(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [config]);

  const dismiss = useCallback(() => {
    rememberDismiss(config);
    setOpen(false);
  }, [config]);

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

  const image = showImage ? (
    <div className="opening-announce-media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={config.imageUrl.trim()}
        alt={config.imageAlt.trim() || config.title}
        className="opening-announce-image"
      />
    </div>
  ) : null;

  const ctaClassName = "opening-announce-cta";
  const ctaLabel = config.ctaLabel.trim() || t.openingBanner.popupCta;

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
        aria-describedby={paragraphs.length ? descId : undefined}
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

        {config.imagePosition === "top" ? image : null}

        {config.kicker.trim() ? (
          <p className="opening-announce-kicker">{config.kicker.trim()}</p>
        ) : null}

        <h2 id={titleId} className="opening-announce-title">
          {config.title.trim()}
        </h2>

        {paragraphs.length > 0 ? (
          <div id={descId} className="opening-announce-body">
            {paragraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 24)}`}
                className={index === paragraphs.length - 1 ? "opening-announce-closing" : undefined}
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {config.imagePosition === "bottom" ? image : null}

        {safeHref ? (
          <a
            className={ctaClassName}
            href={safeHref}
            target={config.ctaOpenInNewTab ? "_blank" : undefined}
            rel={config.ctaOpenInNewTab ? "noopener noreferrer" : undefined}
            onClick={dismiss}
          >
            {ctaLabel}
          </a>
        ) : (
          <button type="button" className={ctaClassName} onClick={dismiss}>
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
