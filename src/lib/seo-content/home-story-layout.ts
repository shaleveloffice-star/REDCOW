import type { ResolvedSeoPageContent } from "@/types/seo-content";

/** Map resolved home SEO fields onto the existing home-story section layout. */
export function layoutHomeStoryContent(content: ResolvedSeoPageContent) {
  const [intro = "", ...punchLines] = content.introductionParagraphs;

  return {
    title: content.sectionTitle,
    intro,
    punchLines,
    closing: content.bottomParagraphs
  };
}
