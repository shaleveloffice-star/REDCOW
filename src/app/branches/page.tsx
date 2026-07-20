import type { Metadata } from "next";
import { BranchesPageView } from "@/components/features/branches/branches-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { BUSINESS } from "@/data/business";
import { listBranches } from "@/services/branches.service";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "הסניף ברעננה | NB BURGER",
  description:
    "סניף NB BURGER ברחוב אחוזה 96 ברעננה — מסעדת המבורגרים עם מיקום, שעות פתיחה וניווט.",
  path: "/branches"
});

export default async function BranchesPage() {
  const branches = await listBranches({ activeOnly: true });

  return (
    <>
      <main id="main-content" className="branches-page" dir="rtl">
        <div className="page-shell section inner-page branches-page-inner">
          <header className="branches-page-intro menu-highlights-shell">
            <p className="menu-highlights-kicker">Our Locations</p>
            <h1 className="menu-page-hero-title">
              {`סניף ${BUSINESS.name} ב${BUSINESS.address.addressLocality}`}
            </h1>
            <p className="branches-page-lede">
              כאן תוכלו למצוא את כל הפרטים הדרושים לפני שמגיעים אלינו – כתובת, שעות פעילות וניווט מהיר.
            </p>
          </header>
          <BranchesPageView branches={branches} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
