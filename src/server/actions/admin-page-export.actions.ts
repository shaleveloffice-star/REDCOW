"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { getAnnouncementPopupAdminData } from "@/server/actions/announcement-popup.actions";
import { getBranchesAdminData } from "@/server/actions/branches.actions";
import { getCareerApplicationsAdminData } from "@/server/actions/careers.actions";
import { getContactMessagesAdminData } from "@/server/actions/contact.actions";
import { getCustomerClubAdminData } from "@/server/actions/customer-club.actions";
import { getMenuAdminData } from "@/server/actions/menu.actions";
import { getOrderLinksAdminData } from "@/server/actions/order-links.actions";
import { getPressAdminData } from "@/server/actions/press.actions";
import { getSeoContentDocumentForAdmin } from "@/server/actions/seo-content.actions";
import { getSettingsAdminData } from "@/server/actions/settings.actions";
import { getHomePageSiteImagesAdminData } from "@/server/actions/site-image-overrides.actions";
import { getStoriesAdminData } from "@/server/actions/stories.actions";
import type { SeoPageId } from "@/types/seo-content";

export type AdminPageExportPayload = {
  page: string;
  label: string;
  exportedAt: string;
  data: unknown;
};

function normalizeAdminPath(pathname: string): string {
  const trimmed = pathname.trim().replace(/\/+$/, "") || "/";
  return trimmed.startsWith("/admin") ? trimmed : `/admin${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

async function seoPageExport(pageId: SeoPageId, label: string, page: string): Promise<AdminPageExportPayload> {
  const document = await getSeoContentDocumentForAdmin();
  return {
    page,
    label,
    exportedAt: new Date().toISOString(),
    data: {
      he: document.he?.pages?.[pageId] ?? {},
      en: document.en?.pages?.[pageId] ?? {},
      fr: document.fr?.pages?.[pageId] ?? {},
      updatedAt: {
        he: document.he?.updatedAt ?? null,
        en: document.en?.updatedAt ?? null,
        fr: document.fr?.updatedAt ?? null
      }
    }
  };
}

/** Returns all data for an admin page, or null when copy is not available (e.g. gallery). */
export async function getAdminPageExportAction(
  pathname: string
): Promise<AdminPageExportPayload | null> {
  await requireAdmin();

  const page = normalizeAdminPath(pathname);

  if (page === "/admin/gallery") {
    return null;
  }

  const exportedAt = new Date().toISOString();

  switch (page) {
    case "/admin": {
      const [menu, branches, press, contact, settings] = await Promise.all([
        getMenuAdminData(),
        getBranchesAdminData(),
        getPressAdminData(),
        getContactMessagesAdminData(),
        getSettingsAdminData()
      ]);
      return {
        page,
        label: "סקירת אדמין",
        exportedAt,
        data: {
          menuItems: menu.items,
          menuCategories: menu.categories,
          homepageShowcase: menu.homepageShowcase,
          branches,
          press,
          contactMessages: contact,
          settings: settings.settings,
          orderLinks: settings.orderLinks
        }
      };
    }
    case "/admin/menu": {
      const [menu, seoDocument] = await Promise.all([
        getMenuAdminData(),
        getSeoContentDocumentForAdmin()
      ]);
      return {
        page,
        label: "תפריט",
        exportedAt,
        data: {
          items: menu.items,
          categories: menu.categories,
          homepageShowcase: menu.homepageShowcase,
          seo: {
            he: seoDocument.he?.pages?.menu ?? {},
            en: seoDocument.en?.pages?.menu ?? {},
            fr: seoDocument.fr?.pages?.menu ?? {}
          }
        }
      };
    }
    case "/admin/menu-categories": {
      const [menu, seoDocument] = await Promise.all([
        getMenuAdminData(),
        getSeoContentDocumentForAdmin()
      ]);
      return {
        page,
        label: "קטגוריות תפריט",
        exportedAt,
        data: {
          categories: menu.categories,
          categorySeo: {
            he: {
              categoryIntros: seoDocument.he?.pages?.menu?.categoryIntros ?? {},
              categoryPages: seoDocument.he?.pages?.menu?.categoryPages ?? {}
            },
            en: {
              categoryIntros: seoDocument.en?.pages?.menu?.categoryIntros ?? {},
              categoryPages: seoDocument.en?.pages?.menu?.categoryPages ?? {}
            },
            fr: {
              categoryIntros: seoDocument.fr?.pages?.menu?.categoryIntros ?? {},
              categoryPages: seoDocument.fr?.pages?.menu?.categoryPages ?? {}
            }
          }
        }
      };
    }
    case "/admin/branches": {
      const branches = await getBranchesAdminData();
      return { page, label: "סניפים", exportedAt, data: { branches } };
    }
    case "/admin/press": {
      const items = await getPressAdminData();
      return { page, label: "כתבות", exportedAt, data: { items } };
    }
    case "/admin/stories": {
      const stories = await getStoriesAdminData();
      return { page, label: "סיפורים", exportedAt, data: { stories } };
    }
    case "/admin/contact-messages": {
      const messages = await getContactMessagesAdminData();
      return { page, label: "הודעות יצירת קשר", exportedAt, data: { messages } };
    }
    case "/admin/customer-club": {
      const signups = await getCustomerClubAdminData();
      return { page, label: "מועדון לקוחות", exportedAt, data: { signups } };
    }
    case "/admin/career-applications": {
      const applications = await getCareerApplicationsAdminData();
      return { page, label: "קורות חיים", exportedAt, data: { applications } };
    }
    case "/admin/order-links": {
      const links = await getOrderLinksAdminData();
      return { page, label: "קישורי הזמנה", exportedAt, data: { links } };
    }
    case "/admin/pages/home": {
      const [seo, imageGroups] = await Promise.all([
        seoPageExport("home", "SEO — דף הבית", page),
        getHomePageSiteImagesAdminData()
      ]);
      return {
        page,
        label: "דף הבית",
        exportedAt,
        data: {
          seo: seo.data,
          siteImages: imageGroups
        }
      };
    }
    case "/admin/pages/about":
      return seoPageExport("about", "SEO — אודות", page);
    case "/admin/pages/locations":
      return seoPageExport("locations", "SEO — מיקומים", page);
    case "/admin/pages/privacy":
      return seoPageExport("privacy", "SEO — פרטיות", page);
    case "/admin/pages/terms":
      return seoPageExport("terms", "SEO — תקנון", page);
    case "/admin/settings": {
      const { settings, orderLinks } = await getSettingsAdminData();
      return {
        page,
        label: "הגדרות אתר",
        exportedAt,
        data: { settings, orderLinks }
      };
    }
    case "/admin/announcement-popup": {
      const config = await getAnnouncementPopupAdminData();
      return {
        page,
        label: "פופ־אפ הודעה",
        exportedAt,
        data: { config }
      };
    }
    default:
      return null;
  }
}
