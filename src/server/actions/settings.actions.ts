"use server";

import { revalidatePath } from "next/cache";
import { getSettings, listOrderLinks, updateSettings, upsertOrderLink } from "@/services/settings.service";
import type { OrderLink, SiteSettings } from "@/types/content";

export async function getSettingsAdminData() {
  const [settings, orderLinks] = await Promise.all([getSettings(), listOrderLinks()]);
  return { settings, orderLinks };
}

export async function saveSettingsAction(input: SiteSettings) {
  return updateSettings(input);
}

export async function saveHeroMediaAction(formData: FormData) {
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
}

export async function saveOrderLinkAction(input: OrderLink) {
  return upsertOrderLink(input);
}
