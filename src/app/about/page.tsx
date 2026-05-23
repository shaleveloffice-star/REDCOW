import type { Metadata } from "next";
import { AboutPageView } from "@/components/features/about/about-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { resolveStaticSiteImagesMap } from "@/services/site-images-resolver.service";

export const metadata: Metadata = {
  title: "אודות NB - אן בי",
  description:
    "אודות NB - אן בי. המבורגר בסיסי: בשר טוב, לחמנייה רכה, ירקות טריים ורוטב נכון, בחוויה מדויקת."
};

export default async function AboutPage() {
  const siteImages = await resolveStaticSiteImagesMap();

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
