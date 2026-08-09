import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { resolveImageAlt } from "@/lib/image-alt";
import { convertStorySectionType, flipSplitSectionType } from "@/lib/stories/convert-section-type";
import { storyEditableHit, StoryEditableImageWrap } from "@/lib/stories/story-editable-ui";
import type { Locale } from "@/i18n/config";
import { splitParagraphs } from "@/lib/seo-content/paragraphs";
import { STORY_SECTION_TYPES, type BrandStory, type StorySection, type StorySectionType } from "@/types/story";
import type { StoryPreviewEditor } from "@/types/story-preview-editor";

const SECTION_TYPE_LABELS: Record<StorySectionType, string> = {
  "split-text-image": "טקסט + תמונה (ימין)",
  "split-image-text": "תמונה + טקסט (שמאל)",
  "full-image": "תמונה מלאה",
  quote: "ציטוט",
  cta: "קריאה לפעולה"
};

type StorySectionsProps = {
  sections: BrandStory["sections"];
  locale: Locale;
  editor?: StoryPreviewEditor;
};

function sectionTone(index: number): "light" | "dark" {
  return index % 2 === 0 ? "light" : "dark";
}

function SectionEditChrome({
  editor,
  index,
  section,
  children
}: {
  editor?: StoryPreviewEditor;
  index: number;
  section: StorySection;
  children: ReactNode;
}) {
  if (!editor?.active) {
    return children;
  }

  return (
    <div className="story-editable-section">
      <div className="story-editable-section-toolbar">
        <span className="story-editable-section-label">מקטע {index + 1}</span>
        {(section.type === "split-text-image" || section.type === "split-image-text") && (
          <button
            className="story-editable-toolbar-btn"
            type="button"
            onClick={() => editor.onEditSection(index, flipSplitSectionType(section))}
          >
            החלף צד תמונה
          </button>
        )}
        <select
          className="story-editable-toolbar-select"
          value={section.type}
          onChange={(event) =>
            editor.onEditSection(index, convertStorySectionType(section, event.target.value as StorySectionType))
          }
        >
          {STORY_SECTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {SECTION_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>
      {children}
    </div>
  );
}

function SectionBody({
  body,
  editor,
  onSave
}: {
  body: string;
  editor?: StoryPreviewEditor;
  onSave: (value: string) => void;
}) {
  const paragraphs = splitParagraphs(body);
  const displayBody = body.trim() || (editor?.active ? "לחצו לעריכת תוכן" : "");

  if (paragraphs.length === 0 && !editor?.active) {
    return null;
  }

  return (
    <div
      className="story-section-body"
      {...storyEditableHit(editor, {
        label: "תוכן מקטע",
        value: body,
        multiline: true,
        onSave
      })}
    >
      {paragraphs.length > 0
        ? paragraphs.map((paragraph) => <p key={paragraph.slice(0, 48)}>{paragraph}</p>)
        : <p>{displayBody}</p>}
    </div>
  );
}

function SplitSection({
  section,
  locale,
  tone,
  reverse,
  editor,
  sectionIndex,
  onUpdate
}: {
  section: Extract<StorySection, { type: "split-text-image" | "split-image-text" }>;
  locale: Locale;
  tone: "light" | "dark";
  reverse: boolean;
  editor?: StoryPreviewEditor;
  sectionIndex: number;
  onUpdate: (section: StorySection) => void;
}) {
  const imageAlt = resolveImageAlt({
    kind: "story",
    locale,
    customAlt: section.imageAlt
  });

  return (
    <SectionEditChrome editor={editor} index={sectionIndex} section={section}>
      <section className={`story-section story-section--${tone}`}>
        <div className={`story-split${reverse ? " story-split--reverse" : ""}`}>
          <div className="story-split-copy">
            {section.kicker?.trim() || editor?.active ? (
              <p
                className="story-section-kicker"
                {...storyEditableHit(editor, {
                  label: "Kicker",
                  value: section.kicker ?? "",
                  onSave: (kicker) => onUpdate({ ...section, kicker })
                })}
              >
                {section.kicker?.trim() || "Kicker (אופציונלי)"}
              </p>
            ) : null}
            <h2
              className="story-section-title"
              {...storyEditableHit(editor, {
                label: "כותרת מקטע",
                value: section.title,
                onSave: (title) => onUpdate({ ...section, title })
              })}
            >
              {section.title.trim() || "לחצו לעריכת כותרת"}
            </h2>
            <SectionBody
              body={section.body}
              editor={editor}
              onSave={(body) => onUpdate({ ...section, body })}
            />
          </div>
          <div className="story-split-media">
            <StoryEditableImageWrap
              editor={editor}
              onPick={(url, label) =>
                onUpdate({
                  ...section,
                  imageUrl: url,
                  ...(label && !section.imageAlt.trim() ? { imageAlt: label } : {})
                })
              }
            >
              <Image
                src={section.imageUrl}
                alt={imageAlt}
                width={960}
                height={720}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="story-split-image"
              />
            </StoryEditableImageWrap>
          </div>
        </div>
      </section>
    </SectionEditChrome>
  );
}

function renderSection(
  section: StorySection,
  index: number,
  locale: Locale,
  editor?: StoryPreviewEditor
) {
  const tone = sectionTone(index);
  const onUpdate = (next: StorySection) => editor?.onEditSection(index, next);

  switch (section.type) {
    case "split-text-image":
      return (
        <SplitSection
          key={`${section.type}-${index}`}
          section={section}
          locale={locale}
          tone={tone}
          reverse={false}
          editor={editor}
          sectionIndex={index}
          onUpdate={onUpdate}
        />
      );
    case "split-image-text":
      return (
        <SplitSection
          key={`${section.type}-${index}`}
          section={section}
          locale={locale}
          tone={tone}
          reverse
          editor={editor}
          sectionIndex={index}
          onUpdate={onUpdate}
        />
      );
    case "full-image": {
      const imageAlt = resolveImageAlt({
        kind: "story",
        locale,
        customAlt: section.imageAlt
      });

      return (
        <SectionEditChrome key={`${section.type}-${index}`} editor={editor} index={index} section={section}>
          <section className={`story-section story-section--${tone}`}>
            <figure className="story-full-image-wrap">
              <StoryEditableImageWrap
                editor={editor}
                onPick={(url, label) =>
                  onUpdate({
                    ...section,
                    imageUrl: url,
                    ...(label && !section.imageAlt.trim() ? { imageAlt: label } : {})
                  })
                }
              >
                <Image
                  src={section.imageUrl}
                  alt={imageAlt}
                  width={1200}
                  height={800}
                  sizes="100vw"
                  className="story-full-image"
                />
              </StoryEditableImageWrap>
              {section.caption?.trim() || editor?.active ? (
                <figcaption
                  className="story-full-caption"
                  {...storyEditableHit(editor, {
                    label: "כיתוב תמונה",
                    value: section.caption ?? "",
                    onSave: (caption) => onUpdate({ ...section, caption })
                  })}
                >
                  {section.caption?.trim() || "כיתוב (אופציונלי)"}
                </figcaption>
              ) : null}
            </figure>
          </section>
        </SectionEditChrome>
      );
    }
    case "quote":
      return (
        <SectionEditChrome key={`${section.type}-${index}`} editor={editor} index={index} section={section}>
          <section className={`story-section story-section--${tone}`}>
            <blockquote className="story-quote">
              <p
                className="story-quote-text"
                {...storyEditableHit(editor, {
                  label: "טקסט ציטוט",
                  value: section.text,
                  multiline: true,
                  onSave: (text) => onUpdate({ ...section, text })
                })}
              >
                &ldquo;{section.text.trim() || "לחצו לעריכת ציטוט"}&rdquo;
              </p>
              {section.attribution?.trim() || editor?.active ? (
                <footer
                  className="story-quote-attribution"
                  {...storyEditableHit(editor, {
                    label: "ייחוס ציטוט",
                    value: section.attribution ?? "",
                    onSave: (attribution) => onUpdate({ ...section, attribution })
                  })}
                >
                  {section.attribution?.trim() || "ייחוס (אופציונלי)"}
                </footer>
              ) : null}
            </blockquote>
          </section>
        </SectionEditChrome>
      );
    case "cta":
      return (
        <SectionEditChrome key={`${section.type}-${index}`} editor={editor} index={index} section={section}>
          <section className={`story-section story-section--${tone}`}>
            <div className="story-cta-block">
              {section.body?.trim() || editor?.active ? (
                <p
                  className="story-cta-body"
                  {...storyEditableHit(editor, {
                    label: "טקסט מקדים (CTA)",
                    value: section.body ?? "",
                    onSave: (body) => onUpdate({ ...section, body })
                  })}
                >
                  {section.body?.trim() || "טקסט מקדים (אופציונלי)"}
                </p>
              ) : null}
              {editor?.active ? (
                <span
                  className="story-cta-link"
                  {...storyEditableHit(editor, {
                    label: "תווית כפתור",
                    value: section.label,
                    onSave: (label) => onUpdate({ ...section, label })
                  })}
                >
                  {section.label.trim() || "תווית כפתור"}
                </span>
              ) : (
                <Link href={section.href} className="story-cta-link">
                  {section.label}
                </Link>
              )}
              {editor?.active ? (
                <button
                  className="story-editable-inline-link-btn"
                  type="button"
                  {...storyEditableHit(editor, {
                    label: "קישור CTA",
                    value: section.href,
                    onSave: (href) => onUpdate({ ...section, href })
                  })}
                >
                  עריכת קישור: {section.href}
                </button>
              ) : null}
            </div>
          </section>
        </SectionEditChrome>
      );
    default:
      return null;
  }
}

export function StorySections({ sections, locale, editor }: StorySectionsProps) {
  if (!sections.length) {
    return editor?.active ? (
      <p className="admin-story-preview-empty">אין מקטעים. הוסיפו מקטעים בטאב &quot;טופס&quot;.</p>
    ) : null;
  }

  return (
    <div className="story-sections">
      {sections.map((section, index) => renderSection(section, index, locale, editor))}
    </div>
  );
}
