"use client";

import { useState } from "react";

import { useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import { AdminImageUrlField } from "@/components/features/admin/admin-site-image-picker";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";
import { isVideoMediaUrl } from "@/lib/menu-media";
import {
  DEFAULT_SITE_IMAGE_OVERLAY_COLOR,
  MAX_SITE_IMAGE_OVERLAY_OPACITY
} from "@/lib/site-image-overlay";
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
  overlayColor: string;
  /** Whole percent, 0–90. */
  overlayPercent: number;
};

const OVERLAY_PRESETS = [
  { color: "#000000", label: "שחור" },
  { color: "#ffffff", label: "לבן" }
] as const;

const MAX_OVERLAY_PERCENT = Math.round(MAX_SITE_IMAGE_OVERLAY_OPACITY * 100);

function buildDrafts(groups: HomePageSiteImageAdminGroup[]): Record<string, ImageDraft> {
  const drafts: Record<string, ImageDraft> = {};
  for (const group of groups) {
    for (const item of group.items) {
      drafts[item.id] = {
        desktop: item.desktopImageUrl || item.defaultImageUrl,
        mobile: item.mobileImageUrl,
        overlayColor: item.overlayColor,
        overlayPercent: Math.round(item.overlayOpacity * 100)
      };
    }
  }
  return drafts;
}

function OverlayPreview({ src, color, percent }: { src: string; color: string; percent: number }) {
  return (
    <div className="admin-image-overlay-preview">
      {src ? (
        isVideoMediaUrl(src) ? (
          <video src={src} muted playsInline preload="metadata" />
        ) : (
          <img src={src} alt="" loading="lazy" />
        )
      ) : null}
      <span
        aria-hidden="true"
        className="admin-image-overlay-preview-layer"
        style={{ backgroundColor: color, opacity: percent / 100 }}
      />
    </div>
  );
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

  const syncSavedState = (id: string, saved: ImageDraft, isOverridden: boolean, defaultImageUrl: string) => {
    setDrafts((current) => ({
      ...current,
      [id]: saved
    }));
    setGroups((current) =>
      current.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === id
            ? {
                ...item,
                desktopImageUrl: isOverridden ? saved.desktop : "",
                mobileImageUrl: isOverridden ? saved.mobile : "",
                currentImageUrl: saved.desktop || saved.mobile || defaultImageUrl,
                isOverridden,
                overlayColor: saved.overlayColor,
                overlayOpacity: saved.overlayPercent / 100
              }
            : item
        )
      }))
    );
  };

  return (
    <div className="admin-home-images">
      <p className="admin-field-hint">
        לכל תמונה אפשר להעלות גרסה למסך רחב וגרסה למובייל. אם ממלאים רק אחת - היא תשמש גם במסך השני.
        העלאה נדחסת אוטומטית.
      </p>

      {groups.map((group) => (
        <section key={group.title} className="admin-home-images-group">
          <h3 className="admin-home-images-group-title">{group.title}</h3>
          <div className="admin-home-images-list">
            {group.items.map((item) => {
              const draft = drafts[item.id];
              const savedDesktop = item.desktopImageUrl || item.defaultImageUrl;
              const savedPercent = Math.round(item.overlayOpacity * 100);
              const isDirty =
                draft.desktop.trim() !== savedDesktop.trim() ||
                draft.mobile.trim() !== item.mobileImageUrl.trim() ||
                draft.overlayPercent !== savedPercent ||
                (draft.overlayPercent > 0 && draft.overlayColor !== item.overlayColor);
              const canSave = Boolean(draft.desktop.trim() || draft.mobile.trim());
              const canReset = item.isOverridden || savedPercent > 0;
              const previewSrc = draft.desktop.trim() || draft.mobile.trim() || item.defaultImageUrl;
              const colorInputId = `overlay-color-${item.id}`;
              const rangeInputId = `overlay-range-${item.id}`;

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
                        <p className="admin-image-spec">ריק - יוצג מהמובייל</p>
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
                        <p className="admin-image-spec">ריק - יוצג ממסך רחב</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="admin-image-overlay">
                    <OverlayPreview
                      src={previewSrc}
                      color={draft.overlayColor}
                      percent={draft.overlayPercent}
                    />
                    <div className="admin-image-overlay-controls">
                      <strong>שכבת צבע מעל התמונה</strong>
                      <div className="admin-image-overlay-colors">
                        <label htmlFor={colorInputId}>צבע</label>
                        <input
                          id={colorInputId}
                          type="color"
                          value={draft.overlayColor}
                          disabled={isPending}
                          onChange={(e) => updateDraft(item.id, { overlayColor: e.target.value })}
                        />
                        {OVERLAY_PRESETS.map((preset) => (
                          <button
                            key={preset.color}
                            type="button"
                            className={`admin-image-overlay-swatch${
                              draft.overlayColor === preset.color ? " is-active" : ""
                            }`}
                            style={{ backgroundColor: preset.color }}
                            disabled={isPending}
                            aria-label={preset.label}
                            aria-pressed={draft.overlayColor === preset.color}
                            title={preset.label}
                            onClick={() => updateDraft(item.id, { overlayColor: preset.color })}
                          />
                        ))}
                      </div>
                      <div className="admin-image-overlay-range">
                        <label htmlFor={rangeInputId}>עוצמה</label>
                        <input
                          id={rangeInputId}
                          type="range"
                          min={0}
                          max={MAX_OVERLAY_PERCENT}
                          step={1}
                          value={draft.overlayPercent}
                          disabled={isPending}
                          onChange={(e) =>
                            updateDraft(item.id, { overlayPercent: Number(e.target.value) })
                          }
                        />
                        <output htmlFor={rangeInputId}>{draft.overlayPercent}%</output>
                      </div>
                      <p className="admin-field-hint">
                        שחור מחשיך, לבן מבהיר, וכל צבע אחר צובע את התמונה. 0% = בלי שכבה.
                      </p>
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
                            mobileImageUrl: draft.mobile,
                            overlayColor: draft.overlayColor,
                            overlayOpacity: draft.overlayPercent / 100
                          });
                          syncSavedState(
                            item.id,
                            {
                              desktop: draft.desktop.trim(),
                              mobile: draft.mobile.trim(),
                              overlayColor: draft.overlayColor,
                              overlayPercent: draft.overlayPercent
                            },
                            true,
                            item.defaultImageUrl
                          );
                        })
                      }
                    >
                      {isPending ? "שומר…" : "שמור"}
                    </button>
                    {canReset ? (
                      <button
                        className="button secondary"
                        disabled={isPending}
                        type="button"
                        onClick={() =>
                          run(async () => {
                            await resetSiteImageOverrideAction(item.id);
                            syncSavedState(
                              item.id,
                              {
                                desktop: item.defaultImageUrl,
                                mobile: "",
                                overlayColor: DEFAULT_SITE_IMAGE_OVERLAY_COLOR,
                                overlayPercent: 0
                              },
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
