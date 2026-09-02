import "server-only";

import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { revalidatePath, updateTag } from "next/cache";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/menu",
  "/menu/meals",
  "/locations",
  "/privacy-policy",
  "/terms"
] as const;

export function revalidateSeoContentCache() {
  try {
    updateTag(CACHE_TAGS.seoContent);
    PUBLIC_PATHS.forEach((path) => revalidatePath(path));
  } catch {
    // ignore cache revalidation failures
  }
}
