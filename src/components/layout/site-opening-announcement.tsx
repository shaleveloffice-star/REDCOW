"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { AnnouncementPopupDialog } from "@/components/layout/announcement-popup-dialog";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  focusElement,
  getFocusableElements,
  inertBackground,
  trapFocus
} from "@/lib/a11y/focus-trap";
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

  useEffect(() => {
    if (!config?.enabled || !config.title?.trim()) return;
    if (wasDismissed(config)) return;

    const delayMs = Math.max(0, config.delaySeconds) * 1000;
    const timer = window.setTimeout(() => setOpen(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [config]);

  const dismiss = useCallback(() => {
    if (!config) return;
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

  if (!config || !open) return null;

  return (
    <div ref={rootRef} className="opening-announce-root" role="presentation">
      <button
        type="button"
        className="opening-announce-backdrop"
        aria-label={t.openingBanner.popupClose}
        onClick={dismiss}
      />
      <AnnouncementPopupDialog
        config={config}
        titleId={titleId}
        descId={descId}
        closeRef={closeRef}
        dialogRef={dialogRef}
        onDismiss={dismiss}
        closeLabel={t.openingBanner.popupClose}
        ctaFallbackLabel={t.openingBanner.popupCta}
      />
    </div>
  );
}
