import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/features/legal/legal-document-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getDirection } from "@/i18n/config";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { getLocalizedTermsContent } from "@/i18n/legal/get-localized-legal";
import { getCachedResolvedSeoPageContent } from "@/lib/cache/cached-data";
import { getTermsPageMetadata } from "@/lib/page-metadata";
import { buildStaticPageBreadcrumbJsonLd } from "@/lib/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return await getTermsPageMetadata(locale);
}

export default async function TermsPage() {
  const locale = await getServerLocale();
  const [seoContent, document, messages] = await Promise.all([
    getCachedResolvedSeoPageContent(locale, "terms"),
    getLocalizedTermsContent(locale),
    getLocalizedMessages(locale)
  ]);

  return (
    <>
      <JsonLd
        data={buildStaticPageBreadcrumbJsonLd({
          pageName: messages.footer.terms,
          pagePath: "/terms",
          locale,
          messages
        })}
      />
      <main id="main-content" className="legal-page" dir={getDirection(locale)}>
        <LegalDocumentView
          document={document}
          seoIntroduction={seoContent.introduction}
          seoBottomContent={seoContent.bottomContent}
        />
      </main>
      <SiteFooter />
    </>
  );
}
