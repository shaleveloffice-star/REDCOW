"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import { revalidatePath, updateTag } from "next/cache";
import { getSettings, listOrderLinks, updateSettings } from "@/services/settings.service";
import type { SiteSettings } from "@/types/content";

export async function getSettingsAdminData() {
  await requireAdmin();
  const [settings, orderLinks] = await Promise.all([getSettings(), listOrderLinks()]);
  return { settings, orderLinks };
}

export async function saveHeroMediaAction(formData: FormData) {
  await requireAdmin();
  const settings = await getSettings();
  const heroMediaType = String(formData.get("heroMediaType") ?? "none") as SiteSettings["heroMediaType"];
  const heroMediaUrl = assertSafeHttpUrl(
    String(formData.get("heroMediaUrl") ?? ""),
    "מדיה Hero"
  );
  const heroMediaAlt = String(formData.get("heroMediaAlt") ?? "").trim();

  await updateSettings({
    ...settings,
    heroMediaType,
    heroMediaUrl,
    heroMediaAlt
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  updateTag(CACHE_TAGS.settings);
}
