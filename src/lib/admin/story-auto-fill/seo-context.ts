import "server-only";

import { SEO_PAGE_DEFINITIONS, SEO_PAGE_IDS, type SeoPageId } from "@/types/seo-content";
import { getResolvedSeoPageContent } from "@/services/seo-content.service";

import type { SeoCannibalizationCluster } from "./cannibalization";
import type { SeoSuggestContextPage } from "./openai-suggest-prompt";

export type SeoSuggestContext = {
  pages: SeoSuggestContextPage[];
  clusters: SeoCannibalizationCluster[];
  sourcesLoaded: string[];
  sourcesMissing: string[];
};

const PAGE_PATHS: Record<SeoPageId, string> = {
  home: "/",
  about: "/about",
  menu: "/menu",
  locations: "/locations",
  privacy: "/privacy",
  terms: "/terms"
};

const SKIP_PAGE_IDS = new Set<SeoPageId>(["privacy", "terms"]);

function labelForPage(pageId: SeoPageId): string {
  return SEO_PAGE_DEFINITIONS.find((def) => def.id === pageId)?.labelHe ?? pageId;
}

function categoryPathFromKey(key: string): string {
  const slug = key.replace(/^cat-/i, "").trim().toLowerCase();
  if (!slug) return "/menu";
  if (slug === "burgers" || slug.includes("burger")) return "/menu/burgers";
  if (slug === "meals" || slug.includes("meal")) return "/menu/meals";
  return `/menu/${slug}`;
}

function keywordFromMeta(metaTitle: string, fallback: string): string {
  const cleaned = metaTitle
    .replace(/\|\s*NB BURGER/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length >= 3) return cleaned.slice(0, 80);
  return fallback;
}

/**
 * Loads SEO intent + CMS resolved meta for cannibalization / suggest context.
 * Never throws — reports missing sources instead.
 */
export async function loadSeoSuggestContext(): Promise<SeoSuggestContext> {
  const pages: SeoSuggestContextPage[] = [];
  const clusters: SeoCannibalizationCluster[] = [];
  const sourcesLoaded: string[] = ["static-seo-clusters"];
  const sourcesMissing: string[] = [];

  try {
    for (const pageId of SEO_PAGE_IDS) {
      if (SKIP_PAGE_IDS.has(pageId)) continue;
      const resolved = await getResolvedSeoPageContent("he", pageId);
      const label = labelForPage(pageId);
      const path = PAGE_PATHS[pageId];
      const metaTitle = resolved.metaTitle?.trim() || "";
      const metaDescription = resolved.metaDescription?.trim() || "";

      pages.push({
        pageId,
        label,
        path,
        metaTitle,
        metaDescription,
        source: "seo-page"
      });

      clusters.push({
        keyword: keywordFromMeta(metaTitle, label),
        label,
        path,
        source: "seo-page",
        suggestedAngle: `הימנעו מחפיפה עם כוונת החיפוש של ${label} (${path}). בחרו זווית מגזינית/סיפורית אחרת.`,
        blob: [metaTitle, metaDescription, resolved.sectionTitle ?? "", resolved.introduction ?? ""]
          .filter(Boolean)
          .join(" ")
          .slice(0, 500)
      });

      if (pageId === "menu" && resolved.categoryPages) {
        for (const [categoryKey, categoryContent] of Object.entries(resolved.categoryPages)) {
          const catLabel = `קטגוריית תפריט (${categoryKey})`;
          const catPath = categoryPathFromKey(categoryKey);
          const catMetaTitle = categoryContent.metaTitle?.trim() || "";
          const catMetaDescription = categoryContent.metaDescription?.trim() || "";
          pages.push({
            pageId: categoryKey,
            label: catLabel,
            path: catPath,
            metaTitle: catMetaTitle,
            metaDescription: catMetaDescription,
            source: "menu-category"
          });
          clusters.push({
            keyword: keywordFromMeta(catMetaTitle, categoryKey),
            label: catLabel,
            path: catPath,
            source: "menu-category",
            suggestedAngle: `אל תתחרו על עמוד ההזמנה של הקטגוריה ${catPath}. כתבו הסבר/סיפור, לא דף מכירה.`,
            blob: [
              catMetaTitle,
              catMetaDescription,
              categoryContent.introduction ?? "",
              categoryContent.bottomContent ?? ""
            ]
              .filter(Boolean)
              .join(" ")
              .slice(0, 500)
          });
        }
        sourcesLoaded.push("menu-category-seo");
      }
    }
    sourcesLoaded.push("resolved-seo-pages");
    sourcesLoaded.push("seo-intent-via-resolved");
  } catch (err) {
    sourcesMissing.push("resolved-seo-pages");
    sourcesMissing.push("seo-intent-via-resolved");
    sourcesMissing.push("menu-category-seo");
    console.warn(
      "[loadSeoSuggestContext]",
      err instanceof Error ? err.message : err
    );
  }

  return { pages, clusters, sourcesLoaded, sourcesMissing };
}
