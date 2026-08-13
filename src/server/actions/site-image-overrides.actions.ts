"use server";

import { revalidatePath, updateTag } from "next/cache";

import {
  formatAdminImageSpec,
  getAdminImageSpec,
  getAdminMobileImageSpec,
  type AdminImageSpec
} from "@/data/admin-image-specs";
import { HOME_PAGE_SITE_IMAGE_GROUPS } from "@/data/site-images.registry";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import {
  clearSiteImageOverride,
  listSiteImageOverrides,
  upsertSiteImageOverride
} from "@/services/site-image-overrides.service";
import type { SiteImageOverride } from "@/types/site-images";

export type HomePageSiteImageAdminItem = {
  id: string;
  label: string;
  location: string;
  defaultImageUrl: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  currentImageUrl: string;
  isOverridden: boolean;
  spec: AdminImageSpec;
  mobileSpec: AdminImageSpec;
  recommendedSizeLabel: string;
  recommendedMobileSizeLabel: string;
};

export type HomePageSiteImageAdminGroup = {
  title: string;
  items: HomePageSiteImageAdminItem[];
};

function revalidateSiteImages() {
  updateTag(CACHE_TAGS.siteImages);
  revalidatePath("/");
  revalidatePath("/admin/pages/home");
}

async function requireAdminOrThrow() {
  try {
    await requireAdmin();
  } catch {
    throw new Error("אין הרשאת אדמין. התחברו מחדש ל־/admin/login");
  }
}

function buildHomePageSiteImageGroups(
  overrides: SiteImageOverride[]
): HomePageSiteImageAdminGroup[] {
  const overrideById = new Map(overrides.map((entry) => [entry.id, entry]));

  return HOME_PAGE_SITE_IMAGE_GROUPS.map((group) => ({
    title: group.title,
    items: group.items.map((catalogItem) => {
      const override = overrideById.get(catalogItem.id);
      const desktopImageUrl = override?.imageUrl?.trim() || "";
      const mobileImageUrl = override?.mobileImageUrl?.trim() || "";
      const spec = getAdminImageSpec(catalogItem.id);
      const mobileSpec = getAdminMobileImageSpec(catalogItem.id);

      return {
        id: catalogItem.id,
        label: catalogItem.label,
        location: catalogItem.location,
        defaultImageUrl: catalogItem.defaultImageUrl,
        desktopImageUrl,
        mobileImageUrl,
        currentImageUrl: desktopImageUrl || mobileImageUrl || catalogItem.defaultImageUrl,
        isOverridden: Boolean(desktopImageUrl || mobileImageUrl),
        spec,
        mobileSpec,
        recommendedSizeLabel: formatAdminImageSpec(spec),
        recommendedMobileSizeLabel: formatAdminImageSpec(mobileSpec)
      };
    })
  }));
}

export async function getHomePageSiteImagesAdminData(): Promise<HomePageSiteImageAdminGroup[]> {
  await requireAdminOrThrow();
  const overrides = await listSiteImageOverrides();
  return buildHomePageSiteImageGroups(overrides);
}

export async function saveSiteImageOverrideAction(input: {
  id: string;
  imageUrl?: string;
  mobileImageUrl?: string;
}): Promise<{ ok: true; updatedAt: string }> {
  await requireAdminOrThrow();

  const imageUrl = input.imageUrl?.trim() ?? "";
  const mobileImageUrl = input.mobileImageUrl?.trim() ?? "";
  if (!imageUrl && !mobileImageUrl) {
    throw new Error("נדרשת לפחות תמונה אחת — מסך רחב או מובייל");
  }

  const saved = await upsertSiteImageOverride({
    id: input.id.trim(),
    imageUrl,
    mobileImageUrl
  });

  revalidateSiteImages();
  return { ok: true, updatedAt: saved.updatedAt };
}

export async function resetSiteImageOverrideAction(
  id: string
): Promise<{ ok: true }> {
  await requireAdminOrThrow();

  await clearSiteImageOverride(id.trim());
  revalidateSiteImages();
  return { ok: true };
}
