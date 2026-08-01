import { SeoContentBody, SeoCtaBlockView } from "@/components/shared/seo-content-body";
import { hasSeoFaqContent, SeoFaqSection } from "@/components/shared/seo-faq-section";
import type { ResolvedCategorySeoContent } from "@/types/seo-content";

type MenuCategorySeoBlockProps = {
  content: ResolvedCategorySeoContent;
  categoryId: string;
};

export function MenuCategorySeoBlock({ content, categoryId }: MenuCategorySeoBlockProps) {
  const hasBottom = Boolean(content.bottomContent.trim());
  const hasFaq = hasSeoFaqContent(content.faq);
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
          paragraphClassName="menu-bleecker-category-bottom-p"
        />
      ) : null}

      {hasFaq ? (
        <SeoFaqSection
          faq={content.faq}
          className="menu-bleecker-category-faq"
          titleId={`menu-category-faq-${categoryId}`}
        />
      ) : null}

      {hasCta ? (
        <SeoCtaBlockView
          {...content.cta}
          className="menu-bleecker-category-cta seo-content-cta"
        />
      ) : null}
    </div>
  );
}
