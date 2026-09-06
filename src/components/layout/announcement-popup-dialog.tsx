"use client";

import { IconClose } from "@/components/shared/site-icons";
import { transparencyToOpacity } from "@/lib/announcement-popup/theme";
import { isSafePublicHref } from "@/lib/security/safe-url";
import type { AnnouncementPopupConfig } from "@/types/content";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type Ref } from "react";

function splitBody(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export type AnnouncementEditableField = "kicker" | "title" | "body" | "ctaLabel";

type AnnouncementPopupDialogProps = {
  config: AnnouncementPopupConfig;
  /** Preview mode skips real navigation / dismiss persistence. */
  preview?: boolean;
  /** Allow clicking text/button in preview to edit inline. */
  editable?: boolean;
  onFieldChange?: (field: AnnouncementEditableField, value: string) => void;
  /** Opens gallery picker from the preview media area. */
  onRequestImagePick?: () => void;
  titleId?: string;
  descId?: string;
  closeRef?: Ref<HTMLButtonElement>;
  dialogRef?: Ref<HTMLDivElement>;
  onDismiss?: () => void;
  closeLabel?: string;
  ctaFallbackLabel?: string;
};

export function buildAnnouncementOverlayStyle(config: AnnouncementPopupConfig): CSSProperties {
  return {
    ["--announce-overlay" as string]: config.overlayColor || "#000000",
    ["--announce-overlay-opacity" as string]: String(
      transparencyToOpacity(config.overlayTransparency ?? 22)
    )
  };
}

function buildThemeStyle(config: AnnouncementPopupConfig): CSSProperties {
  return {
    ["--announce-bg" as string]: config.backgroundColor || "#000000",
    ["--announce-bg-opacity" as string]: String(
      transparencyToOpacity(config.backgroundTransparency ?? 0)
    ),
    ["--announce-text" as string]: config.textColor || "#ffffff",
    ["--announce-muted" as string]: config.mutedTextColor || "#b8b8b8",
    ["--announce-border" as string]: config.borderColor || "#ffffff",
    ["--announce-cta-bg" as string]: config.ctaBackgroundColor || "#ffffff",
    ["--announce-cta-text" as string]: config.ctaTextColor || "#000000",
    ["--announce-image-opacity" as string]: String(
      transparencyToOpacity(config.imageTransparency ?? 0)
    )
  };
}

export function AnnouncementPopupDialog({
  config,
  preview = false,
  editable = false,
  onFieldChange,
  onRequestImagePick,
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
  const [editingField, setEditingField] = useState<AnnouncementEditableField | null>(null);
  const editInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!editingField) return;
    editInputRef.current?.focus();
    if (editInputRef.current && "select" in editInputRef.current) {
      editInputRef.current.select();
    }
  }, [editingField]);

  const startEdit = (field: AnnouncementEditableField) => {
    if (!editable) return;
    setEditingField(field);
  };

  const stopEdit = () => setEditingField(null);

  const image = showImage ? (
    <div
      className={`opening-announce-media${editable && onRequestImagePick ? " is-editable-target" : ""}`}
      role={editable && onRequestImagePick ? "button" : undefined}
      tabIndex={editable && onRequestImagePick ? 0 : undefined}
      onClick={
        editable && onRequestImagePick
          ? (event) => {
              event.preventDefault();
              onRequestImagePick();
            }
          : undefined
      }
      onKeyDown={
        editable && onRequestImagePick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onRequestImagePick();
              }
            }
          : undefined
      }
      title={editable ? "לחצו לבחירת תמונה מהגלריה" : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={config.imageUrl.trim()}
        alt={config.imageAlt.trim() || config.title}
        className="opening-announce-image"
      />
      {editable && onRequestImagePick ? (
        <span className="opening-announce-media-edit">החלף תמונה</span>
      ) : null}
    </div>
  ) : editable && onRequestImagePick ? (
    <button
      type="button"
      className="opening-announce-media-placeholder"
      onClick={onRequestImagePick}
    >
      בחרו תמונה מהגלריה
    </button>
  ) : null;

  const ctaClassName = `opening-announce-cta is-width-${ctaWidth}${
    editable ? " is-editable-target" : ""
  }`;

  const cta =
    editable && editingField === "ctaLabel" ? (
      <input
        ref={(node) => {
          editInputRef.current = node;
        }}
        className="opening-announce-inline-input is-cta"
        value={config.ctaLabel}
        onChange={(e) => onFieldChange?.("ctaLabel", e.target.value)}
        onBlur={stopEdit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") {
            e.preventDefault();
            stopEdit();
          }
        }}
        aria-label="עריכת טקסט כפתור"
      />
    ) : safeHref && !preview && !editable ? (
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
        onClick={
          editable
            ? () => startEdit("ctaLabel")
            : preview
              ? undefined
              : onDismiss
        }
        tabIndex={preview && !editable ? -1 : undefined}
      >
        {ctaLabel}
      </button>
    );

  return (
    <div
      ref={dialogRef}
      className={`opening-announce is-align-${textAlign}${editable ? " is-editable" : ""}`}
      style={buildThemeStyle(config)}
      role={preview || editable ? "presentation" : "dialog"}
      aria-modal={preview || editable ? undefined : true}
      aria-labelledby={titleId}
      aria-describedby={paragraphs.length ? descId : undefined}
    >
      <button
        ref={closeRef}
        type="button"
        className="opening-announce-close"
        aria-label={closeLabel}
        onClick={preview || editable ? undefined : onDismiss}
        tabIndex={preview || editable ? -1 : undefined}
      >
        <IconClose />
      </button>

      {config.imagePosition === "top" ||
      (editable && onRequestImagePick && config.imagePosition === "none")
        ? image
        : null}

      {editable && editingField === "kicker" ? (
        <input
          ref={(node) => {
            editInputRef.current = node;
          }}
          className="opening-announce-inline-input is-kicker"
          value={config.kicker}
          onChange={(e) => onFieldChange?.("kicker", e.target.value)}
          onBlur={stopEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              e.preventDefault();
              stopEdit();
            }
          }}
          placeholder="קיקור"
          aria-label="עריכת קיקור"
        />
      ) : config.kicker.trim() || editable ? (
        <p
          className={`opening-announce-kicker${editable ? " is-editable-target" : ""}`}
          onClick={() => startEdit("kicker")}
          onKeyDown={(e) => {
            if (editable && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              startEdit("kicker");
            }
          }}
          role={editable ? "button" : undefined}
          tabIndex={editable ? 0 : undefined}
        >
          {config.kicker.trim() || (editable ? "לחצו להוספת קיקור" : null)}
        </p>
      ) : null}

      {editable && editingField === "title" ? (
        <input
          ref={(node) => {
            editInputRef.current = node;
          }}
          className="opening-announce-inline-input is-title"
          value={config.title}
          onChange={(e) => onFieldChange?.("title", e.target.value)}
          onBlur={stopEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              e.preventDefault();
              stopEdit();
            }
          }}
          aria-label="עריכת כותרת"
        />
      ) : (
        <h2
          id={titleId}
          className={`opening-announce-title${editable ? " is-editable-target" : ""}`}
          onClick={() => startEdit("title")}
          onKeyDown={(e) => {
            if (editable && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              startEdit("title");
            }
          }}
          role={editable ? "button" : undefined}
          tabIndex={editable ? 0 : undefined}
        >
          {config.title.trim() || "כותרת הפופ־אפ"}
        </h2>
      )}

      {editable && editingField === "body" ? (
        <textarea
          ref={(node) => {
            editInputRef.current = node;
          }}
          className="opening-announce-inline-input is-body"
          rows={6}
          value={config.body}
          onChange={(e) => onFieldChange?.("body", e.target.value)}
          onBlur={stopEdit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              stopEdit();
            }
          }}
          aria-label="עריכת גוף ההודעה"
        />
      ) : paragraphs.length > 0 || editable ? (
        <div
          id={descId}
          className={`opening-announce-body${editable ? " is-editable-target" : ""}`}
          onClick={() => startEdit("body")}
          onKeyDown={(e) => {
            if (editable && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              startEdit("body");
            }
          }}
          role={editable ? "button" : undefined}
          tabIndex={editable ? 0 : undefined}
        >
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 24)}`}
                className={index === paragraphs.length - 1 ? "opening-announce-closing" : undefined}
              >
                {paragraph}
              </p>
            ))
          ) : (
            <p>לחצו לעריכת גוף ההודעה</p>
          )}
        </div>
      ) : null}

      {config.imagePosition === "bottom" ? image : null}

      <div className={`opening-announce-actions is-cta-${ctaAlign}`}>{cta}</div>
    </div>
  );
}
