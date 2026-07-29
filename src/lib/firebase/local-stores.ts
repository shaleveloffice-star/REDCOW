import { createInMemoryStore } from "@/lib/admin/in-memory-store";
import { createJsonFileStore } from "@/lib/admin/json-file-store";
import { createJsonSingleDocStore } from "@/lib/admin/json-single-doc-store";
import { DEFAULT_HOMEPAGE_MENU_ITEM_IDS } from "@/data/homepage-menu";
import { mockCareerApplications, mockContactMessages, mockCustomerClubSignups } from "@/data/mock/contact.mock";
import { mockBranches } from "@/data/mock/branches.mock";
import { mockMenuCategories, mockMenuItems } from "@/data/mock/menu.mock";
import { mockPressItems } from "@/data/mock/press.mock";
import { mockOrderLinks, mockSiteSettings } from "@/data/mock/settings.mock";
import type {
  Branch,
  CareerApplication,
  ContactMessage,
  CustomerClubSignup,
  HomepageMenuShowcaseConfig,
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
export const localCustomerClubSignupsStore = createInMemoryStore<CustomerClubSignup>(
  mockCustomerClubSignups
);
export const localBranchesStore = createInMemoryStore<Branch>(mockBranches);
export const localPressStore = createInMemoryStore<PressItem>(mockPressItems);
export const localOrderLinksStore = createInMemoryStore<OrderLink>(mockOrderLinks);
export const localSiteImageOverridesStore = createJsonFileStore<SiteImageOverride>(
  "site-image-overrides.json",
  []
);

let localSiteSettings: SiteSettings = { ...mockSiteSettings };

const defaultHomepageMenuShowcase = (): HomepageMenuShowcaseConfig => ({
  itemIds: [...DEFAULT_HOMEPAGE_MENU_ITEM_IDS],
  updatedAt: new Date(0).toISOString()
});

export const localHomepageMenuShowcaseStore = createJsonSingleDocStore<HomepageMenuShowcaseConfig>(
  "homepage-menu-showcase.json",
  defaultHomepageMenuShowcase()
);

export const localSiteSettingsStore = {
  async get(): Promise<SiteSettings> {
    return { ...localSiteSettings };
  },
  async save(input: SiteSettings): Promise<SiteSettings> {
    localSiteSettings = { ...input };
    return localSiteSettings;
  }
};
