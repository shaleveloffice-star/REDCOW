import { SeoContentBody, SeoCtaBlockView } from "@/components/shared/seo-content-body";
import { hasValidFaqItems } from "@/lib/seo/faq-utils";
import { SeoFaqSection } from "@/components/shared/seo-faq-section";
import type { ResolvedCategorySeoContent } from "@/types/seo-content";

type MenuCategorySeoBlockProps = {
  content: ResolvedCategorySeoContent;
  categoryId: string;
};

export function MenuCategorySeoBlock({ content, categoryId }: MenuCategorySeoBlockProps) {
  const hasBottom = Boolean(content.bottomContent.trim());
  const hasFaq = hasValidFaqItems(content.faq);
  const hasCta = Boolean(
    content.cta.title?.trim() ||
      content.cta.body?.trim() ||
      content.cta.buttonLabel?.trim()
  );

  if (!hasBottom && !hasFaq && !hasCta) {
    return null;
  }

  return (
    <div className="menu-bleecker-category-seo">
      {hasBottom ? (
        <SeoContentBody
          text={content.bottomContent}
          className="menu-bleecker-category-bottom"
          paragraphClassName="menu-bleecker-prose menu-bleecker-category-bottom-p"
        />
      ) : null}

      {hasFaq ? (
        <SeoFaqSection
          faq={content.faq}
          className="site-faq site-faq--nested"
          titleId={`menu-category-faq-${categoryId}`}
          titleLevel="h3"
          questionLevel="h4"
        />
      ) : null}

      {hasCta ? (
        <SeoCtaBlockView
          {...content.cta}
          className="menu-bleecker-category-cta seo-content-cta"
          titleLevel="h3"
        />
      ) : null}
    </div>
  );
}
