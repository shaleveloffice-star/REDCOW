import Image from "next/image";
import Link from "next/link";

import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import { SeoCtaBlockView } from "@/components/shared/seo-content-body";
import { SeoFaqSection } from "@/components/shared/seo-faq-section";
import { hasValidFaqItems } from "@/lib/seo/faq-utils";
import { ABOUT_PAGE_IMAGES as IMG } from "@/data/site-images.registry";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { resolveImageAlt } from "@/lib/image-alt";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";
import type { ResolvedSeoPageContent } from "@/types/seo-content";

type AboutPageViewProps = {
  siteImages?: SiteImagesMap;
  seoContent: ResolvedSeoPageContent;
};

export async function AboutPageView({ siteImages, seoContent }: AboutPageViewProps) {
  const locale = await getServerLocale();
  const hero = pickSiteImage(siteImages, "about-hero", IMG.hero);
  const imageAlt = resolveImageAlt({ kind: "about-hero", locale });
  const messages = await getLocalizedMessages(locale);

  return (
    <>
      <section className="about-simple" aria-labelledby="about-simple-title">
        <Image
          src={hero}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="about-simple-image"
        />
        <div className="about-simple-overlay" aria-hidden="true" />

        <div className="about-simple-content">
          <MenuBreadcrumbs
            items={[
              { label: messages.nav.home, href: "/" },
              { label: messages.nav.about }
            ]}
          />
          <h1 id="about-simple-title">{messages.aboutPage.title}</h1>
          {seoContent.sectionTitle.trim() ? (
            <p className="about-simple-subtitle">{seoContent.sectionTitle}</p>
          ) : null}
          {seoContent.introductionParagraphs.map((paragraph, index) => (
            <p
              key={paragraph.slice(0, 48)}
              className={`about-simple-description${index === 0 ? " about-simple-description--first" : ""}`}
            >
              {paragraph}
            </p>
          ))}
          {seoContent.bottomParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="about-simple-description">
              {paragraph}
            </p>
          ))}
          <SeoCtaBlockView {...seoContent.cta} className="about-simple-seo-cta seo-content-cta" />
          <Link href="/" className="about-simple-home">
            {messages.aboutPage.backHome}
          </Link>
        </div>
      </section>

      {hasValidFaqItems(seoContent.faq) ? (
        <SeoFaqSection faq={seoContent.faq} titleId="about-faq-title" />
      ) : null}
    </>
  );
}
