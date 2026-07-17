import type { Metadata } from "next";
import { AboutPageView } from "@/components/features/about/about-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCachedSiteImagesMap } from "@/lib/cache/cached-data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "אודות NB - אן בי",
  description:
    "אודות NB - אן בי. המבורגר בסיסי: בשר טוב, לחמנייה רכה, ירקות טריים ורוטב נכון, בחוויה מדויקת.",
  path: "/about"
});

export default async function AboutPage() {
  const siteImages = await getCachedSiteImagesMap();

  return (
    <>
      <SiteHeader />
      <main className="about-page" dir="rtl">
        <AboutPageView siteImages={siteImages} />
      </main>
      <SiteFooter />
    </>
  );
}
