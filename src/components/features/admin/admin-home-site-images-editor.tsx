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
  desktop: string;
  mobile: string;
};

function buildDrafts(groups: HomePageSiteImageAdminGroup[]): Record<string, ImageDraft> {
  const drafts: Record<string, ImageDraft> = {};
  for (const group of groups) {
    for (const item of group.items) {
      drafts[item.id] = {
        desktop: item.desktopImageUrl || item.defaultImageUrl,
        mobile: item.mobileImageUrl
      };
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

  const updateDraft = (id: string, patch: Partial<ImageDraft>) => {
    setDrafts((current) => ({
      ...current,
      [id]: { ...current[id], ...patch }
    }));
  };

  const syncSavedState = (
    id: string,
    desktop: string,
    mobile: string,
    isOverridden: boolean,
    defaultImageUrl: string
  ) => {
    setDrafts((current) => ({
      ...current,
      [id]: { desktop, mobile }
    }));
    setGroups((current) =>
      current.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === id
            ? {
                ...item,
                desktopImageUrl: isOverridden ? desktop : "",
                mobileImageUrl: isOverridden ? mobile : "",
                currentImageUrl: desktop || mobile || defaultImageUrl,
                isOverridden
              }
            : item
        )
      }))
    );
  };

  return (
    <div className="admin-home-images">
      <p className="admin-field-hint">
        לכל תמונה אפשר להעלות גרסה למסך רחב וגרסה למובייל. אם ממלאים רק אחת — היא תשמש גם במסך השני.
        העלאה נדחסת אוטומטית.
      </p>

      {groups.map((group) => (
        <section key={group.title} className="admin-home-images-group">
          <h3 className="admin-home-images-group-title">{group.title}</h3>
          <div className="admin-home-images-list">
            {group.items.map((item) => {
              const draft = drafts[item.id];
              const savedDesktop = item.desktopImageUrl || item.defaultImageUrl;
              const isDirty =
                draft.desktop.trim() !== savedDesktop.trim() ||
                draft.mobile.trim() !== item.mobileImageUrl.trim();
              const canSave = Boolean(draft.desktop.trim() || draft.mobile.trim());

              return (
                <article key={item.id} className="admin-home-images-item">
                  <div className="admin-home-images-item-head">
                    <div>
                      <strong>{item.label}</strong>
                      <p className="admin-field-hint">{item.location}</p>
                    </div>
                    {item.isOverridden ? (
                      <span className="admin-home-images-badge">מותאם</span>
                    ) : null}
                  </div>

                  <div className="admin-home-images-slots">
                    <div className="admin-home-images-slot">
                      <AdminImageUrlField
                        label="מסך רחב (מחשב / טאבלט)"
                        value={draft.desktop}
                        images={pickableImages}
                        spec={item.spec}
                        onChange={(url) => updateDraft(item.id, { desktop: url })}
                      />
                      {!draft.desktop.trim() && draft.mobile.trim() ? (
                        <p className="admin-image-spec">ריק — יוצג מהמובייל</p>
                      ) : null}
                    </div>
                    <div className="admin-home-images-slot">
                      <AdminImageUrlField
                        label="מובייל"
                        value={draft.mobile}
                        images={pickableImages}
                        spec={item.mobileSpec}
                        onChange={(url) => updateDraft(item.id, { mobile: url })}
                      />
                      {!draft.mobile.trim() && draft.desktop.trim() ? (
                        <p className="admin-image-spec">ריק — יוצג ממסך רחב</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="admin-form-actions admin-home-images-item-actions">
                    <button
                      className="button"
                      disabled={isPending || !isDirty || !canSave}
                      type="button"
                      onClick={() =>
                        run(async () => {
                          await saveSiteImageOverrideAction({
                            id: item.id,
                            imageUrl: draft.desktop,
                            mobileImageUrl: draft.mobile
                          });
                          syncSavedState(
                            item.id,
                            draft.desktop.trim(),
                            draft.mobile.trim(),
                            true,
                            item.defaultImageUrl
                          );
                        })
                      }
                    >
                      {isPending ? "שומר…" : "שמור תמונות"}
                    </button>
                    {item.isOverridden ? (
                      <button
                        className="button secondary"
                        disabled={isPending}
                        type="button"
                        onClick={() =>
                          run(async () => {
                            await resetSiteImageOverrideAction(item.id);
                            syncSavedState(
                              item.id,
                              item.defaultImageUrl,
                              "",
                              false,
                              item.defaultImageUrl
                            );
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
