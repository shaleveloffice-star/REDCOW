"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { AdminImageUrlField } from "@/components/features/admin/admin-site-image-picker";
import { StatusBadge } from "@/components/features/admin/status-badge";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";
import { createId } from "@/lib/admin/new-id";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { resolveStorySlug } from "@/lib/stories/story-slug";
import { deleteBrandStoryAction, saveBrandStoryAction } from "@/server/actions/stories.actions";
import {
  STORY_SECTION_TYPES,
  type BrandStory,
  type StorySection,
  type StorySectionType
} from "@/types/story";

const SECTION_TYPE_LABELS: Record<StorySectionType, string> = {
  "split-text-image": "טקסט + תמונה (ימין)",
  "split-image-text": "תמונה + טקסט (שמאל)",
  "full-image": "תמונה מלאה",
  quote: "ציטוט",
  cta: "קריאה לפעולה"
};

function newStory(items: BrandStory[]): BrandStory {
  const now = new Date().toISOString();
  return {
    id: createId("story"),
    slug: "",
    category: "הסיפור שלנו",
    title: "",
    subtitle: "",
    heroImageUrl: DEFAULT_OG_IMAGE,
    heroImageAlt: "",
    sections: [],
    publishedAt: now,
    isActive: false,
    sortOrder: items.length,
    createdAt: now,
    updatedAt: now
  };
}

function defaultSection(type: StorySectionType): StorySection {
  switch (type) {
    case "split-text-image":
    case "split-image-text":
      return {
        type,
        kicker: "",
        title: "",
        body: "",
        imageUrl: DEFAULT_OG_IMAGE,
        imageAlt: ""
      };
    case "full-image":
      return {
        type,
        imageUrl: DEFAULT_OG_IMAGE,
        imageAlt: "",
        caption: ""
      };
    case "quote":
      return {
        type,
        text: "",
        attribution: ""
      };
    case "cta":
      return {
        type,
        body: "",
        label: "",
        href: "/menu"
      };
    default:
      return {
        type: "split-text-image",
        title: "",
        body: "",
        imageUrl: DEFAULT_OG_IMAGE,
        imageAlt: ""
      };
  }
}

