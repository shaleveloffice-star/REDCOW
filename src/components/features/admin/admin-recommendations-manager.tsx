"use client";

import { useState } from "react";
import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { AdminImageUrlField } from "@/components/features/admin/admin-site-image-picker";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { createId } from "@/lib/admin/new-id";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";
import { saveRecommendationsAction } from "@/server/actions/recommendations.actions";
import type {
  CreatorRecommendation,
  RecommendationPlatform,
  RecommendationTemplate,
  RecommendationsConfig,
  RecommendationsInput
} from "@/types/recommendations";

const PLATFORM_LABELS: Record<RecommendationPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "אחר"
};

const TEMPLATE_LABELS: Record<RecommendationTemplate, string> = {
  portrait: "פורטרט — תמונה גבוהה",
  quote: "ציטוט — המלצה במרכז",
  media: "מדיה — תמונה/וידאו גדול"
};

function newRecommendation(sortOrder: number): CreatorRecommendation {
  const now = new Date().toISOString();
  return {
    id: createId("recommendation"),
    creatorName: "",
    handle: "",
    quote: "",
    mediaType: "image",
    mediaUrl: "",
    posterUrl: "",
    mediaAlt: "",
    platform: "instagram",
    profileUrl: "",
    contentUrl: "",
    recommendationDate: "",
    template: "portrait",
    isActive: true,
    sortOrder,
    createdAt: now,
    updatedAt: now
  };
}

