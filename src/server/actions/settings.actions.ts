"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import { revalidatePath, updateTag } from "next/cache";
import { getSettings, listOrderLinks } from "@/services/settings.service";
import { listSiteImageOverrides, upsertSiteImageOverride } from "@/services/site-image-overrides.service";
import { HOME_HERO_IMAGE } from "@/data/site-images.registry";
import { isVideoMediaUrl } from "@/lib/menu-media";
import type { SiteSettings } from "@/types/content";

export async function getSettingsAdminData() {
  await requireAdmin();
  const [settings, orderLinks, overrides] = await Promise.all([getSettings(), listOrderLinks(), listSiteImageOverrides()]);
  const hero = overrides.find(entry => entry.id === "hero-burger");
  const heroMediaUrl = hero?.hidden ? "" : hero?.imageUrl || hero?.mobileImageUrl || HOME_HERO_IMAGE;
  const heroMediaType: SiteSettings["heroMediaType"] = !heroMediaUrl ? "none" : isVideoMediaUrl(heroMediaUrl) ? "video" : "image";
  return { settings: { ...settings, heroMediaType, heroMediaUrl, heroMediaAlt: hero?.label ?? "" }, orderLinks };
}

export async function saveHeroMediaAction(formData: FormData) {
  await requireAdmin();
  const heroMediaType = String(formData.get("heroMediaType") ?? "none") as SiteSettings["heroMediaType"];
  const heroMediaUrl = assertSafeHttpUrl(
    String(formData.get("heroMediaUrl") ?? ""),
    "מדיה Hero"
  );
  const heroMediaAlt = String(formData.get("heroMediaAlt") ?? "").trim();

  if (!["none", "image", "video"].includes(heroMediaType)) throw new Error("סוג מדיה לא תקין");
  if (heroMediaType !== "none" && !heroMediaUrl) throw new Error("כתובת מדיה נדרשת");
  if (heroMediaUrl.startsWith("data:")) throw new Error("יש להעלות את התמונה דרך מנהל התמונות");
  if (heroMediaType !== "none" && (heroMediaType === "video") !== isVideoMediaUrl(heroMediaUrl)) throw new Error("סוג המדיה אינו תואם לכתובת");
  await upsertSiteImageOverride({
    id: "hero-burger",
    imageUrl: heroMediaUrl,
    mobileImageUrl: heroMediaUrl,
    label: heroMediaAlt,
    hidden: heroMediaType === "none"
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  updateTag(CACHE_TAGS.settings);
  updateTag(CACHE_TAGS.siteImages);
  revalidatePath("/admin/pages/home");
}
