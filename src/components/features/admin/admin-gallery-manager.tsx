"use client";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { createId } from "@/lib/admin/new-id";
import { deleteGalleryItemAction, saveGalleryItemAction } from "@/server/actions/gallery.actions";
import type { GalleryItem } from "@/types/content";
import { useState } from "react";

function newItem(items: GalleryItem[]): GalleryItem {
  const now = new Date().toISOString();
  return {
    id: createId("gallery"),
    title: "",
    imageUrl: "/images/gallery/burger.jpg",
    alt: "",
    category: "food",
    sortOrder: items.length + 1,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
}

export function AdminGalleryManager({ items }: { items: GalleryItem[] }) {
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [draft, setDraft] = useState<GalleryItem | null>(null);
  const isNew = draft ? !items.some((i) => i.id === draft.id) : false;

  const close = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <>
      <AdminToolbar label="הוסף תמונה" onAdd={() => setDraft(newItem(items))} />
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 72 }}>תמונה</th>
            <th>כותרת</th>
            <th>קטגוריה</th>
            <th>Alt</th>
            <th>סטטוס</th>
            <th style={{ width: 160 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <img alt="" className="admin-menu-thumb" height={56} src={item.imageUrl} width={56} loading="lazy" />
              </td>
              <td>{item.title}</td>
              <td>{item.category}</td>
              <td>{item.alt}</td>
              <td>
                <StatusBadge active={item.isActive} />
              </td>
              <td>
                <AdminRowActions
                  disabled={isPending}
                  onDelete={() => {
                    if (!confirmDelete(item.title)) return;
                    run(async () => {
                      await deleteGalleryItemAction(item.id);
                    });
                  }}
                  onEdit={() => setDraft({ ...item })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminModal open={Boolean(draft)} title={isNew ? "הוספת תמונה" : "עריכת תמונה"} onClose={close}>
        {draft ? (
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await saveGalleryItemAction(draft);
              }, close);
            }}
          >
            <label>
              כותרת
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label>
              כתובת תמונה
              <input required value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} />
            </label>
            <label>
              טקסט חלופי (Alt)
              <input required value={draft.alt} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} />
            </label>
            <label>
              קטגוריה
              <input required value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
            </label>
            <label>
              סדר
              <input
                min={0}
                type="number"
                value={draft.sortOrder}
                onChange={(e) => setDraft({ ...draft, sortOrder: parseInt(e.target.value, 10) || 0 })}
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
