import type { MenuCategory, MenuItem } from "@/types/content";

export type MenuItemSmartPasteFieldKey =
  | "name"
  | "category"
  | "price"
  | "description"
  | "longDescription"
  | "imageAlt"
  | "primaryKeyword"
  | "metaTitle"
  | "metaDescription"
  | "slug"
  | "sortOrder"
  | "tags";

export type MenuItemSmartPasteData = {
  name?: string;
  category?: string;
  price?: number;
  description?: string;
  longDescription?: string;
  imageAlt?: string;
  primaryKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  sortOrder?: number;
  tags?: string[];
};

export type MenuItemSmartPastePreview = {
  data: MenuItemSmartPasteData;
  foundFields: MenuItemSmartPasteFieldKey[];
  unknownHeadings: string[];
  warnings: string[];
  fieldsCount: number;
  hasAnyField: boolean;
};

export type MenuItemSmartPasteApplyResult = {
  draft: MenuItem;
  slugTouched: boolean;
  warnings: string[];
};

