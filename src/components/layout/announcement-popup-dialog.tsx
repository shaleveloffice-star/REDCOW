"use client";

import { IconClose } from "@/components/shared/site-icons";
import { isSafePublicHref } from "@/lib/security/safe-url";
import type { AnnouncementPopupConfig } from "@/types/content";
import { useMemo, type Ref } from "react";

function splitBody(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

type AnnouncementPopupDialogProps = {
  config: AnnouncementPopupConfig;
  /** Preview mode skips real navigation / dismiss persistence. */
  preview?: boolean;
  titleId?: string;
  descId?: string;
  closeRef?: Ref<HTMLButtonElement>;
  dialogRef?: Ref<HTMLDivElement>;
  onDismiss?: () => void;
  closeLabel?: string;
  ctaFallbackLabel?: string;
};

export function AnnouncementPopupDialog({
  config,
  preview = false,
  titleId = "announcement-title",
  descId = "announcement-desc",
  closeRef,
  dialogRef,
  onDismiss,
  closeLabel = "סגור",
  ctaFallbackLabel = "הבנתי"
}: AnnouncementPopupDialogProps) {
  const paragraphs = useMemo(() => splitBody(config.body ?? ""), [config.body]);
  const safeHref =
    config.ctaHref?.trim() && isSafePublicHref(config.ctaHref) ? config.ctaHref.trim() : "";
  const showImage = config.imagePosition !== "none" && Boolean(config.imageUrl?.trim());
  const textAlign = config.textAlign || "center";
  const ctaAlign = config.ctaAlign || "center";
  const ctaWidth = config.ctaWidth || "full";
  const ctaLabel = config.ctaLabel.trim() || ctaFallbackLabel;

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

  const ctaClassName = `opening-announce-cta is-width-${ctaWidth}`;

  const cta =
    safeHref && !preview ? (
      <a
        className={ctaClassName}
        href={safeHref}
        target={config.ctaOpenInNewTab ? "_blank" : undefined}
        rel={config.ctaOpenInNewTab ? "noopener noreferrer" : undefined}
        onClick={onDismiss}
      >
        {ctaLabel}
      </a>
    ) : (
      <button
        type="button"
        className={ctaClassName}
        onClick={preview ? undefined : onDismiss}
        tabIndex={preview ? -1 : undefined}
      >
        {ctaLabel}
      </button>
    );

  return (
    <div
      ref={dialogRef}
      className={`opening-announce is-align-${textAlign}`}
      role={preview ? "presentation" : "dialog"}
      aria-modal={preview ? undefined : true}
      aria-labelledby={titleId}
      aria-describedby={paragraphs.length ? descId : undefined}
    >
      <button
        ref={closeRef}
        type="button"
        className="opening-announce-close"
        aria-label={closeLabel}
        onClick={preview ? undefined : onDismiss}
        tabIndex={preview ? -1 : undefined}
      >
        <IconClose />
      </button>

      {config.imagePosition === "top" ? image : null}

      {config.kicker.trim() ? (
        <p className="opening-announce-kicker">{config.kicker.trim()}</p>
      ) : null}

      <h2 id={titleId} className="opening-announce-title">
        {config.title.trim() || "כותרת הפופ־אפ"}
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

      <div className={`opening-announce-actions is-cta-${ctaAlign}`}>{cta}</div>
    </div>
  );
}
