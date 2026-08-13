"use client";

import { useState } from "react";

import { useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import { AdminImageUrlField } from "@/components/features/admin/admin-site-image-picker";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";
import {
  resetSiteImageOverrideAction,
  saveSiteImageOverrideAction,
  type HomePageSiteImageAdminGroup
} from "@/server/actions/site-image-overrides.actions";

type AdminHomeSiteImagesEditorProps = {
  initialGroups: HomePageSiteImageAdminGroup[];
  pickableImages: AdminPickableImage[];
};

type ImageDraft = {
  url: string;
};

function buildDrafts(groups: HomePageSiteImageAdminGroup[]): Record<string, ImageDraft> {
  const drafts: Record<string, ImageDraft> = {};
  for (const group of groups) {
    for (const item of group.items) {
      drafts[item.id] = { url: item.currentImageUrl };
    }
  }
  return drafts;
}

export function AdminHomeSiteImagesEditor({
  initialGroups,
  pickableImages
}: AdminHomeSiteImagesEditorProps) {
  const { isPending, error, run } = useAdminMutation();
  const [groups, setGroups] = useState(initialGroups);
  const [drafts, setDrafts] = useState(() => buildDrafts(initialGroups));

  const updateDraft = (id: string, url: string) => {
    setDrafts((current) => ({
      ...current,
      [id]: { url }
    }));
  };

  const syncSavedState = (id: string, url: string, isOverridden: boolean) => {
    setDrafts((current) => ({
      ...current,
      [id]: { url }
    }));
    setGroups((current) =>
      current.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === id ? { ...item, currentImageUrl: url, isOverridden } : item
        )
      }))
    );
  };

  return (
    <div className="admin-home-images">
      <p className="admin-field-hint">
        החלפת תמונות לפי סקשנים בדף הבית. לכל תמונה מוצג גודל מומלץ — העלאה נדחסת אוטומטית.
      </p>

      {groups.map((group) => (
        <section key={group.title} className="admin-home-images-group">
          <h3 className="admin-home-images-group-title">{group.title}</h3>
          <div className="admin-home-images-list">
            {group.items.map((item) => {
              const draft = drafts[item.id];
              const isDirty = draft.url.trim() !== item.currentImageUrl.trim();

              return (
                <article key={item.id} className="admin-home-images-item">
                  <div className="admin-home-images-item-head">
                    <div>
                      <strong>{item.label}</strong>
                      <p className="admin-field-hint">{item.location}</p>
                      <p className="admin-image-spec">{item.recommendedSizeLabel}</p>
                    </div>
                    {item.isOverridden ? (
                      <span className="admin-home-images-badge">מותאם</span>
                    ) : null}
                  </div>

                  <AdminImageUrlField
                    label="כתובת תמונה"
                    value={draft.url}
                    required
                    images={pickableImages}
                    spec={item.spec}
                    onChange={(url) => updateDraft(item.id, url)}
                  />

                  <div className="admin-form-actions admin-home-images-item-actions">
                    <button
                      className="button"
                      disabled={isPending || !isDirty || !draft.url.trim()}
                      type="button"
                      onClick={() =>
                        run(async () => {
                          await saveSiteImageOverrideAction({
                            id: item.id,
                            imageUrl: draft.url
                          });
                          syncSavedState(item.id, draft.url.trim(), true);
                        })
                      }
                    >
                      {isPending ? "שומר…" : "שמור תמונה"}
                    </button>
                    {item.isOverridden ? (
                      <button
                        className="button secondary"
                        disabled={isPending}
                        type="button"
                        onClick={() =>
                          run(async () => {
                            await resetSiteImageOverrideAction(item.id);
                            syncSavedState(item.id, item.defaultImageUrl, false);
                          })
                        }
                      >
                        איפוס לברירת מחדל
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {error ? <p className="admin-form-error">{error}</p> : null}
    </div>
  );
}
