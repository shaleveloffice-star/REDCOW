"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import {
  getRecommendationsConfig,
  saveRecommendationsConfig
} from "@/repositories/recommendations.repository";
import type { RecommendationsInput } from "@/types/recommendations";

export async function getRecommendationsAdminData() {
  await requireAdmin();
  return getRecommendationsConfig();
}

export async function saveRecommendationsAction(input: RecommendationsInput) {
  await requireAdmin();
  const saved = await saveRecommendationsConfig(input);
  updateTag(CACHE_TAGS.recommendations);
  revalidatePath("/", "layout");
  revalidatePath("/recommendations");
  revalidatePath("/admin/recommendations");
  revalidatePath("/sitemap.xml");
  return saved;
}
