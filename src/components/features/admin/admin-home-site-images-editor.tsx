"use client";

import { useRef, useState } from "react";

import { useVideoTrim } from "@/components/shared/use-video-trim";
import { useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import { AdminImageUrlField } from "@/components/features/admin/admin-site-image-picker";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { menuImageMediaStyle } from "@/lib/menu/image-zoom";
import {
  DEFAULT_SITE_IMAGE_FOCUS,
  type SiteImageFocus
} from "@/lib/site-image-focus";
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
  /** 1 (original) through 3. */
  zoom: number;
  videoStart: number;
  videoEnd: number | null;
  focusDesktop: SiteImageFocus;
  focusMobile: SiteImageFocus;
};

const OVERLAY_PRESETS = [
  { color: "#000000", label: "שחור" },
  { color: "#ffffff", label: "לבן" }
] as const;

const MAX_OVERLAY_PERCENT = Math.round(MAX_SITE_IMAGE_OVERLAY_OPACITY * 100);

type HomeImageItem = HomePageSiteImageAdminGroup["items"][number];

function savedDesktopFor(item: HomeImageItem): string {
  if (item.isHidden) return "";
  return item.desktopImageUrl || (item.singleImage ? item.mobileImageUrl : "") || item.defaultImageUrl;
}

function savedMobileFor(item: HomeImageItem): string {
  return item.singleImage ? "" : item.mobileImageUrl;
}

function buildDrafts(groups: HomePageSiteImageAdminGroup[]): Record<string, ImageDraft> {
  const drafts: Record<string, ImageDraft> = {};
  for (const group of groups) {
    for (const item of group.items) {
      drafts[item.id] = {
        desktop: savedDesktopFor(item),
        mobile: savedMobileFor(item),
        overlayColor: item.overlayColor,
        overlayPercent: Math.round(item.overlayOpacity * 100),
        zoom: item.imageZoom,
        videoStart: item.videoStart,
        videoEnd: item.videoEnd,
        focusDesktop: item.imageFocusDesktop,
        focusMobile: item.imageFocusMobile
      };
    }
  }
  return drafts;
}

function VideoTrimEditor({ src, start, end, disabled, valid, onChange, onDuration }: {
  src: string; start: number; end: number | null; disabled: boolean; valid: boolean;
  onChange: (start: number, end: number | null) => void;
  onDuration: (duration: number) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<number | null>(null);
  useVideoTrim(ref, src, valid ? start : 0, valid ? end : null);
  return (
    <fieldset disabled={disabled} className="admin-home-images-slot">
      <legend>חיתוך סרטון לפי זמן</legend>
      <p className="admin-field-hint">הזינו זמנים בשניות, כולל עשיריות. רק הקטע שנבחר יתנגן בלולאה באתר. קובץ המקור נשאר שלם. ההגדרה חלה על ההירו במחשב ובמובייל.</p>
      <label>זמן התחלה (שניות)
        <input type="number" min="0" step="0.1" value={start}
          onChange={(e) => onChange(Number(e.target.value), end)} />
      </label>
      <label>זמן סיום (שניות)
        <input type="number" min="0" step="0.1" value={end ?? ""} placeholder="עד סוף הסרטון"
          onChange={(e) => onChange(start, e.target.value === "" ? null : Number(e.target.value))} />
      </label>
      {!valid ? <p role="alert">זמן הסיום חייב להיות גדול מזמן ההתחלה, והזמנים אינם יכולים להיות שליליים.</p> : null}
      {duration !== null ? <p className="admin-field-hint">אורך מלא: {duration.toFixed(2)} שניות.
        {start >= duration ? " זמן ההתחלה מעבר לסוף הסרטון — יש לבחור זמן קצר יותר." : ""}
        {end !== null && end > duration ? " זמן הסיום חורג מאורך הסרטון ויוגבל לסופו." : ""}
      </p> : null}
      <video key={src} ref={ref} src={src} controls muted playsInline preload="metadata"
        aria-label="תצוגה מקדימה של חיתוך הסרטון"
        style={{ width: "100%", maxHeight: 280, objectFit: "contain", background: "#111" }}
        onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration); onDuration(e.currentTarget.duration); }} />
      <button type="button" className="button secondary" onClick={() => onChange(0, null)}>ביטול חיתוך</button>
      <p className="admin-field-hint">לחצו על ניגון לתצוגה מקדימה, ואז על שמור כדי לעדכן את האתר.</p>
    </fieldset>
  );
}

