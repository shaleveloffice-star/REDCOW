"use client";

import { Pipette } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const SWATCHES = [
  "#000000",
  "#111111",
  "#1f2937",
  "#ffffff",
  "#f8fafc",
  "#2563eb",
  "#0ea5e9",
  "#16a34a",
  "#dc2626",
  "#d97706",
  "#7c3aed",
  "#db2777"
] as const;

function normalizeDraftHex(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function isValidHex(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);
}

function toNativeColor(value: string): string {
  const hex = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(hex)) return hex;
  if (/^#[0-9a-f]{3}$/.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return "#000000";
}

type AdminColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function AdminColorField({ label, value, onChange }: AdminColorFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [eyedropperError, setEyedropperError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const supportsEyeDropper =
    typeof window !== "undefined" && "EyeDropper" in window;

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const commit = (next: string) => {
    const normalized = normalizeDraftHex(next).toLowerCase();
    if (!isValidHex(normalized)) return;
    setDraft(normalized);
    onChange(normalized);
    setEyedropperError(null);
  };

  const pickWithEyeDropper = async () => {
    setEyedropperError(null);
    try {
      // EyeDropper is Chromium-only; typed loosely for portability.
      const EyeDropperCtor = (
        window as Window & {
          EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
        }
      ).EyeDropper;
      if (!EyeDropperCtor) {
        setEyedropperError("טפטפת לא נתמכת בדפדפן זה.");
        return;
      }
      const result = await new EyeDropperCtor().open();
      commit(result.sRGBHex);
    } catch {
      setEyedropperError("בחירת צבע בוטלה.");
    }
  };

  return (
    <div className="admin-color-field" ref={rootRef}>
      <button
        type="button"
        className="admin-color-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="admin-color-swatch" style={{ background: value }} aria-hidden />
        <span className="admin-color-trigger-copy">
          <strong>{label}</strong>
          <em>{value}</em>
        </span>
      </button>

      {open ? (
        <div className="admin-color-panel" id={panelId} role="dialog" aria-label={label}>
          <div className="admin-color-swatches" role="list">
            {SWATCHES.map((swatch) => (
              <button
                key={swatch}
                type="button"
                className={`admin-color-chip${value.toLowerCase() === swatch ? " is-active" : ""}`}
                style={{ background: swatch }}
                aria-label={swatch}
                title={swatch}
                onClick={() => commit(swatch)}
              />
            ))}
          </div>

          <div className="admin-color-row">
            <label className="admin-color-native">
              <span className="sr-only">בוחר צבע</span>
              <input
                type="color"
                value={toNativeColor(value)}
                onChange={(e) => commit(e.target.value)}
              />
            </label>
            <input
              className="admin-color-hex"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => commit(draft)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commit(draft);
                }
              }}
              placeholder="#000000"
              spellCheck={false}
              aria-label="קוד צבע"
            />
            {supportsEyeDropper ? (
              <button
                type="button"
                className="admin-color-eyedropper"
                onClick={() => void pickWithEyeDropper()}
                title="טפטפת צבע"
              >
                <Pipette size={15} aria-hidden />
                טפטפת
              </button>
            ) : null}
          </div>

          {eyedropperError ? (
            <p className="admin-form-hint" role="status">
              {eyedropperError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
