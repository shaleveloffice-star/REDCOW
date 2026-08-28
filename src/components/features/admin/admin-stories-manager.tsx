"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { AdminImageUrlField } from "@/components/features/admin/admin-site-image-picker";
import {
  OG_IMAGE_SPEC,
  STORY_HERO_IMAGE_SPEC,
  STORY_SECTION_IMAGE_SPEC
} from "@/data/admin-image-specs";
import { AdminStoryVisualPreview } from "@/components/features/admin/admin-story-visual-preview";
import { StatusBadge } from "@/components/features/admin/status-badge";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";
import { createId } from "@/lib/admin/new-id";
import {
  convertStorySectionType,
  createDefaultStorySection
} from "@/lib/stories/convert-section-type";
import { resolveStorySlug, isStoryInMagazine } from "@/lib/stories/story-slug";
import { deleteBrandStoryAction, saveBrandStoryAction, toggleStoryMagazineAction } from "@/server/actions/stories.actions";
import {
  STORY_SECTION_TYPES,
  type BrandStory,
  type StorySection,
  type StorySectionBackground,
  type StorySectionType
} from "@/types/story";

const STORY_DRAFT_STORAGE_PREFIX = "nb-admin-story-draft:";

function storyDraftStorageKey(id: string) {
  return `${STORY_DRAFT_STORAGE_PREFIX}${id}`;
}

function readLocalStoryDraft(id: string): BrandStory | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storyDraftStorageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BrandStory;
    if (!parsed || typeof parsed !== "object" || parsed.id !== id) return null;
    return { ...parsed, sections: Array.isArray(parsed.sections) ? parsed.sections : [] };
  } catch {
    return null;
  }
}

function writeLocalStoryDraft(story: BrandStory) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storyDraftStorageKey(story.id),
      JSON.stringify({ ...story, updatedAt: new Date().toISOString() })
    );
  } catch {
    // private mode / quota
  }
}

function clearLocalStoryDraft(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storyDraftStorageKey(id));
  } catch {
    // ignore
  }
}

function findNewestOrphanLocalDraft(existingIds: Set<string>): BrandStory | null {
  if (typeof window === "undefined") return null;
  let newest: BrandStory | null = null;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith(STORY_DRAFT_STORAGE_PREFIX)) continue;
      const id = key.slice(STORY_DRAFT_STORAGE_PREFIX.length);
      if (existingIds.has(id)) continue;
      const draft = readLocalStoryDraft(id);
      if (!draft) continue;
      if (!newest || Date.parse(draft.updatedAt) > Date.parse(newest.updatedAt)) {
        newest = draft;
      }
    }
  } catch {
    return newest;
  }
  return newest;
}

function preferLocalDraft(serverStory: BrandStory): { story: BrandStory; fromLocal: boolean } {
  const local = readLocalStoryDraft(serverStory.id);
  if (!local) {
    return { story: { ...serverStory, sections: [...serverStory.sections] }, fromLocal: false };
  }
  const localTs = Date.parse(local.updatedAt) || 0;
  const serverTs = Date.parse(serverStory.updatedAt) || 0;
  if (localTs >= serverTs) {
    return { story: local, fromLocal: true };
  }
  return { story: { ...serverStory, sections: [...serverStory.sections] }, fromLocal: false };
}

const SECTION_TYPE_LABELS: Record<StorySectionType, string> = {
  "split-text-image": "טקסט + תמונה (ימין)",
  "split-image-text": "תמונה + טקסט (שמאל)",
  "full-image": "תמונה מלאה",
  quote: "ציטוט",
  cta: "קריאה לפעולה",
  "long-content": "תוכן ארוך"
};

function newStory(items: BrandStory[]): BrandStory {
  const now = new Date().toISOString();
  return {
    id: createId("story"),
    slug: "",
    category: "הסיפור שלנו",
    title: "",
    subtitle: "",
    heroImageUrl: "",
    heroImageAlt: "",
    sections: [],
    publishedAt: now,
    isActive: false,
    showInMagazine: true,
    sortOrder: items.length,
    createdAt: now,
    updatedAt: now
  };
}

