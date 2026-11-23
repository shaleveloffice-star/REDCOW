import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import { RecommendationGallery } from "@/components/features/recommendations/recommendation-gallery";
import { recommendationHasPlayableMedia } from "@/lib/recommendations/recommendation-embed";
import {
  RECOMMENDATIONS_GOOGLE_REVIEWS_LABEL,
  RECOMMENDATIONS_GOOGLE_REVIEWS_URL
} from "@/lib/recommendations/recommendations-config";
import { renderInlineMarkdown } from "@/lib/seo-content/inline-markdown";
import type { Locale } from "@/i18n/config";
import type { RecommendationsConfig } from "@/types/recommendations";

const COPY: Record<Locale, { breadcrumb: string; empty: string }> = {
  he: {
    breadcrumb: "באו לטעום",
    empty: "המלצות חדשות יעלו כאן בקרוב."
  },
  en: {
    breadcrumb: "Recommendations",
    empty: "New recommendations are coming soon."
  },
  fr: {
    breadcrumb: "Ils parlent de nous",
    empty: "De nouvelles recommandations arrivent bientôt."
  }
};

export function RecommendationsPageView({
  config,
  locale,
  homeLabel
}: {
  config: RecommendationsConfig;
  locale: Locale;
  homeLabel: string;
}) {
  const copy = COPY[locale];
  const items = config.items.filter(
    (item) => item.isActive && recommendationHasPlayableMedia(item)
  );

  return (
    <div className="recommendations-page-shell">
      <header className="recommendations-hero">
        <MenuBreadcrumbs
          items={[
            { label: homeLabel, href: "/" },
            { label: copy.breadcrumb }
          ]}
        />
        <p className="recommendations-kicker">SO WHAT · CREATORS</p>
        <h1>{config.title}</h1>
        {config.introduction ? (
          <p className="recommendations-intro">{renderInlineMarkdown(config.introduction)}</p>
        ) : null}
        <div className="recommendations-google-cta">
          <a
            className="site-cta-btn site-cta-btn--outline recommendations-google-btn"
            href={RECOMMENDATIONS_GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="site-cta-btn-label">{RECOMMENDATIONS_GOOGLE_REVIEWS_LABEL}</span>
          </a>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="recommendations-empty">{copy.empty}</p>
      ) : (
        <RecommendationGallery items={config.items} />
      )}
    </div>
  );
}
