"use server";

import { revalidatePath, updateTag } from "next/cache";

import {
  formatAdminImageSpec,
  getAdminImageSpec,
  type AdminImageSpec
} from "@/data/admin-image-specs";
import { HOME_PAGE_SITE_IMAGE_GROUPS } from "@/data/site-images.registry";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { pickSiteImage } from "@/lib/site-image-url";
import {
  clearSiteImageOverride,
  listSiteImageOverrides,
  upsertSiteImageOverride
} from "@/services/site-image-overrides.service";
import { resolveStaticSiteImagesMap } from "@/services/site-images-resolver.service";
import type { SiteImageOverride } from "@/types/site-images";

export type HomePageSiteImageAdminItem = {
  id: string;
  label: string;
  location: string;
  defaultImageUrl: string;
  currentImageUrl: string;
  isOverridden: boolean;
  spec: AdminImageSpec;
  recommendedSizeLabel: string;
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
  siteImagesMap: Awaited<ReturnType<typeof resolveStaticSiteImagesMap>>,
  overrides: SiteImageOverride[]
): HomePageSiteImageAdminGroup[] {
  const overrideIds = new Set(overrides.map((entry) => entry.id));

  return HOME_PAGE_SITE_IMAGE_GROUPS.map((group) => ({
    title: group.title,
    items: group.items.map((catalogItem) => {
      const currentImageUrl = pickSiteImage(
        siteImagesMap,
        catalogItem.id,
        catalogItem.defaultImageUrl
      );

      const spec = getAdminImageSpec(catalogItem.id);

      return {
        id: catalogItem.id,
        label: catalogItem.label,
        location: catalogItem.location,
        defaultImageUrl: catalogItem.defaultImageUrl,
        currentImageUrl,
        isOverridden: overrideIds.has(catalogItem.id),
        spec,
        recommendedSizeLabel: formatAdminImageSpec(spec)
      };
    })
  }));
}

export async function getHomePageSiteImagesAdminData(): Promise<HomePageSiteImageAdminGroup[]> {
  await requireAdminOrThrow();
  const [siteImagesMap, overrides] = await Promise.all([
    resolveStaticSiteImagesMap(),
    listSiteImageOverrides()
  ]);
  return buildHomePageSiteImageGroups(siteImagesMap, overrides);
}

export async function saveSiteImageOverrideAction(input: {
  id: string;
  imageUrl: string;
}): Promise<{ ok: true; updatedAt: string }> {
  await requireAdminOrThrow();

  const imageUrl = input.imageUrl.trim();
  if (!imageUrl) {
    throw new Error("כתובת תמונה נדרשת");
  }

  const saved = await upsertSiteImageOverride({
    id: input.id.trim(),
    imageUrl
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
