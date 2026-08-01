import type { Metadata } from "next";

import { MenuIndexView } from "@/components/features/menu/menu-index-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getCachedActiveOrderLinks, getCachedMenuForDisplay } from "@/lib/cache/cached-data";
import { getServerLocale } from "@/i18n/get-locale";
import { resolveMenuOrderUrls } from "@/lib/menu/menu-page-utils";
import { getMenuPageMetadata } from "@/lib/page-metadata";
import { buildMenuJsonLd } from "@/lib/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return getMenuPageMetadata(locale);
}

export default async function MenuPage() {
  const locale = await getServerLocale();
  const [groups, orderLinks] = await Promise.all([
    getCachedMenuForDisplay(),
    getCachedActiveOrderLinks()
  ]);
  const { pickupUrl, deliveryUrl } = resolveMenuOrderUrls(orderLinks);

  return (
    <>
      <JsonLd data={buildMenuJsonLd(groups, locale)} />
      <main id="main-content" className="menu-page">
        <div className="menu-page-inner">
          <MenuIndexView groups={groups} pickupUrl={pickupUrl} deliveryUrl={deliveryUrl} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