function OverlayPreview({
  src,
  color,
  percent,
  zoom,
  focusDesktop,
  focusMobile,
  previewMode
}: {
  src: string;
  color: string;
  percent: number;
  zoom: number;
  focusDesktop: SiteImageFocus;
  focusMobile: SiteImageFocus;
  previewMode: "desktop" | "mobile";
}) {
  const mediaStyle = menuImageMediaStyle({
    zoom,
    focusDesktop: previewMode === "desktop" ? focusDesktop : focusMobile,
    focusMobile: previewMode === "desktop" ? focusDesktop : focusMobile
  });
  const focus = previewMode === "desktop" ? focusDesktop : focusMobile;
  return (
    <div className="admin-image-overlay-preview">
      {src ? (
        isVideoMediaUrl(src) ? (
          <video
            src={src}
            muted
            playsInline
            preload="metadata"
            className="site-media-focus"
            style={mediaStyle}
          />
        ) : (
          <img src={src} alt="" loading="lazy" className="site-media-focus" style={mediaStyle} />
        )
      ) : null}
      <span
        aria-hidden="true"
        className="admin-image-overlay-preview-layer"
        style={{ backgroundColor: color, opacity: percent / 100 }}
      />
      <span
        aria-hidden="true"
        className="admin-image-focus-crosshair"
        style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
      />
    </div>
  );
}

