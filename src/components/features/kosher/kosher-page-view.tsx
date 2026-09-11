import Link from "next/link";

import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import { SeoCtaBlockView } from "@/components/shared/seo-content-body";
import { SeoFaqSection } from "@/components/shared/seo-faq-section";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { hasValidFaqItems } from "@/lib/seo/faq-utils";
import type { ResolvedSeoPageContent } from "@/types/seo-content";

type KosherPageViewProps = {
  seoContent: ResolvedSeoPageContent;
};

export async function KosherPageView({ seoContent }: KosherPageViewProps) {
  const locale = await getServerLocale();
  const messages = await getLocalizedMessages(locale);

  return (
    <>
      <section className="kosher-page-panel" aria-labelledby="kosher-page-title">
        <MenuBreadcrumbs
          items={[
            { label: messages.nav.home, href: "/" },
            { label: messages.nav.kosher }
          ]}
        />
        <h1 id="kosher-page-title">{messages.kosherPage.title}</h1>
        {seoContent.sectionTitle.trim() ? (
          <p className="kosher-page-subtitle">{seoContent.sectionTitle}</p>
        ) : null}
        {seoContent.introductionParagraphs.map((paragraph, index) => (
          <p
            key={paragraph.slice(0, 48)}
            className={`kosher-page-copy${index === 0 ? " kosher-page-copy--lead" : ""}`}
          >
            {paragraph}
          </p>
        ))}
        {seoContent.bottomParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="kosher-page-copy">
            {paragraph}
          </p>
        ))}
        <SeoCtaBlockView {...seoContent.cta} className="kosher-page-seo-cta seo-content-cta" />
        <Link href="/" className="kosher-page-home">
          {messages.kosherPage.backHome}
        </Link>
      </section>

      {hasValidFaqItems(seoContent.faq) ? (
        <SeoFaqSection faq={seoContent.faq} titleId="kosher-faq-title" />
      ) : null}
    </>
  );
}
