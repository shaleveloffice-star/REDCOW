import type { Metadata } from "next";

import { MenuIndexView } from "@/components/features/menu/menu-index-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import {
  getCachedActiveOrderLinks,
  getCachedMenuForDisplay,
  getCachedResolvedSeoPageContent
} from "@/lib/cache/cached-data";
import { getServerLocale } from "@/i18n/get-locale";
import { resolveMenuOrderUrls } from "@/lib/menu/menu-page-utils";
import { getMenuPageMetadata } from "@/lib/page-metadata";
import { buildMenuJsonLd, buildStaticPageBreadcrumbJsonLd } from "@/lib/seo/json-ld";
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return await getMenuPageMetadata(locale);
}

export default async function MenuPage() {
  const locale = await getServerLocale();
  const [groups, orderLinks, menuSeo, messages] = await Promise.all([
    getCachedMenuForDisplay(),
    getCachedActiveOrderLinks(),
    getCachedResolvedSeoPageContent(locale, "menu"),
    getLocalizedMessages(locale)
  ]);
  const { pickupUrl, deliveryUrl } = resolveMenuOrderUrls(orderLinks);

  return (
    <>
      <JsonLd data={buildMenuJsonLd(groups, locale, messages)} />
      <JsonLd
        data={buildStaticPageBreadcrumbJsonLd({
          pageName: messages.nav.menu,
          pagePath: "/menu",
          locale,
          messages
        })}
      />
      <main id="main-content" className="menu-page">
        <div className="menu-page-inner">
          <MenuIndexView
            groups={groups}
            menuSeo={{
              introduction: menuSeo.introduction,
              bottomContent: menuSeo.bottomContent,
              cta: menuSeo.cta
            }}
            pickupUrl={pickupUrl}
            deliveryUrl={deliveryUrl}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
