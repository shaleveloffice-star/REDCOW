import type { Metadata } from "next";
import { AboutPageView } from "@/components/features/about/about-page-view";
import { getCachedResolvedSeoPageContent, getCachedSiteImagesMap } from "@/lib/cache/cached-data";
import { getServerLocale } from "@/i18n/get-locale";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "אודות | NB BURGER רעננה",
  description:
    "הכירו את NB BURGER — מסעדת המבורגרים ברעננה. בשר טוב, לחמנייה רכה וחוויה מדויקת על הפלנצ׳ה.",
  path: "/about"
});

export default async function AboutPage() {
  const locale = await getServerLocale();
  const [siteImages, seoContent] = await Promise.all([
    getCachedSiteImagesMap(),
    getCachedResolvedSeoPageContent(locale, "about")
  ]);

  return (
    <main id="main-content" className="about-page" dir="rtl">
      <AboutPageView siteImages={siteImages} seoContent={seoContent} />
    </main>
  );
}
