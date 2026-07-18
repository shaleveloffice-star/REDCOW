import { mockPressItems } from "@/data/mock/press.mock";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localPressStore } from "@/lib/firebase/local-stores";
import type { PressItem } from "@/types/content";

const pressStore = createFirestoreCollectionStore("pressItems", localPressStore, {
  access: "public",
  seed: mockPressItems
});

export async function getPressItems(): Promise<PressItem[]> {
  return pressStore.getAll();
}

export async function savePressItem(input: PressItem): Promise<PressItem> {
  return pressStore.save(input);
}

export async function deletePressItem(id: string): Promise<boolean> {
  return pressStore.remove(id);
}
