"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { getPageVisibility, savePageVisibility } from "@/repositories/page-visibility.repository";

export async function getPageVisibilityAdminData() {
  await requireAdmin();
  return getPageVisibility();
}

export async function setAboutPageEnabledAction(aboutEnabled: boolean) {
  await requireAdmin();
  const saved = await savePageVisibility(aboutEnabled);
  updateTag(CACHE_TAGS.pageVisibility);
  revalidatePath("/", "layout");
  revalidatePath("/about");
  revalidatePath("/admin/pages/about");
  return saved;
}
