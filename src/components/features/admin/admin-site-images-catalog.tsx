"use client";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import {
  deleteSiteImageAction,
  updateSiteImageAction
} from "@/server/actions/site-images.actions";
import { uploadSiteImageAction } from "@/server/actions/upload.actions";
import type { SiteImageCatalogItem, SiteImageGroup } from "@/types/site-images";
import { useMemo, useState } from "react";

type AdminSiteImagesCatalogProps = {
  groups: SiteImageGroup[];
};

type DraftState = {
  imageUrl: string;
  label: string;
};

function deleteConfirmMessage(entry: SiteImageCatalogItem): string {
  switch (entry.source) {
    case "static":
      return `להסתיר את "${entry.label}" מהאתר? (ניתן לשחזר בעריכה)`;
    case "settings-hero":
    case "settings-hero-video":
      return `להסיר את מדיה הגיבור מהאתר?`;
    case "settings-og":
      return `להסיר את תמונת השיתוף (OG)?`;
    case "menu":
      return `למחוק את המנה "${entry.label}" מהתפריט?`;
    case "gallery":
      return `למחוק את "${entry.label}" מהגלריה?`;
    case "press":
      return `למחוק את הכתבה "${entry.label}"?`;
    default:
      return `למחוק את "${entry.label}"?`;
  }
}

export function AdminSiteImagesCatalog({ groups }: AdminSiteImagesCatalogProps) {
  const { isPending, error, setError, run } = useAdminMutation();
  const [editing, setEditing] = useState<SiteImageCatalogItem | null>(null);
  const [draft, setDraft] = useState<DraftState>({ imageUrl: "", label: "" });
  const [uploading, setUploading] = useState(false);

  const totalImages = useMemo(
    () => groups.reduce((sum, group) => sum + group.items.length, 0),
    [groups]
  );

  const close = () => {
    setEditing(null);
    setDraft({ imageUrl: "", label: "" });
    setError(null);
  };

  const openEdit = (entry: SiteImageCatalogItem) => {
    setEditing(entry);
    setDraft({ imageUrl: entry.imageUrl, label: entry.label });
    setError(null);
  };

  const onUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const url = await uploadSiteImageAction(formData);
      setDraft((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "העלאה נכשלה";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-site-images">
      <p className="admin-site-images-summary muted">
        סה״כ {totalImages} תמונות ב-{groups.length} קטגוריות. עריכה משנה את התמונה באתר; מחיקה מסירה או מסתירה לפי סוג
        הפריט.
      </p>

      {groups.map((group) => (
        <section key={group.title} className="admin-site-images-group" aria-labelledby={`group-${group.title}`}>
          <h3 id={`group-${group.title}`} className="admin-site-images-group-title">
            {group.title}
            <span className="admin-site-images-group-count">{group.items.length}</span>
          </h3>

          <ul className="admin-site-images-list">
            {group.items.map((entry) => (
              <li key={entry.id} className="admin-site-image-card">
                <div className="admin-site-image-thumb-wrap">
                  {entry.imageUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                    <div className="admin-site-image-video-placeholder">וידאו</div>
                  ) : (
                    <img
                      src={entry.imageUrl}
                      alt=""
                      className="admin-site-image-thumb"
                      loading="lazy"
                      width={120}
                      height={120}
                    />
                  )}
                </div>
                <div className="admin-site-image-meta">
                  <strong className="admin-site-image-label">{entry.label}</strong>
                  <p className="admin-site-image-location muted">{entry.location}</p>
                  <code className="admin-site-image-url">{entry.imageUrl}</code>
                  <AdminRowActions
                    disabled={isPending}
                    onEdit={() => openEdit(entry)}
                    onDelete={() => {
                      if (!window.confirm(deleteConfirmMessage(entry))) return;
                      run(async () => {
                        await deleteSiteImageAction({
                          id: entry.id,
                          source: entry.source,
                          entityId: entry.entityId,
                          label: entry.label
                        });
                      });
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <AdminModal open={Boolean(editing)} title={editing ? `עריכת ${editing.label}` : "עריכת תמונה"} onClose={close}>
        {editing ? (
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await updateSiteImageAction({
                  id: editing.id,
                  source: editing.source,
                  entityId: editing.entityId,
                  imageUrl: draft.imageUrl,
                  label: editing.source === "static" ? draft.label : undefined
                });
              }, close);
            }}
          >
            {editing.source === "static" ? (
              <label>
                שם / תווית
                <input
                  required
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                />
              </label>
            ) : null}
            <label>
              כתובת תמונה (URL)
              <input
                required
                value={draft.imageUrl}
                onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                placeholder="https://... או /images/..."
                dir="ltr"
              />
            </label>
            <label>
              העלאת קובץ מהמחשב
              <input
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploading || isPending}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  void onUpload(file);
                  e.target.value = "";
                }}
              />
            </label>
            {uploading ? <p className="muted">מעלה תמונה…</p> : null}
            <AdminFormFooter isPending={isPending || uploading} error={error} onCancel={close} />
          </form>
        ) : null}
      </AdminModal>
    </div>
  );
}
