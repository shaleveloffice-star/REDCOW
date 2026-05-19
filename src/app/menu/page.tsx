import type { Metadata } from "next";
import { FullMenuView } from "@/components/features/menu/full-menu-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getMenuForDisplay } from "@/services/menu.service";

export const metadata: Metadata = {
  title: "תפריט | Red Cow",
  description: "תפריט המסעדה"
};

export default async function MenuPage() {
  const groups = await getMenuForDisplay();

  return (
    <>
      <SiteHeader />
      <main className="menu-page" dir="rtl">
        <div className="page-shell section inner-page menu-page-inner">
          <header className="menu-page-intro menu-highlights-shell">
            <p className="menu-highlights-kicker">Full Menu</p>
            <h1 className="menu-page-hero-title">התפריט שלנו</h1>
          </header>
          <FullMenuView groups={groups} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
