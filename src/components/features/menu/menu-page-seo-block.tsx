import { SeoContentBody, SeoCtaBlockView } from "@/components/shared/seo-content-body";
import { SeoFaqSection } from "@/components/shared/seo-faq-section";
import { hasValidFaqItems } from "@/lib/seo/faq-utils";
import type { ResolvedSeoPageContent } from "@/types/seo-content";

export type MenuPageSeoContent = Pick<
  ResolvedSeoPageContent,
  "introduction" | "bottomContent" | "cta" | "faq"
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

  if (!hasBottom && !hasCta && !hasValidFaqItems(content.faq)) {
    return null;
  }

  return (
    <div className="menu-bleecker-seo-footer">
      {hasBottom ? (
        <SeoContentBody text={content.bottomContent} className="menu-bleecker-seo-bottom" />
      ) : null}

      {hasValidFaqItems(content.faq) ? (
        <SeoFaqSection faq={content.faq} titleId="menu-page-faq-title" />
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
