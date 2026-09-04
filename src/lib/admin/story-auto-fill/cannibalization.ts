import type {
  StoryAutoFillExistingStory,
  StoryAutoFillInput,
  StoryCannibalizationHit
} from "./types";

export type SeoCannibalizationCluster = {
  keyword: string;
  label: string;
  path: string;
  source: StoryCannibalizationHit["source"];
  suggestedAngle: string;
  /** Extra searchable text (meta title/description etc.). */
  blob?: string;
};

/** Built-in SEO / menu keyword clusters (always available). */
export const STATIC_SEO_CLUSTERS: SeoCannibalizationCluster[] = [
  {
    keyword: "המבורגר ברעננה",
    label: "דף הבית",
    path: "/",
    source: "seo-page",
    suggestedAngle: "התמקדו בזווית מגזינית/סיפורית שלא מתחרה על חיפוש מקומי של הדף הראשי."
  },
  {
    keyword: "המבורגר רעננה",
    label: "דף הבית",
    path: "/",
    source: "seo-page",
    suggestedAngle: "בחרו זווית תוכן (הכנה, חומרי גלם, חוויה) במקום דף נחיתה מקומי."
  },
  {
    keyword: "המבורגר כשר",
    label: "קטגוריית המבורגרים",
    path: "/menu/burgers",
    source: "menu-category",
    suggestedAngle: "כתבו על תהליך/סיפור מאחורי הכשרות, לא כעמוד הזמנה של המבורגרים."
  },
  {
    keyword: "סמאש בורגר",
    label: "קטגוריית המבורגרים / כתבה קיימת",
    path: "/menu/burgers",
    source: "menu-category",
    suggestedAngle: "התמקדו בהסבר קולינרי או השוואה עדינה — לא בדף מכירה של מנה."
  },
  {
    keyword: "ארוחת המבורגר",
    label: "קטגוריית ארוחות",
    path: "/menu/meals",
    source: "menu-category",
    suggestedAngle: "כתבו על מתי מתאימה ארוחה משולבת, לא כעמוד הזמנת ארוחות."
  },
  {
    keyword: "מיקום ושעות",
    label: "עמוד מיקומים",
    path: "/locations",
    source: "seo-page",
    suggestedAngle: "הימנעו מלוגיסטיקה של הגעה — השאירו את זה לעמוד המיקום."
  }
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[״"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function includesKeyword(haystack: string, keyword: string): boolean {
  const h = normalizeText(haystack);
  const k = normalizeText(keyword);
  if (!h || !k || k.length < 3) return false;
  return h.includes(k);
}

function parseSecondary(input: string): string[] {
  return input
    .split(/[,،\n|/]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function clusterSearchBlob(cluster: SeoCannibalizationCluster): string {
  return [cluster.keyword, cluster.blob ?? "", cluster.label].join(" ");
}

export type FindCannibalizationOptions = {
  excludeStoryId?: string;
  /** Extra SEO/CMS clusters beyond the static list. */
  extraClusters?: SeoCannibalizationCluster[];
  /** Extra probe strings (e.g. title, angle) treated like keywords. */
  extraProbeTexts?: string[];
};

export function findStoryCannibalizationHits(
  input: StoryAutoFillInput,
  existingStories: StoryAutoFillExistingStory[],
  options?: FindCannibalizationOptions
): StoryCannibalizationHit[] {
  const hits: StoryCannibalizationHit[] = [];
  const keywords = [
    input.primaryKeyword.trim(),
    ...parseSecondary(input.secondaryKeywords),
    ...(options?.extraProbeTexts ?? []).map((part) => part.trim()).filter(Boolean)
  ].filter(Boolean);

  const clusters = [...STATIC_SEO_CLUSTERS, ...(options?.extraClusters ?? [])];

  for (const keyword of keywords) {
    for (const cluster of clusters) {
      const blob = clusterSearchBlob(cluster);
      if (
        includesKeyword(keyword, cluster.keyword) ||
        includesKeyword(cluster.keyword, keyword) ||
        normalizeText(keyword) === normalizeText(cluster.keyword) ||
        includesKeyword(blob, keyword)
      ) {
        hits.push({
          source: cluster.source,
          label: cluster.label,
          path: cluster.path,
          keyword,
          reason: `חפיפה למילת מפתח של ${cluster.label} (${cluster.path})`,
          suggestedAngle: cluster.suggestedAngle
        });
      }
    }

    for (const story of existingStories) {
      if (options?.excludeStoryId && story.id === options.excludeStoryId) continue;
      const blob = [story.title, story.subtitle, story.metaTitle ?? "", story.metaDescription ?? "", story.slug].join(
        " "
      );
      if (!includesKeyword(blob, keyword)) continue;
      hits.push({
        source: "story",
        label: story.title || story.slug,
        path: `/stories/${story.slug}`,
        keyword,
        reason: story.isActive
          ? "סיפור מפורסם קיים עם חפיפת מילת מפתח"
          : "סיפור קיים (טיוטה/לא פעיל) עם חפיפת מילת מפתח",
        suggestedAngle: "שנו את הזווית או את מילת המפתח הראשית כדי להימנע מכפילות."
      });
    }
  }

  const unique = new Map<string, StoryCannibalizationHit>();
  for (const hit of hits) {
    unique.set(`${hit.path}|${hit.keyword}|${hit.source}`, hit);
  }
  return [...unique.values()];
}

export type CannibalizationRiskLevel = "low" | "medium" | "high";

export function scoreCannibalizationRisk(hits: StoryCannibalizationHit[]): CannibalizationRiskLevel {
  if (hits.length === 0) return "low";
  const high = hits.some(
    (hit) => hit.source !== "story" || hit.reason.includes("מפורסם")
  );
  if (high) return "high";
  return "medium";
}

export function isBlockingCannibalization(hits: StoryCannibalizationHit[]): boolean {
  return scoreCannibalizationRisk(hits) === "high";
}
