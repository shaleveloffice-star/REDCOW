import type { PageVisibilityConfig } from "@/types/page-visibility";

export const DEFAULT_PAGE_VISIBILITY: PageVisibilityConfig = {
  aboutEnabled: false,
  updatedAt: "2026-09-13T00:00:00.000Z"
};

export function normalizePageVisibility(input: unknown): PageVisibilityConfig {
  const raw = input && typeof input === "object" ? (input as Partial<PageVisibilityConfig>) : {};
  return {
    aboutEnabled: raw.aboutEnabled === true,
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt.trim()
        ? raw.updatedAt
        : DEFAULT_PAGE_VISIBILITY.updatedAt
  };
}
