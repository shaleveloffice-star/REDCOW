"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";

export function AdminToolbar({
  onAdd,
  label = "הוסף חדש",
  children
}: {
  onAdd?: () => void;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar-start">{children}</div>
      {onAdd ? (
        <button className="button" type="button" onClick={onAdd}>
          {label}
        </button>
      ) : null}
    </div>
  );
}

export function AdminRowActions({
  onEdit,
  onDelete,
  disabled
}: {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="admin-row-actions">
      <button className="button secondary" disabled={disabled} type="button" onClick={onEdit}>
        עריכה
      </button>
      <button className="button secondary admin-btn-danger" disabled={disabled} type="button" onClick={onDelete}>
        מחק
      </button>
    </div>
  );
}

export function AdminModal({
  title,
  open,
  onClose,
  stacked = false,
  size = "default",
  children
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  stacked?: boolean;
  size?: "default" | "wide" | "xl";
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`admin-modal-backdrop${stacked ? " admin-modal-backdrop--stacked" : ""}`}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        aria-labelledby="admin-modal-title"
        className={`admin-modal${size === "wide" ? " admin-modal--wide" : ""}${size === "xl" ? " admin-modal--xl" : ""}`}
        role="dialog"
      >
        <h3 id="admin-modal-title">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function AdminFormFooter({
  isPending,
  error,
  onCancel,
  submitLabel = "שמור"
}: {
  isPending: boolean;
  error: string | null;
  onCancel: () => void;
  submitLabel?: string;
}) {
  return (
    <>
      {error ? (
        <p className="admin-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="admin-form-actions">
        <button className="button" disabled={isPending} type="submit">
          {isPending ? "שומר…" : submitLabel}
        </button>
        <button className="button secondary" disabled={isPending} type="button" onClick={onCancel}>
          ביטול
        </button>
      </div>
    </>
  );
}

export function useAdminMutation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (task: () => Promise<void>, onSuccess?: () => void) => {
    setError(null);
    startTransition(async () => {
      try {
        await task();
        await router.refresh();
        onSuccess?.();
      } catch (err) {
        const raw = err instanceof Error ? err.message : "פעולה נכשלה";
        const message =
          /digest|Server Components render|omitted in production/i.test(raw)
            ? "הפעולה נכשלה בשרת. נסו שוב או רעננו את הדף."
            : raw;
        setError(message);
      }
    });
  };

  const confirmDelete = (label: string) =>
    window.confirm(`למחוק את "${label}"? לא ניתן לשחזר בזיכרון המקומי.`);

  return { isPending, error, setError, run, confirmDelete };
}