function convertStorySectionType(section: StorySection, nextType: StorySectionType): StorySection {
  if (section.type === nextType) {
    return section;
  }

  if (
    (section.type === "split-text-image" || section.type === "split-image-text") &&
    (nextType === "split-text-image" || nextType === "split-image-text")
  ) {
    return { ...section, type: nextType };
  }

  if (section.type === "split-text-image" || section.type === "split-image-text") {
    switch (nextType) {
      case "full-image":
        return {
          type: "full-image",
          imageUrl: section.imageUrl,
          imageAlt: section.imageAlt,
          caption: section.title.trim() || section.kicker?.trim() || undefined
        };
      case "quote":
        return {
          type: "quote",
          text: section.body.trim() || section.title.trim(),
          attribution: section.kicker?.trim() || undefined
        };
      case "cta":
        return {
          type: "cta",
          body: section.body.trim() || undefined,
          label: section.title.trim() || "לחצו כאן",
          href: "/menu"
        };
      default:
        break;
    }
  }

  if (section.type === "full-image") {
    switch (nextType) {
      case "split-text-image":
      case "split-image-text":
        return {
          type: nextType,
          kicker: "",
          title: section.caption?.trim() ?? "",
          body: "",
          imageUrl: section.imageUrl,
          imageAlt: section.imageAlt
        };
      case "quote":
        return {
          type: "quote",
          text: section.caption?.trim() ?? "",
          attribution: undefined
        };
      case "cta":
        return {
          type: "cta",
          body: section.caption?.trim() || undefined,
          label: "לחצו כאן",
          href: "/menu"
        };
      default:
        break;
    }
  }

  if (section.type === "quote") {
    switch (nextType) {
      case "split-text-image":
      case "split-image-text":
        return {
          type: nextType,
          kicker: section.attribution?.trim() || undefined,
          title: "",
          body: section.text,
          imageUrl: DEFAULT_OG_IMAGE,
          imageAlt: ""
        };
      case "full-image":
        return {
          type: "full-image",
          imageUrl: DEFAULT_OG_IMAGE,
          imageAlt: "",
          caption: section.text
        };
      case "cta":
        return {
          type: "cta",
          body: section.text,
          label: section.attribution?.trim() || "לחצו כאן",
          href: "/menu"
        };
      default:
        break;
    }
  }

  if (section.type === "cta") {
    switch (nextType) {
      case "split-text-image":
      case "split-image-text":
        return {
          type: nextType,
          title: section.label,
          body: section.body?.trim() ?? "",
          imageUrl: DEFAULT_OG_IMAGE,
          imageAlt: ""
        };
      case "full-image":
        return {
          type: "full-image",
          imageUrl: DEFAULT_OG_IMAGE,
          imageAlt: "",
          caption: section.body?.trim() || section.label
        };
      case "quote":
        return {
          type: "quote",
          text: section.body?.trim() || section.label,
          attribution: undefined
        };
      default:
        break;
    }
  }

  return defaultSection(nextType);
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
            label="כתובת תמונה"
            required
            value={section.imageUrl}
            images={pickableImages}
            onChange={(imageUrl) => onChange({ ...section, imageUrl })}
            onAltSuggestion={(alt) => {
              if (!section.imageAlt.trim()) {
                onChange({ ...section, imageAlt: alt });
              }
            }}
          />
          <label>
            תיאור תמונה (alt)
            <input
              required
              value={section.imageAlt}
              onChange={(e) => onChange({ ...section, imageAlt: e.target.value })}
            />
          </label>
        </>
      )}

      {section.type === "full-image" && (
        <>
          <AdminImageUrlField
            label="כתובת תמונה"
            required
            value={section.imageUrl}
            images={pickableImages}
            onChange={(imageUrl) => onChange({ ...section, imageUrl })}
            onAltSuggestion={(alt) => {
              if (!section.imageAlt.trim()) {
                onChange({ ...section, imageAlt: alt });
              }
            }}
          />
          <label>
            תיאור תמונה (alt)
            <input
              required
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
        <p className="admin-form-hint">קישור באתר יופיע לאחר סימון &quot;פעיל (פרסום באתר)&quot; ושמירה.</p>
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
  const isNew = draft ? !items.some((item) => item.id === draft.id) : false;

  const close = () => {
    setDraft(null);
    setError(null);
  };

  useEffect(() => {
    if (draft) return;

    const editId = searchParams.get("edit");
    if (!editId) return;

    const item = items.find((entry) => entry.id === editId);
    if (item) {
      setDraft({ ...item, sections: [...item.sections] });
    }
  }, [draft, items, searchParams]);

  const sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <AdminToolbar label="הוסף סיפור" onAdd={() => setDraft(newStory(items))} />
      <table className="table">
        <thead>
          <tr>
            <th>כותרת</th>
            <th>Slug</th>
            <th>סדר</th>
            <th>סטטוס</th>
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
                  onEdit={() => setDraft({ ...item, sections: [...item.sections] })}
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
              run(async () => {
                await saveBrandStoryAction(draft);
              }, close);
            }}
          >
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
              label="כתובת תמונת Hero"
              required
              value={draft.heroImageUrl}
              images={pickableImages}
              onChange={(heroImageUrl) => setDraft({ ...draft, heroImageUrl })}
              onAltSuggestion={(alt) => {
                if (!draft.heroImageAlt.trim()) {
                  setDraft({ ...draft, heroImageAlt: alt });
                }
              }}
            />
            <label>
              תיאור תמונת Hero (alt)
              <input
                required
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
              פעיל (פרסום באתר — עד שלא מסומן, הסיפור לא יופיע)
            </label>

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
                    sections: [...draft.sections, defaultSection(newSectionType)]
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

            <AdminFormFooter
              isPending={isPending}
              error={error}
              onCancel={close}
              submitLabel={isNew ? "שמור סיפור" : "עדכן סיפור"}
            />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