function normalizeOrder(items: CreatorRecommendation[]): CreatorRecommendation[] {
  return items.map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

export function AdminRecommendationsManager({
  initialConfig,
  images
}: {
  initialConfig: RecommendationsConfig;
  images: AdminPickableImage[];
}) {
  const [config, setConfig] = useState<RecommendationsInput>(initialConfig);
  const [draft, setDraft] = useState<CreatorRecommendation | null>(null);
  const [saved, setSaved] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();

  const updateConfig = (patch: Partial<RecommendationsInput>) => {
    setConfig((current) => ({ ...current, ...patch }));
    setSaved(false);
    setError(null);
  };

  const saveAll = () => {
    run(async () => {
      const result = await saveRecommendationsAction({
        ...config,
        items: normalizeOrder(config.items)
      });
      setConfig(result);
      setSaved(true);
    });
  };

  const move = (id: string, direction: -1 | 1) => {
    const index = config.items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= config.items.length) return;
    const items = [...config.items];
    [items[index], items[target]] = [items[target], items[index]];
    updateConfig({ items: normalizeOrder(items) });
  };

  const dropBefore = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const items = [...config.items];
    const from = items.findIndex((item) => item.id === draggedId);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    updateConfig({ items: normalizeOrder(items) });
    setDraggedId(null);
  };

  const closeModal = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <>
      <form
        className="admin-form admin-recommendations-settings"
        onSubmit={(event) => {
          event.preventDefault();
          saveAll();
        }}
      >
        <label className="admin-checkbox-row">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(event) => updateConfig({ enabled: event.target.checked })}
          />
          הצגת העמוד באתר ובתפריט
        </label>
        <label>
          כותרת העמוד
          <input
            required
            maxLength={160}
            value={config.title}
            onChange={(event) => updateConfig({ title: event.target.value })}
          />
        </label>
        <label>
          פתיח
          <textarea
            rows={3}
            maxLength={800}
            value={config.introduction}
            onChange={(event) => updateConfig({ introduction: event.target.value })}
          />
        </label>
        <div className="admin-form-actions">
          <button className="button" type="submit" disabled={isPending}>
            {isPending ? "שומר…" : "שמירת כל השינויים"}
          </button>
          <a className="button secondary" href="/recommendations" target="_blank" rel="noreferrer">
            תצוגה באתר
          </a>
        </div>
        {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
        {saved ? <p className="admin-form-hint" role="status">השינויים נשמרו.</p> : null}
      </form>

      <div className="admin-recommendations-list-wrap">
        <AdminToolbar
          label="הוסף יוצר/תוכן"
          onAdd={() => setDraft(newRecommendation(config.items.length + 1))}
        >
          <p className="admin-form-hint">
            גררו כרטיסים לשינוי סדר, או השתמשו בחצים. לבסוף לחצו “שמירת כל השינויים”.
          </p>
        </AdminToolbar>

        {config.items.length === 0 ? (
          <p className="admin-form-hint">עדיין אין המלצות. הוסיפו את היוצר הראשון.</p>
        ) : (
          <ul className="admin-recommendations-list">
            {config.items.map((item, index) => (
              <li
                key={item.id}
                className={`admin-recommendation-row${draggedId === item.id ? " is-dragging" : ""}`}
                draggable
                onDragStart={() => setDraggedId(item.id)}
                onDragEnd={() => setDraggedId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropBefore(item.id)}
              >
                <button
                  type="button"
                  className="admin-recommendation-drag"
                  aria-label={`גרירת ${item.creatorName}`}
                  title="גרירה לשינוי סדר"
                >
                  ⋮⋮
                </button>
                <span className="admin-recommendation-order">{index + 1}</span>
                <div className="admin-recommendation-thumb">
                  {item.mediaType === "image" && item.mediaUrl ? (
                    <img src={item.mediaUrl} alt="" />
                  ) : (
                    <span aria-hidden="true">▶</span>
                  )}
                </div>
                <div className="admin-recommendation-summary">
                  <strong>{item.creatorName}</strong>
                  <span>
                    {PLATFORM_LABELS[item.platform]} · {TEMPLATE_LABELS[item.template]}
                  </span>
                  {item.handle ? <small>{item.handle}</small> : null}
                </div>
                <StatusBadge active={item.isActive} />
                <div className="admin-recommendation-order-actions">
                  <button
                    type="button"
                    className="button secondary"
                    disabled={index === 0}
                    onClick={() => move(item.id, -1)}
                    aria-label="העבר למעלה"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    disabled={index === config.items.length - 1}
                    onClick={() => move(item.id, 1)}
                    aria-label="העבר למטה"
                  >
                    ↓
                  </button>
                </div>
                <AdminRowActions
                  disabled={isPending}
                  onEdit={() => setDraft({ ...item })}
                  onDelete={() => {
                    if (!confirmDelete(item.creatorName)) return;
                    updateConfig({
                      items: normalizeOrder(config.items.filter((entry) => entry.id !== item.id))
                    });
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <AdminModal
        open={Boolean(draft)}
        title={config.items.some((item) => item.id === draft?.id) ? "עריכת המלצה" : "הוספת המלצה"}
        onClose={closeModal}
        size="wide"
      >
        {draft ? (
          <form
            className="admin-form admin-recommendation-form"
            onSubmit={(event) => {
              event.preventDefault();
              const exists = config.items.some((item) => item.id === draft.id);
              const updated = {
                ...draft,
                updatedAt: new Date().toISOString()
              };
              updateConfig({
                items: normalizeOrder(
                  exists
                    ? config.items.map((item) => (item.id === updated.id ? updated : item))
                    : [...config.items, updated]
                )
              });
              closeModal();
            }}
          >
            <div className="admin-recommendation-form-grid">
              <label>
                שם היוצר
                <input
                  required
                  maxLength={120}
                  value={draft.creatorName}
                  onChange={(event) => setDraft({ ...draft, creatorName: event.target.value })}
                />
              </label>
              <label>
                שם משתמש
                <input
                  maxLength={120}
                  placeholder="@creator"
                  value={draft.handle}
                  onChange={(event) => setDraft({ ...draft, handle: event.target.value })}
                />
              </label>
              <label>
                פלטפורמה
                <select
                  value={draft.platform}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      platform: event.target.value as RecommendationPlatform
                    })
                  }
                >
                  {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label>
                טמפלייט
                <select
                  value={draft.template}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      template: event.target.value as RecommendationTemplate
                    })
                  }
                >
                  {Object.entries(TEMPLATE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              ציטוט / המלצה
              <textarea
                rows={4}
                maxLength={1200}
                value={draft.quote}
                onChange={(event) => setDraft({ ...draft, quote: event.target.value })}
              />
            </label>

            <label>
              סוג מדיה
              <select
                value={draft.mediaType}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    mediaType: event.target.value as CreatorRecommendation["mediaType"],
                    mediaUrl: ""
                  })
                }
              >
                <option value="image">תמונה</option>
                <option value="video">וידאו</option>
              </select>
            </label>

            {draft.mediaType === "image" ? (
              <AdminImageUrlField
                label="תמונה"
                value={draft.mediaUrl}
                images={images}
                required
                onChange={(mediaUrl, meta) =>
                  setDraft({
                    ...draft,
                    mediaUrl,
                    mediaAlt: draft.mediaAlt || meta?.altSuggestion || ""
                  })
                }
              />
            ) : (
              <>
                <label>
                  קישור ישיר לווידאו
                  <input
                    required
                    dir="ltr"
                    placeholder="https://…/video.mp4"
                    value={draft.mediaUrl}
                    onChange={(event) => setDraft({ ...draft, mediaUrl: event.target.value })}
                  />
                </label>
                <AdminImageUrlField
                  label="תמונת המתנה לווידאו"
                  value={draft.posterUrl}
                  images={images}
                  onChange={(posterUrl) => setDraft({ ...draft, posterUrl })}
                />
              </>
            )}

            <label>
              תיאור מדיה לנגישות
              <input
                maxLength={300}
                value={draft.mediaAlt}
                onChange={(event) => setDraft({ ...draft, mediaAlt: event.target.value })}
              />
            </label>
            <div className="admin-recommendation-form-grid">
              <label>
                תאריך ההמלצה
                <input
                  type="date"
                  value={draft.recommendationDate}
                  onChange={(event) =>
                    setDraft({ ...draft, recommendationDate: event.target.value })
                  }
                />
              </label>
              <label>
                קישור לפרופיל
                <input
                  dir="ltr"
                  placeholder="https://instagram.com/…"
                  value={draft.profileUrl}
                  onChange={(event) => setDraft({ ...draft, profileUrl: event.target.value })}
                />
              </label>
              <label>
                קישור לפוסט / סרטון
                <input
                  dir="ltr"
                  placeholder="https://…"
                  value={draft.contentUrl}
                  onChange={(event) => setDraft({ ...draft, contentUrl: event.target.value })}
                />
              </label>
            </div>
            <div className={`admin-recommendation-live-preview is-template-${draft.template}`}>
              <p className="admin-form-hint">תצוגה מקדימה</p>
              <div className="admin-recommendation-live-preview-card">
                {draft.mediaUrl ? (
                  draft.mediaType === "image" ? (
                    <img src={draft.mediaUrl} alt="" />
                  ) : (
                    <video src={draft.mediaUrl} poster={draft.posterUrl || undefined} muted />
                  )
                ) : (
                  <div className="admin-recommendation-preview-placeholder">מדיה</div>
                )}
                <div>
                  <strong>{draft.creatorName || "שם היוצר"}</strong>
                  {draft.handle ? <small>{draft.handle}</small> : null}
                  {draft.quote ? <blockquote>“{draft.quote}”</blockquote> : null}
                </div>
              </div>
            </div>
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })}
              />
              הצגת ההמלצה באתר
            </label>
            <AdminFormFooter
              isPending={isPending}
              error={error}
              onCancel={closeModal}
              submitLabel={
                config.items.some((item) => item.id === draft.id)
                  ? "עדכן ברשימה"
                  : "הוסף לרשימה"
              }
            />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
