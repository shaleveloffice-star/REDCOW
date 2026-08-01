import type { Metadata } from "next";

import { MenuPageView } from "@/components/features/menu/menu-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCachedActiveOrderLinks,
  getCachedMenuForDisplay,
  getCachedResolvedSeoPageContent
} from "@/lib/cache/cached-data";
import { getServerLocale } from "@/i18n/get-locale";
import { buildPageMetadata } from "@/lib/seo";
import { buildMenuJsonLd } from "@/lib/seo/json-ld";
import type { OrderLink } from "@/types/content";

export const metadata: Metadata = buildPageMetadata({
  title: "תפריט המבורגרים ברעננה | NB BURGER",
  description:
    "גלו את תפריט ההמבורגרים של NB BURGER ברעננה — המבורגרים על הפלנצ׳ה, תוספות ומנות ממסעדה כשרה ברחוב אחוזה 96.",
  path: "/menu"
});

function resolveOrderUrls(orderLinks: OrderLink[]) {
  const pickup =
    orderLinks.find((link) => link.type === "pickup" && link.isActive)?.url ?? "/menu";
  const delivery =
    orderLinks.find(
      (link) => (link.type === "delivery" || link.type === "marketplace") && link.isActive
    )?.url ?? "/locations";

  return { pickupUrl: pickup, deliveryUrl: delivery };
}

export default async function MenuPage() {
  const locale = await getServerLocale();
  const [groups, orderLinks, seoContent] = await Promise.all([
    getCachedMenuForDisplay(),
    getCachedActiveOrderLinks(),
    getCachedResolvedSeoPageContent(locale, "menu")
  ]);
  const { pickupUrl, deliveryUrl } = resolveOrderUrls(orderLinks);

  return (
    <>
      <JsonLd data={buildMenuJsonLd(groups)} />
      <main id="main-content" className="menu-page">
        <div className="menu-page-inner">
          <MenuPageView
            groups={groups}
            pickupUrl={pickupUrl}
            deliveryUrl={deliveryUrl}
            seoContent={seoContent}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
