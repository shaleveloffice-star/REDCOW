import type { Metadata } from "next";

import { MenuPageView } from "@/components/features/menu/menu-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCachedMenuForDisplay } from "@/lib/cache/cached-data";

export const metadata: Metadata = {
  title: "תפריט | NB Burger",
  description: "התפריט המלא של NB Burger — המבורגרים, תוספות, שתייה ועוד."
};

export default async function MenuPage() {
  const groups = await getCachedMenuForDisplay();

  return (
    <>
      <SiteHeader />
      <main className="menu-page" dir="rtl">
        <div className="menu-page-inner page-shell section inner-page">
          <MenuPageView groups={groups} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
