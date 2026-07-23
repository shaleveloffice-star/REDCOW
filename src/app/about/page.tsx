import type { Metadata } from "next";
import { AboutPageView } from "@/components/features/about/about-page-view";
import { getCachedSiteImagesMap } from "@/lib/cache/cached-data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "אודות | NB BURGER רעננה",
  description:
    "הכירו את NB BURGER — מסעדת המבורגרים ברעננה. בשר טוב, לחמנייה רכה וחוויה מדויקת על הפלנצ׳ה.",
  path: "/about"
});

export default async function AboutPage() {
  const siteImages = await getCachedSiteImagesMap();

  return (
    <main id="main-content" className="about-page" dir="rtl">
      <AboutPageView siteImages={siteImages} />
    </main>
  );
}
