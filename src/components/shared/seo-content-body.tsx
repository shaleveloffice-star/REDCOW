import { splitParagraphs } from "@/lib/seo-content/paragraphs";
import { isSafePublicHref } from "@/lib/security/safe-url";

type SeoContentBodyProps = {
  text: string;
  className?: string;
  paragraphClassName?: string;
};

/** Renders plain/markdown-lite body text as paragraphs (split on blank lines). */
export function SeoContentBody({ text, className, paragraphClassName }: SeoContentBodyProps) {
  const paragraphs = splitParagraphs(text);
  if (paragraphs.length === 0) return null;

  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 32)}`} className={paragraphClassName}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

type SeoCtaBlockProps = {
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
  className?: string;
  titleLevel?: "h2" | "h3";
};

export function SeoCtaBlockView({
  title,
  body,
  buttonLabel,
  buttonHref,
  className,
  titleLevel = "h2"
}: SeoCtaBlockProps) {
  const hasContent = [title, body, buttonLabel].some((value) => value?.trim());
  if (!hasContent) return null;

  const href = buttonHref?.trim();
  const safeHref = href && isSafePublicHref(href) ? href : undefined;
  const TitleTag = titleLevel;

  return (
    <aside className={className}>
      {title?.trim() ? (
        <TitleTag className="seo-content-cta-title">{title}</TitleTag>
      ) : null}
      {body?.trim() ? <SeoContentBody text={body} paragraphClassName="seo-content-cta-body" /> : null}
      {buttonLabel?.trim() && safeHref ? (
        <a className="seo-content-cta-button button" href={safeHref}>
          {buttonLabel}
        </a>
      ) : null}
    </aside>
  );
}
