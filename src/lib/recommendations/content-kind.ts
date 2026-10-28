import type { CreatorRecommendation, RecommendationContentKind } from "@/types/recommendations";

export function getRecommendationContentKind(
  item: Pick<CreatorRecommendation, "contentKind"> | { contentKind?: unknown }
): RecommendationContentKind {
  return item.contentKind === "press" ? "press" : "creator";
}

export function isPressRecommendation(
  item: Pick<CreatorRecommendation, "contentKind"> | { contentKind?: unknown }
): boolean {
  return getRecommendationContentKind(item) === "press";
}
