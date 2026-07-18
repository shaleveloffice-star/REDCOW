"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import { revalidatePath } from "next/cache";
import { listPressItems, removePressItem, upsertPressItem } from "@/services/press.service";
import type { PressItem } from "@/types/content";

const paths = ["/admin/press", "/"];

export async function getPressAdminData() {
  await requireAdmin();
  return listPressItems();
}

export async function savePressItemAction(input: PressItem) {
  await requireAdmin();
  if (!input.title.trim()) throw new Error("כותרת נדרשת");
  const saved = await upsertPressItem({
    ...input,
    title: input.title.trim(),
    source: input.source.trim(),
    url: assertSafeHttpUrl(input.url, "קישור כתבה"),
    imageUrl: assertSafeHttpUrl(input.imageUrl, "תמונת כתבה"),
    isActive: Boolean(input.isActive)
  });
  paths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function deletePressItemAction(id: string) {
  await requireAdminRole(["owner", "manager"]);
  const ok = await removePressItem(id);
  if (!ok) throw new Error("הכתבה לא נמצאה");
  paths.forEach((path) => revalidatePath(path));
}
