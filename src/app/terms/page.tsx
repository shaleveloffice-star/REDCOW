import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/features/legal/legal-document-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { getDirection } from "@/i18n/config";
import { getServerLocale } from "@/i18n/get-locale";
import { getLocalizedTermsContent } from "@/i18n/legal/get-localized-legal";
import { getCachedResolvedSeoPageContent } from "@/lib/cache/cached-data";
import { getTermsPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return await getTermsPageMetadata(locale);
}

export default async function TermsPage() {
  const locale = await getServerLocale();
  const [seoContent, document] = await Promise.all([
    getCachedResolvedSeoPageContent(locale, "terms"),
    getLocalizedTermsContent(locale)
  ]);

  return (
    <>
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