function moveSection(sections: StorySection[], index: number, direction: -1 | 1): StorySection[] {
  const target = index + direction;
  if (target < 0 || target >= sections.length) {
    return sections;
  }

  const next = [...sections];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function updateSectionAt(
  sections: StorySection[],
  index: number,
  updater: (section: StorySection) => StorySection
): StorySection[] {
  return sections.map((section, i) => (i === index ? updater(section) : section));
}

function SectionEditor({
  section,
  index,
  total,
  disabled,
  pickableImages,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove
}: {
  section: StorySection;
  index: number;
  total: number;
  disabled?: boolean;
  pickableImages: AdminPickableImage[];
  onChange: (section: StorySection) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <fieldset className="admin-fieldset">
      <legend>מקטע {index + 1}</legend>

      <div className="admin-row-actions" style={{ marginBottom: 12 }}>
        <button className="button secondary" disabled={disabled || index === 0} type="button" onClick={onMoveUp}>
          ↑
        </button>
        <button
          className="button secondary"
          disabled={disabled || index === total - 1}
          type="button"
          onClick={onMoveDown}
        >
          ↓
        </button>
        <button className="button secondary admin-btn-danger" disabled={disabled} type="button" onClick={onRemove}>
          הסר מקטע
        </button>
      </div>

      <label>
        סוג מקטע
        <select
          value={section.type}
          onChange={(e) => onChange(convertStorySectionType(section, e.target.value as StorySectionType))}
        >
          {STORY_SECTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {SECTION_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <label>
        רקע מקטע
        <select
          value={section.background ?? "auto"}
          onChange={(e) => {
            const value = e.target.value;
            onChange({
              ...section,
              background: value === "auto" ? undefined : (value as StorySectionBackground)
            });
          }}
        >
          <option value="auto">אוטומטי (מתחלף)</option>
          <option value="light">לבן</option>
          <option value="dark">שחור</option>
        </select>
      </label>

      {(section.type === "split-text-image" || section.type === "split-image-text") && (
        <>
          <label>
            Kicker (אופציונלי)
            <input
              value={section.kicker ?? ""}
              onChange={(e) => onChange({ ...section, kicker: e.target.value })}
            />
          </label>
          <label>
            כותרת מקטע
            <input
              required
              value={section.title}
              onChange={(e) => onChange({ ...section, title: e.target.value })}
            />
          </label>
          <label>
            תוכן
            <textarea
              required
              rows={4}
              value={section.body}
              onChange={(e) => onChange({ ...section, body: e.target.value })}
            />
          </label>
          <AdminImageUrlField
            label="כתובת תמונה (אופציונלי)"
            value={section.imageUrl}
            images={pickableImages}
            spec={STORY_SECTION_IMAGE_SPEC}
            onChange={(imageUrl, meta) =>
              onChange({
                ...section,
                imageUrl,
                ...(meta?.altSuggestion && !section.imageAlt.trim()
                  ? { imageAlt: meta.altSuggestion }
                  : {})
              })
            }
          />
          <label>
            תיאור תמונה (alt)
            <input
              value={section.imageAlt}
              onChange={(e) => onChange({ ...section, imageAlt: e.target.value })}
            />
          </label>
        </>
      )}

      {section.type === "full-image" && (
        <>
          <AdminImageUrlField
            label="כתובת תמונה (אופציונלי)"
            value={section.imageUrl}
            images={pickableImages}
            spec={STORY_SECTION_IMAGE_SPEC}
            onChange={(imageUrl, meta) =>
              onChange({
                ...section,
                imageUrl,
                ...(meta?.altSuggestion && !section.imageAlt.trim()
                  ? { imageAlt: meta.altSuggestion }
                  : {})
              })
            }
          />
          <label>
            תיאור תמונה (alt)
            <input
              value={section.imageAlt}
              onChange={(e) => onChange({ ...section, imageAlt: e.target.value })}
            />
          </label>
          <label>
            כיתוב (אופציונלי)
            <input
              value={section.caption ?? ""}
              onChange={(e) => onChange({ ...section, caption: e.target.value })}
            />
          </label>
        </>
      )}

      {section.type === "quote" && (
        <>
          <label>
            טקסט ציטוט
            <textarea
              required
              rows={3}
              value={section.text}
              onChange={(e) => onChange({ ...section, text: e.target.value })}
            />
          </label>
          <label>
            ייחוס (אופציונלי)
            <input
              value={section.attribution ?? ""}
              onChange={(e) => onChange({ ...section, attribution: e.target.value })}
            />
          </label>
        </>
      )}

      {section.type === "cta" && (
        <>
          <label>
            טקסט מקדים (אופציונלי)
            <input value={section.body ?? ""} onChange={(e) => onChange({ ...section, body: e.target.value })} />
          </label>
          <label>
            תווית כפתור
            <input
              required
              value={section.label}
              onChange={(e) => onChange({ ...section, label: e.target.value })}
            />
          </label>
          <label>
            קישור
            <input
              required
              value={section.href}
              onChange={(e) => onChange({ ...section, href: e.target.value })}
            />
          </label>
        </>
      )}

      {section.type === "long-content" && (
        <>
          <label>
            Kicker (אופציונלי)
            <input
              value={section.kicker ?? ""}
              onChange={(e) => onChange({ ...section, kicker: e.target.value })}
            />
          </label>
          <label>
            כותרת (אופציונלי)
            <input
              value={section.title ?? ""}
              onChange={(e) => onChange({ ...section, title: e.target.value })}
            />
          </label>
          <label>
            תוכן ארוך
            <textarea
              required
              rows={10}
              value={section.body}
              onChange={(e) => onChange({ ...section, body: e.target.value })}
            />
          </label>
          <p className="admin-form-hint">ניתן לחלק לפסקאות עם שורה ריקה בין פסקה לפסקה.</p>
        </>
      )}
    </fieldset>
  );
}

function getStoryPublicPath(story: BrandStory): string | null {
  if (!story.isActive || !story.title.trim()) {
    return null;
  }

  const slug = resolveStorySlug(story);
  return slug ? `/stories/${slug}` : null;
}

function StoryLinksPanel({ story }: { story: BrandStory }) {
  const adminHref = `/admin/stories?edit=${story.id}`;
  const publicPath = getStoryPublicPath(story);

  return (
    <div className="admin-story-links">
      <p>
        <strong>קישור לעריכה באדמין:</strong>{" "}
        <Link href={adminHref} className="admin-inline-link">
          {adminHref}
        </Link>
      </p>
      {publicPath ? (
        <p>
          <strong>קישור באתר (מפורסם):</strong>{" "}
          <Link href={publicPath} className="admin-inline-link" target="_blank" rel="noopener noreferrer">
            {publicPath}
          </Link>
        </p>
      ) : (
        <p className="admin-form-hint">קישור באתר יופיע לאחר פרסום הסיפור (&quot;פרסם באתר&quot;).</p>
      )}
    </div>
  );
}

export function AdminStoriesManager({
  items,
  pickableImages
}: {
  items: BrandStory[];
  pickableImages: AdminPickableImage[];
}) {
  const searchParams = useSearchParams();
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [draft, setDraft] = useState<BrandStory | null>(null);
  const [newSectionType, setNewSectionType] = useState<StorySectionType>("split-text-image");
  const [viewMode, setViewMode] = useState<"form" | "preview">("form");
  const [restoredFromLocal, setRestoredFromLocal] = useState(false);
  const [localSaveHint, setLocalSaveHint] = useState(false);
  const [serverSaveOk, setServerSaveOk] = useState<string | null>(null);
  const skipNextAutosave = useRef(false);
  const dismissedEditId = useRef<string | null>(null);
  const isNew = draft ? !items.some((item) => item.id === draft.id) : false;

  const close = () => {
    if (draft) {
      dismissedEditId.current = draft.id;
    }
    setDraft(null);
    setViewMode("form");
    setError(null);
    setRestoredFromLocal(false);
    setLocalSaveHint(false);
    setServerSaveOk(null);
  };

  const openStory = (story: BrandStory, fromLocal = false) => {
    dismissedEditId.current = null;
    skipNextAutosave.current = true;
    setDraft(story);
    setRestoredFromLocal(fromLocal);
    setViewMode("form");
    setError(null);
    setServerSaveOk(null);
  };

  const openNewStory = () => {
    const existingIds = new Set(items.map((item) => item.id));
    const orphan = findNewestOrphanLocalDraft(existingIds);
    if (orphan) {
      openStory(orphan, true);
      return;
    }
    openStory(newStory(items), false);
  };

  useEffect(() => {
    if (draft) return;

    const editId = searchParams.get("edit");
    if (!editId || dismissedEditId.current === editId) return;

    const item = items.find((entry) => entry.id === editId);
    if (item) {
      const preferred = preferLocalDraft(item);
      openStory(preferred.story, preferred.fromLocal);
    }
    // openStory is stable enough for ?edit= bootstrap; avoid re-open loops via dismissedEditId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, items, searchParams]);

  useEffect(() => {
    if (!draft) return;
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      writeLocalStoryDraft(draft);
      setLocalSaveHint(true);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [draft]);

  const saveStory = (publish: boolean) => {
    if (!draft) return;
    const payload: BrandStory = {
      ...draft,
      isActive: publish,
      updatedAt: new Date().toISOString()
    };
    setDraft(payload);
    writeLocalStoryDraft(payload);

    run(async () => {
      const result = await saveBrandStoryAction(payload);
      if (!result.ok) {
        setServerSaveOk(null);
        throw new Error(result.error);
      }
      clearLocalStoryDraft(result.story.id);
      skipNextAutosave.current = true;
      setDraft({ ...result.story, sections: [...result.story.sections] });
      setRestoredFromLocal(false);
      setLocalSaveHint(false);
      setServerSaveOk(publish ? "הסיפור פורסם באתר ונשמר בשרת." : "הטיוטה נשמרה בשרת (לא מפורסמת).");
    });
  };

  const sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <AdminToolbar label="הוסף סיפור" onAdd={openNewStory} />
      {error && !draft ? (
        <p className="admin-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <table className="table">
        <thead>
          <tr>
            <th>כותרת</th>
            <th>Slug</th>
            <th>סדר</th>
            <th>סטטוס</th>
            <th>מגזין</th>
            <th>קישורים</th>
            <th style={{ width: 160 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.slug || "—"}</td>
              <td>{item.sortOrder}</td>
              <td>
                <StatusBadge active={item.isActive} />
              </td>
              <td>
                <label
                  className="admin-table-toggle"
                  title={item.isActive ? "הצגה בעמוד המגזין ובתפריט" : "פרסמו את הסיפור כדי להציג במגזין"}
                >
                  <input
                    type="checkbox"
                    checked={isStoryInMagazine(item)}
                    disabled={isPending || !item.isActive}
                    onChange={(event) => {
                      const showInMagazine = event.target.checked;
                      run(async () => {
                        const result = await toggleStoryMagazineAction(item.id, showInMagazine);
                        if (!result.ok) {
                          throw new Error(result.error);
                        }
                      });
                    }}
                  />
                  <span>{isStoryInMagazine(item) ? "מוצג" : "מוסתר"}</span>
                </label>
              </td>
              <td>
                <div className="admin-row-links">
                  <Link href={`/admin/stories?edit=${item.id}`} className="admin-inline-link">
                    עריכה באדמין
                  </Link>
                  {getStoryPublicPath(item) ? (
                    <>
                      <span aria-hidden="true"> · </span>
                      <Link
                        href={getStoryPublicPath(item)!}
                        className="admin-inline-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        צפייה באתר
                      </Link>
                    </>
                  ) : null}
                </div>
              </td>
              <td>
                <AdminRowActions
                  disabled={isPending}
                  onDelete={() => {
                    if (!confirmDelete(item.title)) return;
                    run(async () => {
                      await deleteBrandStoryAction(item.id);
                    });
                  }}
                  onEdit={() => {
                    const preferred = preferLocalDraft(item);
                    openStory(preferred.story, preferred.fromLocal);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminModal open={Boolean(draft)} title={isNew ? "הוספת סיפור" : "עריכת סיפור"} onClose={close} stacked>
        {draft ? (
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              saveStory(false);
            }}
          >
            {restoredFromLocal ? (
              <p className="admin-form-hint" role="status">
                שוחזרה טיוטה מקומית מהדפדפן — לחצו &quot;שמור טיוטה&quot; כדי לשמור בשרת.
              </p>
            ) : null}
            {localSaveHint && !restoredFromLocal ? (
              <p className="admin-form-hint" role="status">
                טיוטה נשמרת אוטומטית בדפדפן (גם אם השמירה לשרת נכשלת).
              </p>
            ) : null}
            <div className="admin-story-view-toggle" role="tablist" aria-label="מצב עריכה">
              <button
                className={`button secondary${viewMode === "form" ? " is-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={viewMode === "form"}
                onClick={() => setViewMode("form")}
              >
                טופס
              </button>
              <button
                className={`button secondary${viewMode === "preview" ? " is-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={viewMode === "preview"}
                onClick={() => setViewMode("preview")}
              >
                תצוגה מקדימה + עריכה חזותית
              </button>
            </div>

            {viewMode === "preview" ? (
              <AdminStoryVisualPreview
                story={draft}
                pickableImages={pickableImages}
                onChange={setDraft}
              />
            ) : (
              <>
            <label>
              כותרת
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label>
              Slug (אופציונלי — ייווצר מהכותרת)
              <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
            </label>
            <label>
              קטגוריה
              <input
                required
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              />
            </label>
            <label>
              כותרת משנה
              <textarea
                required
                rows={2}
                value={draft.subtitle}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              />
            </label>
            <AdminImageUrlField
              label="כתובת תמונת Hero (אופציונלי)"
              value={draft.heroImageUrl}
              images={pickableImages}
              spec={STORY_HERO_IMAGE_SPEC}
              onChange={(heroImageUrl, meta) =>
                setDraft({
                  ...draft,
                  heroImageUrl,
                  ...(meta?.altSuggestion && !draft.heroImageAlt.trim()
                    ? { heroImageAlt: meta.altSuggestion }
                    : {})
                })
              }
            />
            <label>
              תיאור תמונת Hero (alt)
              <input
                value={draft.heroImageAlt}
                onChange={(e) => setDraft({ ...draft, heroImageAlt: e.target.value })}
              />
            </label>
            <label>
              Meta Title (אופציונלי)
              <input
                value={draft.metaTitle ?? ""}
                onChange={(e) => setDraft({ ...draft, metaTitle: e.target.value })}
              />
            </label>
            <label>
              Meta Description (אופציונלי)
              <textarea
                rows={2}
                value={draft.metaDescription ?? ""}
                onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })}
              />
            </label>
            <AdminImageUrlField
              label="OG Image URL (אופציונלי)"
              value={draft.ogImageUrl ?? ""}
              images={pickableImages}
              spec={OG_IMAGE_SPEC}
              onChange={(ogImageUrl) => setDraft({ ...draft, ogImageUrl })}
            />
            <label>
              סדר תצוגה
              <input
                type="number"
                value={draft.sortOrder}
                onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })}
              />
            </label>
            <label>
              תאריך פרסום
              <input
                type="datetime-local"
                value={draft.publishedAt.slice(0, 16)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return;
                  const next = new Date(value);
                  if (Number.isNaN(next.getTime())) return;
                  setDraft({
                    ...draft,
                    publishedAt: next.toISOString()
                  });
                }}
              />
            </label>
            <p className="admin-form-hint">
              סטטוס נוכחי: {draft.isActive ? "מפורסם באתר" : "טיוטה (לא מוצג באתר)"}. השתמשו בכפתורים למטה לשמירה או לפרסום.
            </p>

            {!isNew ? <StoryLinksPanel story={draft} /> : null}

            <div className="admin-toolbar" style={{ marginTop: 16 }}>
              <select
                value={newSectionType}
                onChange={(e) => setNewSectionType(e.target.value as StorySectionType)}
              >
                {STORY_SECTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {SECTION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              <button
                className="button secondary"
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    sections: [...draft.sections, createDefaultStorySection(newSectionType)]
                  })
                }
              >
                הוסף מקטע
              </button>
            </div>

            {draft.sections.map((section, index) => (
              <SectionEditor
                key={`${section.type}-${index}`}
                section={section}
                index={index}
                total={draft.sections.length}
                disabled={isPending}
                pickableImages={pickableImages}
                onChange={(next) =>
                  setDraft({
                    ...draft,
                    sections: updateSectionAt(draft.sections, index, () => next)
                  })
                }
                onMoveUp={() =>
                  setDraft({
                    ...draft,
                    sections: moveSection(draft.sections, index, -1)
                  })
                }
                onMoveDown={() =>
                  setDraft({
                    ...draft,
                    sections: moveSection(draft.sections, index, 1)
                  })
                }
                onRemove={() =>
                  setDraft({
                    ...draft,
                    sections: draft.sections.filter((_, i) => i !== index)
                  })
                }
              />
            ))}

            </>
            )}

            {error ? (
              <p className="admin-form-error" role="alert">
                {error}
              </p>
            ) : null}
            {serverSaveOk && !error ? (
              <p className="admin-form-hint" role="status">
                {serverSaveOk}
              </p>
            ) : null}
            <div className="admin-form-actions">
              <button className="button" disabled={isPending} type="submit">
                {isPending ? "שומר…" : "שמור טיוטה"}
              </button>
              <button
                className="button"
                disabled={isPending}
                type="button"
                onClick={(event) => {
                  const form = event.currentTarget.form;
                  if (form && !form.reportValidity()) return;
                  saveStory(true);
                }}
              >
                {isPending ? "מפרסם…" : "פרסם באתר"}
              </button>
              <button className="button secondary" disabled={isPending} type="button" onClick={close}>
                סגור
              </button>
            </div>
            <p className="admin-form-hint">
              &quot;שמור טיוטה&quot; שומר בשרת בלי לפרסם. &quot;פרסם באתר&quot; שומר ומציג בדף הסיפורים. הטיוטה נשמרת גם בדפדפן אוטומטית.
            </p>
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
