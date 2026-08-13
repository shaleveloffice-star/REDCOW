"use client";

import { useRef, useState } from "react";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { formatAdminImageSpec, PRESS_IMAGE_SPEC } from "@/data/admin-image-specs";
import { createId } from "@/lib/admin/new-id";
import { uploadCompressedAdminImage } from "@/lib/client/upload-admin-image";
import { deletePressItemAction, savePressItemAction } from "@/server/actions/press.actions";
import type { PressItem } from "@/types/content";

function newItem(items: PressItem[]): PressItem {
  const now = new Date().toISOString();
  return {
    id: createId("press"),
    title: "",
    source: "",
    url: "",
    imageUrl: "/images/press/best-burger.jpg",
    publishedAt: now,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
}

export function AdminPressManager({ items }: { items: PressItem[] }) {
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [draft, setDraft] = useState<PressItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNew = draft ? !items.some((i) => i.id === draft.id) : false;

  const close = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <>
      <AdminToolbar label="הוסף כתבה" onAdd={() => setDraft(newItem(items))} />
      <table className="table">
        <thead>
          <tr>
            <th>כותרת</th>
            <th>מקור</th>
            <th>תאריך פרסום</th>
            <th>סטטוס</th>
            <th style={{ width: 160 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.source}</td>
              <td>{new Date(item.publishedAt).toLocaleDateString("he-IL")}</td>
              <td>
                <StatusBadge active={item.isActive} />
              </td>
              <td>
                <AdminRowActions
                  disabled={isPending}
                  onDelete={() => {
                    if (!confirmDelete(item.title)) return;
                    run(async () => {
                      await deletePressItemAction(item.id);
                    });
                  }}
                  onEdit={() => setDraft({ ...item })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminModal open={Boolean(draft)} title={isNew ? "הוספת כתבה" : "עריכת כתבה"} onClose={close}>
        {draft ? (
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await savePressItemAction(draft);
              }, close);
            }}
          >
            <label>
              כותרת
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label>
              מקור
              <input required value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} />
            </label>
            <label>
              קישור
              <input required type="url" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
            </label>
            <label>
              כתובת תמונה
              <div className="admin-image-url-field">
                <input required value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} />
                <input
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="admin-gallery-file-input"
                  disabled={uploading || isPending}
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    setError(null);
                    void uploadCompressedAdminImage(file, PRESS_IMAGE_SPEC)
                      .then((uploaded) => {
                        setDraft((current) => (current ? { ...current, imageUrl: uploaded.url } : current));
                      })
                      .catch((err: unknown) => {
                        setError(err instanceof Error ? err.message : "העלאה נכשלה");
                      })
                      .finally(() => {
                        setUploading(false);
                        event.target.value = "";
                      });
                  }}
                />
                <button
                  className="button secondary"
                  disabled={uploading || isPending}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? "דוחס ומעלה…" : "העלה תמונה"}
                </button>
              </div>
            </label>
            <p className="admin-image-spec">{formatAdminImageSpec(PRESS_IMAGE_SPEC)} — נדחס אוטומטית בהעלאה</p>
            <label>
              תאריך פרסום
              <input
                type="datetime-local"
                value={draft.publishedAt.slice(0, 16)}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    publishedAt: new Date(e.target.value).toISOString()
                  })
                }
              />
            </label>
            <label className="admin-checkbox-row">
              <input
                checked={draft.isActive}
                type="checkbox"
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              />
              <span>פעיל</span>
            </label>
            <AdminFormFooter error={error} isPending={isPending} onCancel={close} />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
