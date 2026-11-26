"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { normalizeSiteNavConfig } from "@/repositories/site-nav.repository";
import { getSiteNav, updateSiteNav } from "@/services/site-nav.service";
import type { SiteNavConfig } from "@/types/content";
import { revalidatePath, updateTag } from "next/cache";

export type SiteNavSaveResult = {
  ok: true;
  config: SiteNavConfig;
};

function revalidateSiteNav() {
  try {
    updateTag(CACHE_TAGS.siteNav);
    revalidatePath("/", "layout");
    revalidatePath("/admin/pages/navigation");
  } catch {
    // ignore
  }
}

export async function getSiteNavAdminData() {
  await requireAdmin();
  return getSiteNav();
}

export async function saveSiteNavAction(
  input: Partial<SiteNavConfig>
): Promise<SiteNavSaveResult> {
  try {
    await requireAdmin();
  } catch {
    throw new Error("אין הרשאת אדמין. התחברו מחדש ל־/admin/login");
  }

  const next = normalizeSiteNavConfig({
    ...input,
    updatedAt: new Date().toISOString()
  });

  if (next.itemIds.length === 0) {
    throw new Error("רשימת הניווט ריקה.");
  }

  const saved = await updateSiteNav(next);
  revalidateSiteNav();
  return { ok: true, config: saved };
}
