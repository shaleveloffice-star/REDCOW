import {
  getAnnouncementPopupConfig,
  saveAnnouncementPopupConfig
} from "@/repositories/announcement-popup.repository";
import type { AnnouncementPopupConfig } from "@/types/content";

export async function getAnnouncementPopup(): Promise<AnnouncementPopupConfig> {
  return getAnnouncementPopupConfig();
}

export async function updateAnnouncementPopup(
  input: Partial<AnnouncementPopupConfig>
): Promise<AnnouncementPopupConfig> {
  return saveAnnouncementPopupConfig(input);
}
