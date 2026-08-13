export type SiteImageSource =
  | "static"
  | "settings-hero"
  | "settings-hero-video"
  | "settings-og"
  | "menu"
  | "gallery"
  | "press";

export type SiteImageCatalogItem = {
  id: string;
  label: string;
  location: string;
  imageUrl: string;
  source: SiteImageSource;
  entityId?: string;
  defaultImageUrl: string;
};

export type SiteImageGroup = {
  title: string;
  items: SiteImageCatalogItem[];
};

export type SiteImageOverride = {
  id: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  label?: string;
  hidden?: boolean;
  updatedAt: string;
};

export type SiteImageUpdateInput = {
  id: string;
  source: SiteImageSource;
  entityId?: string;
  imageUrl: string;
  label?: string;
};

export type SiteImageDeleteInput = {
  id: string;
  source: SiteImageSource;
  entityId?: string;
  label: string;
};

export type SiteImagesMap = Record<string, string>;
