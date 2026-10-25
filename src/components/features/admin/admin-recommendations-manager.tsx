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
import { resolveRecommendationEmbed } from "@/lib/recommendations/recommendation-embed";
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

  const persistConfig = (next: RecommendationsInput) => {
    const payload = {
      ...next,
      items: normalizeOrder(next.items)
    };
    setConfig(payload);
    setSaved(false);
    setError(null);
    run(async () => {
      const result = await saveRecommendationsAction(payload);
      setConfig(result);
      setSaved(true);
    });
  };

  const saveAll = () => {
    persistConfig(config);
  };

  const move = (id: string, direction: -1 | 1) => {
    const index = config.items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= config.items.length) return;
    const items = [...config.items];
    [items[index], items[target]] = [items[target], items[index]];
    persistConfig({ ...config, items: normalizeOrder(items) });
  };

  const dropBefore = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const items = [...config.items];
    const from = items.findIndex((item) => item.id === draggedId);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    persistConfig({ ...config, items: normalizeOrder(items) });
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
        {!config.enabled ? (
          <p className="admin-form-hint" role="status">
            העמוד כבוי כרגע — הכתובת{" "}
            <code dir="ltr">/recommendations</code> תחזיר 404 עד שתסמנו את התיבה למעלה
            ותשמרו.
          </p>
        ) : (
          <p className="admin-form-hint" role="status">
            כתובת העמוד באתר:{" "}
            <a href="/recommendations" target="_blank" rel="noopener noreferrer" dir="ltr">
              /recommendations
            </a>
            {" · "}מופיע גם בתפריט כ־«באו לטעום».
          </p>
        )}
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
          <a
            className="button secondary"
            href="/recommendations"
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!config.enabled}
            title={
              config.enabled
                ? "פתיחת עמוד הממליצים באתר"
                : "הפעילו קודם «הצגת העמוד באתר ובתפריט» ושמרו"
            }
          >
            צפייה באתר: ממליצים
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
            הוספה/עריכה/מחיקה נשמרות אוטומטית לאתר. אפשר גם לגרור לשינוי סדר.
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
                  {!item.mediaUrl.trim() && !resolveRecommendationEmbed(item.contentUrl) ? (
                    <small className="admin-form-error">חסר קישור ריל תקין — לכן שחור באתר</small>
                  ) : item.handle ? (
                    <small>{item.handle}</small>
                  ) : null}
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
                    persistConfig({
                      ...config,
                      items: normalizeOrder(
                        config.items.filter((entry) => entry.id !== item.id)
                      )
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
              const contentUrl = draft.contentUrl.trim();
              const mediaUrl = draft.mediaUrl.trim();
              const hasEmbed = contentUrl ? Boolean(resolveRecommendationEmbed(contentUrl)) : false;
              if (!mediaUrl && !hasEmbed) {
                setError(
                  contentUrl
                    ? "הקישור לסרטון לא מזוהה. הדביקו קישור מלא לריל/פוסט (Share → Copy link), לא קישור לפרופיל."
                    : "חובה להדביק קישור לריל או להעלות וידאו/תמונה. קישור לפרופיל בלבד לא מספיק."
                );
                return;
              }
              const exists = config.items.some((item) => item.id === draft.id);
              const updated = {
                ...draft,
                contentUrl,
                mediaUrl,
                quote: draft.quote.trim() || draft.creatorName.trim() || "המלצה",
                mediaAlt:
                  draft.mediaAlt.trim() ||
                  draft.creatorName.trim() ||
                  "סרטון המלצה מיוצר תוכן",
                updatedAt: new Date().toISOString()
              };
              const items = normalizeOrder(
                exists
                  ? config.items.map((item) => (item.id === updated.id ? updated : item))
                  : [...config.items, updated]
              );
              persistConfig({ ...config, items });
              closeModal();
            }}
          >
            <p className="admin-form-hint">
              חובה קישור לריל מלא (לא רק פרופיל) או קובץ וידאו — אחרת באתר יופיע מסך שחור.
              השמירה נשלחת מיד לאתר.
            </p>

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
              ציטוט / המלצה (אופציונלי)
              <textarea
                rows={3}
                maxLength={1200}
                value={draft.quote}
                onChange={(event) => setDraft({ ...draft, quote: event.target.value })}
              />
            </label>

            <label>
              קישור לסרטון / ריל (Instagram, TikTok או YouTube)
              <input
                dir="ltr"
                required={!draft.mediaUrl.trim()}
                placeholder="https://www.instagram.com/reel/XXXX…"
                value={draft.contentUrl}
                onChange={(event) => {
                  const contentUrl = event.target.value;
                  const hasReel = Boolean(contentUrl.trim());
                  const hasFile = Boolean(draft.mediaUrl.trim());
                  setError(null);
                  setDraft({
                    ...draft,
                    contentUrl,
                    template: hasReel
                      ? "media"
                      : hasFile
                        ? draft.mediaType === "video"
                          ? "media"
                          : "portrait"
                        : "quote"
                  });
                }}
              />
            </label>
            <p className="admin-form-hint">
              לא קישור לפרופיל — קישור לריל/פוסט ספציפי (Share → Copy link).
            </p>

            <AdminImageUrlField
              label="קובץ וידאו לדף הבית / מדיה להמלצה"
              value={draft.mediaUrl}
              images={images}
              required={false}
              onChange={(mediaUrl, meta) => {
                const isVideo = /\.(mp4|webm|mov)(?:$|\?)/i.test(mediaUrl);
                setDraft({
                  ...draft,
                  mediaUrl,
                  mediaType: isVideo ? "video" : "image",
                  posterUrl: draft.posterUrl,
                  template:
                    mediaUrl || draft.contentUrl
                      ? isVideo || draft.contentUrl
                        ? "media"
                        : "portrait"
                      : "quote",
                  mediaAlt: draft.mediaAlt || meta?.altSuggestion || ""
                });
              }}
            />

            <AdminImageUrlField
              label="תמונת פתיחה לסרטון (אופציונלי)"
              value={draft.posterUrl}
              images={images}
              required={false}
              onChange={(posterUrl) => setDraft({ ...draft, posterUrl })}
            />
            <p className="admin-form-hint">לניגון אוטומטי בריבועים בדף הבית יש להעלות קובץ MP4, WebM או MOV בשדה המדיה. קישור לאינסטגרם יוצג גם בדף הבית כפוסט מוטמע; הניגון בו תלוי באינסטגרם. קובץ וידאו ישיר מאפשר ניגון אוטומטי ללא קול.</p>
            <label>
              תיאור מדיה לנגישות (אופציונלי)
              <input
                maxLength={300}
                placeholder="למשל: סרטון של מאי בן חקון ב־SO WHAT"
                value={draft.mediaAlt}
                onChange={(event) => setDraft({ ...draft, mediaAlt: event.target.value })}
              />
            </label>

            <label>
              קישור לפרופיל
              <input
                required
                dir="ltr"
                placeholder="https://instagram.com/…"
                value={draft.profileUrl}
                onChange={(event) => setDraft({ ...draft, profileUrl: event.target.value })}
              />
            </label>

            <div className={`admin-recommendation-live-preview is-template-${draft.template}`}>
              <p className="admin-form-hint">תצוגה מקדימה</p>
              <div className="admin-recommendation-live-preview-card">
                {draft.contentUrl.trim() ? (
                  <div className="admin-recommendation-preview-placeholder">
                    באתר יוצג נגן מהקישור לריל/סרטון
                  </div>
                ) : draft.mediaUrl ? (
                  draft.mediaType === "video" || /\.(mp4|webm|mov)(?:$|\?)/i.test(draft.mediaUrl) ? (
                    <video src={draft.mediaUrl} controls playsInline preload="metadata" />
                  ) : (
                    <img src={draft.mediaUrl} alt="" />
                  )
                ) : (
                  <div className="admin-recommendation-preview-placeholder">בלי מדיה</div>
                )}
                <div>
                  <strong>{draft.creatorName || "שם היוצר"}</strong>
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
                  ? "שמור ועדכן באתר"
                  : "שמור והצג באתר"
              }
            />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
