import Image from "next/image";
import Link from "next/link";

import { resolveImageAlt } from "@/lib/image-alt";
import type { Locale } from "@/i18n/config";
import { splitParagraphs } from "@/lib/seo-content/paragraphs";
import type { BrandStory, StorySection } from "@/types/story";

type StorySectionsProps = {
  sections: BrandStory["sections"];
  locale: Locale;
};

function sectionTone(index: number): "light" | "dark" {
  return index % 2 === 0 ? "light" : "dark";
}

function SectionBody({ body }: { body: string }) {
  const paragraphs = splitParagraphs(body);
  if (paragraphs.length === 0) return null;

  return (
    <div className="story-section-body">
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
      ))}
    </div>
  );
}

function SplitSection({
  section,
  locale,
  tone,
  reverse
}: {
  section: Extract<StorySection, { type: "split-text-image" | "split-image-text" }>;
  locale: Locale;
  tone: "light" | "dark";
  reverse: boolean;
}) {
  const imageAlt = resolveImageAlt({
    kind: "story",
    locale,
    customAlt: section.imageAlt
  });

  return (
    <section className={`story-section story-section--${tone}`}>
      <div className={`story-split${reverse ? " story-split--reverse" : ""}`}>
        <div className="story-split-copy">
          {section.kicker?.trim() ? <p className="story-section-kicker">{section.kicker}</p> : null}
          {section.title.trim() ? <h2 className="story-section-title">{section.title}</h2> : null}
          <SectionBody body={section.body} />
        </div>
        <div className="story-split-media">
          <Image
            src={section.imageUrl}
            alt={imageAlt}
            width={960}
            height={720}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="story-split-image"
          />
        </div>
      </div>
    </section>
  );
}

function renderSection(section: StorySection, index: number, locale: Locale) {
  const tone = sectionTone(index);

  switch (section.type) {
    case "split-text-image":
      return (
        <SplitSection key={`${section.type}-${index}`} section={section} locale={locale} tone={tone} reverse={false} />
      );
    case "split-image-text":
      return (
        <SplitSection key={`${section.type}-${index}`} section={section} locale={locale} tone={tone} reverse />
      );
    case "full-image": {
      const imageAlt = resolveImageAlt({
        kind: "story",
        locale,
        customAlt: section.imageAlt
      });

      return (
        <section key={`${section.type}-${index}`} className={`story-section story-section--${tone}`}>
          <figure className="story-full-image-wrap">
            <Image
              src={section.imageUrl}
              alt={imageAlt}
              width={1200}
              height={800}
              sizes="100vw"
              className="story-full-image"
            />
            {section.caption?.trim() ? (
              <figcaption className="story-full-caption">{section.caption}</figcaption>
            ) : null}
          </figure>
        </section>
      );
    }
    case "quote":
      return (
        <section key={`${section.type}-${index}`} className={`story-section story-section--${tone}`}>
          <blockquote className="story-quote">
            <p className="story-quote-text">&ldquo;{section.text}&rdquo;</p>
            {section.attribution?.trim() ? (
              <footer className="story-quote-attribution">{section.attribution}</footer>
            ) : null}
          </blockquote>
        </section>
      );
    case "cta":
      return (
        <section key={`${section.type}-${index}`} className={`story-section story-section--${tone}`}>
          <div className="story-cta-block">
            {section.body?.trim() ? <p className="story-cta-body">{section.body}</p> : null}
            <Link href={section.href} className="story-cta-link">
              {section.label}
            </Link>
          </div>
        </section>
      );
    default:
      return null;
  }
}

export function StorySections({ sections, locale }: StorySectionsProps) {
  if (!sections.length) return null;

  return <div className="story-sections">{sections.map((section, index) => renderSection(section, index, locale))}</div>;
}
