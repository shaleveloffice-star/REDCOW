import type { Metadata } from "next";
import { BranchesPageView } from "@/components/features/branches/branches-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { listBranches } from "@/services/branches.service";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "סניפים | NB BURGER",
  description: "סניפי NB BURGER — הסניף הראשון בפתיחה בקרוב. עדכונים על מיקום ושעות פתיחה.",
  path: "/branches"
});

export default async function BranchesPage() {
  const branches = await listBranches({ activeOnly: true });

  return (
    <>
      <SiteHeader />
      <main className="branches-page" dir="rtl">
        <div className="page-shell section inner-page branches-page-inner">
          <header className="branches-page-intro menu-highlights-shell">
            <p className="menu-highlights-kicker">Our Locations</p>
            <h1 className="menu-page-hero-title">סניפים</h1>
            {branches.length === 0 ? (
              <p className="branches-page-lede">פתיחה בקרוב — נעדכן כאן ברגע שנקבע מיקום.</p>
            ) : (
              <p className="branches-page-lede">איפה אפשר למצוא אותנו ולהזמין.</p>
            )}
          </header>
          <BranchesPageView branches={branches} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
