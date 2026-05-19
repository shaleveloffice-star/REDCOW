"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { saveMenuItemAction } from "@/server/actions/menu.actions";
import type { MenuItem } from "@/types/content";
import { StatusBadge } from "@/components/features/admin/status-badge";

export function AdminMenuTable({
  items,
  categoryById
}: {
  items: MenuItem[];
  categoryById: Record<string, string>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<MenuItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!draft) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDraft(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft]);

  const closeModal = () => {
    setDraft(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setError(null);
    startTransition(async () => {
      try {
        await saveMenuItemAction(draft);
        closeModal();
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "שמירה נכשלה";
        setError(message);
      }
    });
  };

  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 72 }}>תמונה</th>
            <th>מנה</th>
            <th>קטגוריה</th>
            <th>מחיר</th>
            <th>סטטוס</th>
            <th style={{ width: 120 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <img
                  alt=""
                  className="admin-menu-thumb"
                  height={56}
                  src={item.imageUrl}
                  width={56}
                  loading="lazy"
                />
              </td>
              <td>
                <strong>{item.name}</strong>
                <p className="muted" style={{ margin: "6px 0 0", maxWidth: 420 }}>
                  {item.description}
                </p>
              </td>
              <td>{categoryById[item.categoryId] ?? "—"}</td>
              <td>{item.price} ש&quot;ח</td>
              <td>
                <StatusBadge active={item.isActive} />
              </td>
              <td>
                <button className="button secondary" type="button" onClick={() => setDraft({ ...item })}>
                  עריכה
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {draft ? (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div aria-labelledby="admin-menu-edit-title" className="admin-modal" role="dialog">
            <h3 id="admin-menu-edit-title" style={{ margin: "0 0 18px" }}>
              עריכת מנה
            </h3>
            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                שם
                <input
                  required
                  maxLength={120}
                  value={draft.name}
                  onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                />
              </label>
              <label>
                תיאור
                <textarea
                  rows={4}
                  maxLength={500}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => (d ? { ...d, description: e.target.value } : d))}
                />
              </label>
              <label>
                מחיר (ש&quot;ח)
                <input
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  type="number"
                  value={Number.isFinite(draft.price) ? draft.price : 0}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setDraft((d) => (d ? { ...d, price: Number.isFinite(v) ? v : 0 } : d));
                  }}
                />
              </label>
              <label>
                כתובת תמונה (URL או נתיב מתוך public, למשל /images/menu/...)
                <input
                  type="text"
                  value={draft.imageUrl}
                  onChange={(e) => setDraft((d) => (d ? { ...d, imageUrl: e.target.value } : d))}
                  placeholder="/images/menu/red-cow-classic.png"
                />
              </label>
              <div className="admin-menu-preview">
                <span className="muted" style={{ fontSize: 12 }}>
                  תצוגה מקדימה
                </span>
                <img
                  alt=""
                  height={120}
                  src={draft.imageUrl.trim() || "/images/menu/placeholder.svg"}
                  width={120}
                  style={{ objectFit: "contain", borderRadius: 12, marginTop: 8 }}
                />
              </div>
              <label className="admin-checkbox-row">
                <input
                  checked={draft.isActive}
                  type="checkbox"
                  onChange={(e) => setDraft((d) => (d ? { ...d, isActive: e.target.checked } : d))}
                />
                <span>מנה פעילה (מוצגת באתר)</span>
              </label>
              {error ? (
                <p className="admin-form-error" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="admin-form-actions">
                <button className="button" disabled={isPending} type="submit">
                  {isPending ? "שומר…" : "שמור"}
                </button>
                <button className="button secondary" disabled={isPending} type="button" onClick={closeModal}>
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
