import { splitParagraphs } from "@/lib/seo-content/paragraphs";

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
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)} className={paragraphClassName}>
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
};

export function SeoCtaBlockView({
  title,
  body,
  buttonLabel,
  buttonHref,
  className
}: SeoCtaBlockProps) {
  const hasContent = [title, body, buttonLabel].some((value) => value?.trim());
  if (!hasContent) return null;

  const href = buttonHref?.trim() || "#";

  return (
    <aside className={className}>
      {title?.trim() ? <h2 className="seo-content-cta-title">{title}</h2> : null}
      {body?.trim() ? <SeoContentBody text={body} paragraphClassName="seo-content-cta-body" /> : null}
      {buttonLabel?.trim() ? (
        <a className="seo-content-cta-button button" href={href}>
          {buttonLabel}
        </a>
      ) : null}
    </aside>
  );
}
