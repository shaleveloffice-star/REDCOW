import { getPressItems, savePressItem } from "@/repositories/press.repository";
import type { PressItem } from "@/types/content";

export async function listPressItems(options: { activeOnly?: boolean } = {}): Promise<PressItem[]> {
  const items = await getPressItems();
  return items
    .filter((item) => (options.activeOnly ? item.isActive : true))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export async function upsertPressItem(input: PressItem): Promise<PressItem> {
  return savePressItem({ ...input, updatedAt: new Date().toISOString() });
}
