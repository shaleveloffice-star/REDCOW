"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { revalidatePath, updateTag } from "next/cache";
import { getSettings, listOrderLinks, updateSettings, upsertOrderLink } from "@/services/settings.service";
import type { OrderLink, SiteSettings } from "@/types/content";

export async function getSettingsAdminData() {
  await requireAdmin();
  const [settings, orderLinks] = await Promise.all([getSettings(), listOrderLinks()]);
  return { settings, orderLinks };
}

export async function saveSettingsAction(input: SiteSettings) {
  await requireAdmin();
  return updateSettings(input);
}

export async function saveHeroMediaAction(formData: FormData) {
  await requireAdmin();
  const settings = await getSettings();
  const heroMediaType = String(formData.get("heroMediaType") ?? "none") as SiteSettings["heroMediaType"];
  const heroMediaUrl = String(formData.get("heroMediaUrl") ?? "").trim();
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

export async function saveOrderLinkAction(input: OrderLink) {
  await requireAdmin();
  return upsertOrderLink(input);
}
