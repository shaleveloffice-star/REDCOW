"use server";

import { revalidatePath } from "next/cache";
import { getGalleryItemById } from "@/repositories/gallery.repository";
import { getMenuItemById } from "@/repositories/menu.repository";
import { getPressItems } from "@/repositories/press.repository";
import {
  clearSiteImageOverride,
  hideSiteImageOverride,
  upsertSiteImageOverride
} from "@/services/site-image-overrides.service";
import { getSiteImagesCatalog } from "@/services/site-images.service";
import { removeGalleryItem, upsertGalleryItem } from "@/services/gallery.service";
import { removeMenuItem, upsertMenuItem } from "@/services/menu.service";
import { removePressItem, upsertPressItem } from "@/services/press.service";
import { getSettings, updateSettings } from "@/services/settings.service";
import type { SiteImageDeleteInput, SiteImageUpdateInput } from "@/types/site-images";

const REVALIDATE_PATHS = ["/", "/about", "/menu", "/admin/site-images"];

function revalidateSiteImages() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

export async function getSiteImagesAdminData() {
  return getSiteImagesCatalog();
}

export async function updateSiteImageAction(input: SiteImageUpdateInput) {
  const imageUrl = input.imageUrl.trim();
  if (!imageUrl) {
    throw new Error("כתובת תמונה נדרשת");
  }

  switch (input.source) {
    case "static": {
      await upsertSiteImageOverride({
        id: input.id,
        imageUrl,
        label: input.label?.trim() || undefined,
        hidden: false
      });
      break;
    }
    case "settings-hero": {
      const settings = await getSettings();
      await updateSettings({
        ...settings,
        heroMediaType: "image",
        heroMediaUrl: imageUrl
      });
      break;
    }
    case "settings-hero-video": {
      const settings = await getSettings();
      await updateSettings({
        ...settings,
        heroMediaType: "video",
        heroMediaUrl: imageUrl
      });
      break;
    }
    case "settings-og": {
      const settings = await getSettings();
      await updateSettings({
        ...settings,
        ogImageUrl: imageUrl
      });
      break;
    }
    case "menu": {
      if (!input.entityId) throw new Error("מזהה מנה חסר");
      const menuItem = await getMenuItemById(input.entityId);
      if (!menuItem) throw new Error("המנה לא נמצאה");
      await upsertMenuItem({ ...menuItem, imageUrl });
      break;
    }
    case "gallery": {
      if (!input.entityId) throw new Error("מזהה גלריה חסר");
      const galleryItem = await getGalleryItemById(input.entityId);
      if (!galleryItem) throw new Error("פריט הגלריה לא נמצא");
      await upsertGalleryItem({ ...galleryItem, imageUrl });
      break;
    }
    case "press": {
      if (!input.entityId) throw new Error("מזהה כתבה חסר");
      const pressItems = await getPressItems();
      const pressItem = pressItems.find((entry) => entry.id === input.entityId);
      if (!pressItem) throw new Error("הכתבה לא נמצאה");
      await upsertPressItem({ ...pressItem, imageUrl });
      break;
    }
    default:
      throw new Error("סוג תמונה לא נתמך");
  }

  revalidateSiteImages();
}

export async function deleteSiteImageAction(input: SiteImageDeleteInput) {
  switch (input.source) {
    case "static": {
      await hideSiteImageOverride(input.id);
      break;
    }
    case "settings-hero":
    case "settings-hero-video": {
      const settings = await getSettings();
      await updateSettings({
        ...settings,
        heroMediaType: "none",
        heroMediaUrl: ""
      });
      break;
    }
    case "settings-og": {
      const settings = await getSettings();
      await updateSettings({
        ...settings,
        ogImageUrl: ""
      });
      break;
    }
    case "menu": {
      if (!input.entityId) throw new Error("מזהה מנה חסר");
      const ok = await removeMenuItem(input.entityId);
      if (!ok) throw new Error("המנה לא נמצאה");
      break;
    }
    case "gallery": {
      if (!input.entityId) throw new Error("מזהה גלריה חסר");
      const ok = await removeGalleryItem(input.entityId);
      if (!ok) throw new Error("פריט הגלריה לא נמצא");
      break;
    }
    case "press": {
      if (!input.entityId) throw new Error("מזהה כתבה חסר");
      const ok = await removePressItem(input.entityId);
      if (!ok) throw new Error("הכתבה לא נמצאה");
      break;
    }
    default:
      throw new Error("סוג תמונה לא נתמך");
  }

  revalidateSiteImages();
}

export async function resetSiteImageAction(id: string) {
  await clearSiteImageOverride(id);
  revalidateSiteImages();
}
