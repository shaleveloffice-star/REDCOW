import { createJsonSingleDocStore } from "@/lib/admin/json-single-doc-store";
import { createFirestoreDocumentStore } from "@/lib/firebase/firestore-store";
import {
  DEFAULT_RECOMMENDATIONS_CONFIG,
  normalizeRecommendationsConfig,
  validateRecommendationsInput
} from "@/lib/recommendations/recommendations-config";
import type { RecommendationsConfig, RecommendationsInput } from "@/types/recommendations";

const recommendationsStore = createFirestoreDocumentStore<RecommendationsConfig>(
  "siteSettings",
  "recommendations",
  createJsonSingleDocStore<RecommendationsConfig>(
    "recommendations.json",
    DEFAULT_RECOMMENDATIONS_CONFIG
  )
);

export async function getRecommendationsConfig(): Promise<RecommendationsConfig> {
  return normalizeRecommendationsConfig(await recommendationsStore.get());
}

export async function saveRecommendationsConfig(
  input: RecommendationsInput
): Promise<RecommendationsConfig> {
  const validated = validateRecommendationsInput(input);
  return recommendationsStore.save({
    ...validated,
    items: validated.items
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item, index) => ({ ...item, sortOrder: index + 1 })),
    updatedAt: new Date().toISOString()
  });
}
