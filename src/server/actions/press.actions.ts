"use server";

import { revalidatePath } from "next/cache";
import { listPressItems, removePressItem, upsertPressItem } from "@/services/press.service";
import type { PressItem } from "@/types/content";

const paths = ["/admin/press", "/"];

export async function getPressAdminData() {
  return listPressItems();
}

export async function savePressItemAction(input: PressItem) {
  if (!input.title.trim()) throw new Error("כותרת נדרשת");
  const saved = await upsertPressItem({
    ...input,
    title: input.title.trim(),
    source: input.source.trim(),
    url: input.url.trim(),
    imageUrl: input.imageUrl.trim(),
    isActive: Boolean(input.isActive)
  });
  paths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function deletePressItemAction(id: string) {
  const ok = await removePressItem(id);
  if (!ok) throw new Error("הכתבה לא נמצאה");
  paths.forEach((path) => revalidatePath(path));
}