function FocusAxisControls({
  id,
  label,
  value,
  disabled,
  onChange
}: {
  id: string;
  label: string;
  value: SiteImageFocus;
  disabled: boolean;
  onChange: (next: SiteImageFocus) => void;
}) {
  const xId = `${id}-x`;
  const yId = `${id}-y`;
  return (
    <div className="admin-image-focus-group">
      <strong>{label}</strong>
      <div className="admin-image-overlay-range">
        <label htmlFor={xId}>אופקי</label>
        <input
          id={xId}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value.x}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, x: Number(e.target.value) })}
        />
        <output htmlFor={xId}>{value.x}%</output>
      </div>
      <div className="admin-image-overlay-range">
        <label htmlFor={yId}>אנכי</label>
        <input
          id={yId}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value.y}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, y: Number(e.target.value) })}
        />
        <output htmlFor={yId}>{value.y}%</output>
      </div>
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
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [previewModes, setPreviewModes] = useState<Record<string, "desktop" | "mobile">>({});

  const updateDraft = (id: string, patch: Partial<ImageDraft>) => {
    setDrafts((current) => ({
      ...current,
      [id]: { ...current[id], ...patch }
    }));
  };

  const previewModeFor = (id: string) => previewModes[id] ?? "desktop";

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
                isHidden: false,
                overlayColor: saved.overlayColor,
                overlayOpacity: saved.overlayPercent / 100,
                imageZoom: saved.zoom,
                videoStart: saved.videoStart,
                videoEnd: saved.videoEnd,
                imageFocusDesktop: saved.focusDesktop,
                imageFocusMobile: saved.focusMobile
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
              const savedDesktop = savedDesktopFor(item);
              const savedPercent = Math.round(item.overlayOpacity * 100);
              const focusDesktopDirty =
                draft.focusDesktop.x !== item.imageFocusDesktop.x ||
                draft.focusDesktop.y !== item.imageFocusDesktop.y;
              const focusMobileDirty =
                draft.focusMobile.x !== item.imageFocusMobile.x ||
                draft.focusMobile.y !== item.imageFocusMobile.y;
              const isDirty =
                draft.desktop.trim() !== savedDesktop.trim() ||
                draft.mobile.trim() !== savedMobileFor(item).trim() ||
                draft.overlayPercent !== savedPercent ||
                (draft.overlayPercent > 0 && draft.overlayColor !== item.overlayColor) ||
                draft.zoom !== item.imageZoom ||
                draft.videoStart !== item.videoStart ||
                draft.videoEnd !== item.videoEnd ||
                focusDesktopDirty ||
                focusMobileDirty;
              const validTrim = Number.isFinite(draft.videoStart) && draft.videoStart >= 0 &&
                (draft.videoEnd === null || (Number.isFinite(draft.videoEnd) && draft.videoEnd > draft.videoStart));
              const duration = durations[draft.desktop.trim() || draft.mobile.trim()];
              const canSave = Boolean(draft.desktop.trim() || draft.mobile.trim()) && validTrim &&
                (duration === undefined || draft.videoStart < duration);
              const canReset =
                item.isOverridden ||
                item.isHidden ||
                savedPercent > 0 ||
                item.imageZoom !== 1 ||
                item.imageFocusDesktop.x !== 50 ||
                item.imageFocusDesktop.y !== 50 ||
                item.imageFocusMobile.x !== 50 ||
                item.imageFocusMobile.y !== 50;
              const previewSrc =
                draft.desktop.trim() || draft.mobile.trim() || (item.isHidden ? "" : item.defaultImageUrl);
              const colorInputId = `overlay-color-${item.id}`;
              const rangeInputId = `overlay-range-${item.id}`;
              const zoomInputId = `zoom-range-${item.id}`;
              const previewMode = previewModeFor(item.id);

              return (
                <article key={item.id} className="admin-home-images-item">
                  <div className="admin-home-images-item-head">
                    <div>
                      <strong>{item.label}</strong>
                      <p className="admin-field-hint">{item.location}</p>
                    </div>
                    {item.isHidden ? (
                      <span className="admin-home-images-badge admin-home-images-badge--deleted">נמחקה</span>
                    ) : item.isOverridden ? (
                      <span className="admin-home-images-badge">מותאם</span>
                    ) : null}
                  </div>
                  {item.isHidden ? (
                    <p className="admin-form-hint admin-home-images-deleted-hint">
                      התמונה נמחקה מהגלריה - הסקשן מוצג באתר בלי תמונה. בחרו תמונה חדשה ושמרו, או לחצו
                      &quot;איפוס לברירת מחדל&quot; כדי להחזיר את התמונה המקורית.
                    </p>
                  ) : null}

                  <div className="admin-home-images-slots">
                    <div className="admin-home-images-slot">
                      <AdminImageUrlField
                        label={item.singleImage ? "תמונה (מחשב ומובייל)" : "מסך רחב (מחשב / טאבלט)"}
                        value={draft.desktop}
                        images={pickableImages}
                        spec={item.spec}
                        onChange={(url) => updateDraft(item.id, { desktop: url })}
                      />
                      {!draft.desktop.trim() && draft.mobile.trim() ? (
                        <p className="admin-image-spec">ריק - יוצג מהמובייל</p>
                      ) : null}
                    </div>
                    {item.singleImage ? null : (
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
                    )}
                  </div>

                  {item.id === "hero-burger" && isVideoMediaUrl(previewSrc) ? (
                    <VideoTrimEditor src={previewSrc} start={draft.videoStart} end={draft.videoEnd}
                      disabled={isPending} valid={validTrim}
                      onDuration={(value) => setDurations((current) => ({ ...current, [previewSrc]: value }))}
                      onChange={(videoStart, videoEnd) => updateDraft(item.id, { videoStart, videoEnd })} />
                  ) : null}
                  <div className="admin-image-overlay">
                    <div className="admin-image-overlay-preview-wrap">
                      <div className="admin-image-focus-preview-toggle" role="group" aria-label="תצוגת מיקום">
                        <button
                          type="button"
                          className={`button secondary${previewMode === "desktop" ? " is-active" : ""}`}
                          disabled={isPending}
                          aria-pressed={previewMode === "desktop"}
                          onClick={() =>
                            setPreviewModes((current) => ({ ...current, [item.id]: "desktop" }))
                          }
                        >
                          מסך רחב
                        </button>
                        <button
                          type="button"
                          className={`button secondary${previewMode === "mobile" ? " is-active" : ""}`}
                          disabled={isPending}
                          aria-pressed={previewMode === "mobile"}
                          onClick={() =>
                            setPreviewModes((current) => ({ ...current, [item.id]: "mobile" }))
                          }
                        >
                          טלפון
                        </button>
                      </div>
                      <OverlayPreview
                        src={previewSrc}
                        color={draft.overlayColor}
                        percent={draft.overlayPercent}
                        zoom={draft.zoom}
                        focusDesktop={draft.focusDesktop}
                        focusMobile={draft.focusMobile}
                        previewMode={previewMode}
                      />
                    </div>
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

                      <strong>זום למרכז התמונה</strong>
                      <div className="admin-image-overlay-range">
                        <label htmlFor={zoomInputId}>זום</label>
                        <input
                          id={zoomInputId}
                          type="range"
                          min={1}
                          max={3}
                          step={0.05}
                          value={draft.zoom}
                          disabled={isPending}
                          onChange={(e) => updateDraft(item.id, { zoom: Number(e.target.value) })}
                        />
                        <output htmlFor={zoomInputId}>{Math.round(draft.zoom * 100)}%</output>
                      </div>
                      {draft.zoom !== 1 ? (
                        <button
                          type="button"
                          className="button secondary"
                          disabled={isPending}
                          onClick={() => updateDraft(item.id, { zoom: 1 })}
                        >
                          איפוס זום
                        </button>
                      ) : null}
                      <p className="admin-field-hint">
                        מגדיל סביב נקודת המיקום שבחרתם. הקובץ עצמו לא משתנה. 100% = בלי זום.
                      </p>

                      <strong>מיקום מרכז הסרטון / התמונה</strong>
                      <FocusAxisControls
                        id={`focus-desktop-${item.id}`}
                        label="מסך רחב"
                        value={draft.focusDesktop}
                        disabled={isPending}
                        onChange={(focusDesktop) => updateDraft(item.id, { focusDesktop })}
                      />
                      <FocusAxisControls
                        id={`focus-mobile-${item.id}`}
                        label="טלפון"
                        value={draft.focusMobile}
                        disabled={isPending}
                        onChange={(focusMobile) => updateDraft(item.id, { focusMobile })}
                      />
                      {draft.focusDesktop.x !== 50 ||
                      draft.focusDesktop.y !== 50 ||
                      draft.focusMobile.x !== 50 ||
                      draft.focusMobile.y !== 50 ? (
                        <button
                          type="button"
                          className="button secondary"
                          disabled={isPending}
                          onClick={() =>
                            updateDraft(item.id, {
                              focusDesktop: { ...DEFAULT_SITE_IMAGE_FOCUS },
                              focusMobile: { ...DEFAULT_SITE_IMAGE_FOCUS }
                            })
                          }
                        >
                          איפוס מיקום למרכז
                        </button>
                      ) : null}
                      <p className="admin-field-hint">
                        קובע איזה חלק של הסרטון או התמונה יישאר במרכז כשיש זום או חיתוך למסגרת.
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
                            overlayOpacity: draft.overlayPercent / 100,
                            imageZoom: draft.zoom,
                            videoStart: draft.videoStart,
                            videoEnd: draft.videoEnd,
                            imageFocusDesktop: draft.focusDesktop,
                            imageFocusMobile: draft.focusMobile
                          });
                          syncSavedState(
                            item.id,
                            {
                              desktop: draft.desktop.trim(),
                              mobile: draft.mobile.trim(),
                              overlayColor: draft.overlayColor,
                              overlayPercent: draft.overlayPercent,
                              zoom: draft.zoom,
                              videoStart: draft.videoStart,
                              videoEnd: draft.videoEnd,
                              focusDesktop: draft.focusDesktop,
                              focusMobile: draft.focusMobile
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
                                overlayPercent: 0,
                                zoom: 1,
                                videoStart: 0,
                                videoEnd: null,
                                focusDesktop: { ...DEFAULT_SITE_IMAGE_FOCUS },
                                focusMobile: { ...DEFAULT_SITE_IMAGE_FOCUS }
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
