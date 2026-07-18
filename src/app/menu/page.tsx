import type { Metadata } from "next";

import { MenuPageView } from "@/components/features/menu/menu-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getCachedMenuForDisplay } from "@/lib/cache/cached-data";
import { buildPageMetadata } from "@/lib/seo";
import { buildMenuJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = buildPageMetadata({
  title: "תפריט המבורגרים ברעננה | NB BURGER",
  description:
    "גלו את תפריט ההמבורגרים של NB BURGER ברעננה — המבורגרים על הפלנצ׳ה, תוספות ומנות ממסעדה כשרה ברחוב אחוזה 96.",
  path: "/menu"
});

export default async function MenuPage() {
  const groups = await getCachedMenuForDisplay();

  return (
    <>
      <JsonLd data={buildMenuJsonLd(groups)} />
      <SiteHeader />
      <main id="main-content" className="menu-page" dir="rtl">
        <div className="menu-page-inner page-shell section inner-page">
          <MenuPageView groups={groups} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
