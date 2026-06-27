import { createInMemoryStore } from "@/lib/admin/in-memory-store";
import { createJsonFileStore } from "@/lib/admin/json-file-store";
import { mockCareerApplications, mockContactMessages } from "@/data/mock/contact.mock";
import { mockBranches } from "@/data/mock/branches.mock";
import { mockGalleryItems } from "@/data/mock/gallery.mock";
import { mockMenuCategories, mockMenuItems } from "@/data/mock/menu.mock";
import { mockPressItems } from "@/data/mock/press.mock";
import { mockOrderLinks, mockSiteSettings } from "@/data/mock/settings.mock";
import type {
  Branch,
  CareerApplication,
  ContactMessage,
  GalleryItem,
  MenuCategory,
  MenuItem,
  OrderLink,
  PressItem,
  SiteSettings
} from "@/types/content";
import type { SiteImageOverride } from "@/types/site-images";

export const localMenuItemsStore = createJsonFileStore<MenuItem>("menu-items.json", mockMenuItems);
export const localMenuCategoriesStore = createJsonFileStore<MenuCategory>(
  "menu-categories.json",
  mockMenuCategories
);
export const localContactMessagesStore = createInMemoryStore<ContactMessage>(mockContactMessages);
export const localCareerApplicationsStore = createInMemoryStore<CareerApplication>(
  mockCareerApplications
);
export const localBranchesStore = createInMemoryStore<Branch>(mockBranches);
export const localPressStore = createInMemoryStore<PressItem>(mockPressItems);
export const localGalleryStore = createInMemoryStore<GalleryItem>(mockGalleryItems);
export const localOrderLinksStore = createInMemoryStore<OrderLink>(mockOrderLinks);
export const localSiteImageOverridesStore = createJsonFileStore<SiteImageOverride>(
  "site-image-overrides.json",
  []
);

let localSiteSettings: SiteSettings = { ...mockSiteSettings };

export const localSiteSettingsStore = {
  async get(): Promise<SiteSettings> {
    return { ...localSiteSettings };
  },
  async save(input: SiteSettings): Promise<SiteSettings> {
    localSiteSettings = { ...input };
    return localSiteSettings;
  }
};
