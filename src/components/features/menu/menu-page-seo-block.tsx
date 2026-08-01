import { SeoContentBody, SeoCtaBlockView } from "@/components/shared/seo-content-body";
import type { ResolvedSeoPageContent } from "@/types/seo-content";

export type MenuPageSeoContent = Pick<
  ResolvedSeoPageContent,
  "introduction" | "bottomContent" | "cta"
>;

type MenuPageSeoBlockProps = {
  content: MenuPageSeoContent;
};

export function MenuPageSeoIntro({ content }: MenuPageSeoBlockProps) {
  if (!content.introduction.trim()) {
    return null;
  }

  return <SeoContentBody text={content.introduction} className="menu-bleecker-seo-intro" />;
}

export function MenuPageSeoFooter({ content }: MenuPageSeoBlockProps) {
  const hasBottom = Boolean(content.bottomContent.trim());
  const hasCta = Boolean(
    content.cta.title?.trim() ||
      content.cta.body?.trim() ||
      content.cta.buttonLabel?.trim()
  );

  if (!hasBottom && !hasCta) {
    return null;
  }

  return (
    <div className="menu-bleecker-seo-footer">
      {hasBottom ? (
        <SeoContentBody text={content.bottomContent} className="menu-bleecker-seo-bottom" />
      ) : null}

      {hasCta ? (
        <SeoCtaBlockView
          {...content.cta}
          className="menu-bleecker-seo-cta seo-content-cta"
          titleLevel="h2"
        />
      ) : null}
    </div>
  );
}
