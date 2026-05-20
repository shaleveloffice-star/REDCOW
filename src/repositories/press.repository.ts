import { mockPressItems } from "@/data/mock/press.mock";
import { createInMemoryStore } from "@/lib/admin/in-memory-store";
import type { PressItem } from "@/types/content";

const pressStore = createInMemoryStore(mockPressItems);

export async function getPressItems(): Promise<PressItem[]> {
  return pressStore.getAll();
}

export async function savePressItem(input: PressItem): Promise<PressItem> {
  return pressStore.save(input);
}

export async function deletePressItem(id: string): Promise<boolean> {
  return pressStore.remove(id);
}
