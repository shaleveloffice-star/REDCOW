import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/features/legal/legal-document-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getDirection } from "@/i18n/config";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getLocalizedAccessibilityContent } from "@/i18n/legal/get-localized-legal";
import { getAccessibilityPageMetadata } from "@/lib/page-metadata";
import { buildStaticPageBreadcrumbJsonLd } from "@/lib/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return getAccessibilityPageMetadata(locale);
}

export default async function AccessibilityPage() {
  const locale = await getServerLocale();
  const [document, messages] = await Promise.all([
    getLocalizedAccessibilityContent(locale),
    getLocalizedMessages(locale)
  ]);

  return (
    <>
      <JsonLd
        data={buildStaticPageBreadcrumbJsonLd({
          pageName: messages.footer.accessibility,
          pagePath: "/accessibility",
          locale,
          messages
        })}
      />
      <main id="main-content" className="legal-page" dir={getDirection(locale)}>
        <LegalDocumentView document={document} />
      </main>
      <SiteFooter />
    </>
  );
}
