"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { normalizeAnnouncementPopupConfig } from "@/repositories/announcement-popup.repository";
import {
  getAnnouncementPopup,
  updateAnnouncementPopup
} from "@/services/announcement-popup.service";
import type { AnnouncementPopupConfig } from "@/types/content";
import { revalidatePath, updateTag } from "next/cache";

export type AnnouncementPopupSaveResult = {
  ok: true;
  config: AnnouncementPopupConfig;
};

function revalidateAnnouncementPopup() {
  try {
    updateTag(CACHE_TAGS.announcementPopup);
    revalidatePath("/");
  } catch {
    // ignore
  }
}

export async function getAnnouncementPopupAdminData() {
  await requireAdmin();
  return getAnnouncementPopup();
}

export async function saveAnnouncementPopupAction(
  input: Partial<AnnouncementPopupConfig>
): Promise<AnnouncementPopupSaveResult> {
  try {
    await requireAdmin();
  } catch {
    throw new Error("אין הרשאת אדמין. התחברו מחדש ל־/admin/login");
  }

  const current = await getAnnouncementPopup();
  const next = normalizeAnnouncementPopupConfig({
    ...current,
    ...input,
    updatedAt: new Date().toISOString()
  });

  if (!next.title.trim()) {
    throw new Error("כותרת הפופ־אפ נדרשת.");
  }
  if (!next.ctaLabel.trim()) {
    throw new Error("טקסט כפתור ה־CTA נדרש.");
  }
  if (next.delaySeconds > 120) {
    throw new Error("השהיית הופעה מקסימלית: 120 שניות.");
  }
  if (next.dismissDays > 3650) {
    throw new Error("ימי זכירה מקסימליים: 3650.");
  }

  const saved = await updateAnnouncementPopup(next);
  revalidateAnnouncementPopup();
  return { ok: true, config: saved };
}
