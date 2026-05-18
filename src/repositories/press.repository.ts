import { mockPressItems } from "@/data/mock/press.mock";
import type { PressItem } from "@/types/content";

export async function getPressItems(): Promise<PressItem[]> {
  return mockPressItems;
}

export async function savePressItem(input: PressItem): Promise<PressItem> {
  return input;
}
