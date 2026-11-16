"use client";

import { useId, useRef, type ReactNode } from "react";

import { isSafePublicHref } from "@/lib/security/safe-url";

type AdminMarkdownTextareaProps = {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  hint?: ReactNode;
  /** Show H1–H5 heading tools (story long-content). */
  enableHeadings?: boolean;
  id?: string;
};

const HEADING_LEVELS = [1, 2, 3, 4, 5] as const;

export function AdminMarkdownTextarea({
  label,
  value,
  onChange,
  rows = 6,
  required,
  placeholder,
  hint,
  enableHeadings = false,
  id
}: AdminMarkdownTextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const replaceSelection = (nextChunk: string, selectOffset = 0) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + nextChunk + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      const caret = start + nextChunk.length + selectOffset;
      textarea.setSelectionRange(caret, caret);
    });
  };

  const setLineLevel = (level: number) => {
    const textarea = textareaRef.current;
    const caret = textarea ? textarea.selectionStart : value.length;
    const lineStart = value.lastIndexOf("\n", caret - 1) + 1;
    const lineEndIndex = value.indexOf("\n", caret);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const text = value.slice(lineStart, lineEnd).replace(/^#{1,6}\s*/, "");
    const line = level > 0 ? `${"#".repeat(level)} ${text}` : text;
    onChange(value.slice(0, lineStart) + line + value.slice(lineEnd));
    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(lineStart + line.length, lineStart + line.length);
    });
  };

  const wrapSelectionAsLink = () => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? 0;
    const end = textarea?.selectionEnd ?? 0;
    const selected = value.slice(start, end).trim() || "טקסט קישור";
    const raw = window.prompt("כתובת הקישור (למשל /menu או https://…)", selected.startsWith("http") ? selected : "/");
    if (raw === null) return;
    const href = raw.trim();
    if (!href || !isSafePublicHref(href)) {
      window.alert("קישור לא תקין. השתמשו בנתיב באתר כמו /menu או בכתובת http/https.");
      return;
    }
    replaceSelection(`[${selected}](${href})`);
  };

  return (
    <div className="admin-markdown-textarea">
      <label htmlFor={textareaId}>{label}</label>
      <div className="admin-row-actions" role="toolbar" aria-label="עיצוב טקסט">
        {enableHeadings
          ? HEADING_LEVELS.map((level) => (
              <button
                key={level}
                className="button secondary"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setLineLevel(level)}
              >
                H{level}
              </button>
            ))
          : null}
        {enableHeadings ? (
          <button
            className="button secondary"
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setLineLevel(0)}
          >
            טקסט רגיל
          </button>
        ) : null}
        <button
          className="button secondary"
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={wrapSelectionAsLink}
        >
          קישור
        </button>
      </div>
      <textarea
        id={textareaId}
        ref={textareaRef}
        required={required}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <span className="admin-field-hint">{hint}</span> : null}
    </div>
  );
}
