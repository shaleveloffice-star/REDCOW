"use server";

import { listPressItems, upsertPressItem } from "@/services/press.service";
import type { PressItem } from "@/types/content";

export async function getPressAdminData() {
  return listPressItems();
}

export async function savePressItemAction(input: PressItem) {
  return upsertPressItem(input);
}
