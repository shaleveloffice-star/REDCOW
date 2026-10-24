import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import { RecommendationMedia } from "@/components/features/recommendations/recommendation-media";
import { recommendationHasPlayableMedia } from "@/lib/recommendations/recommendation-embed";
import type { Locale } from "@/i18n/config";
import type { RecommendationsConfig } from "@/types/recommendations";

const COPY: Record<Locale, { breadcrumb: string; empty: string }> = {
  he: {
    breadcrumb: "ממליצים עלינו",
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
        {config.introduction ? <p className="recommendations-intro">{config.introduction}</p> : null}
      </header>

      {items.length === 0 ? (
        <p className="recommendations-empty">{copy.empty}</p>
      ) : (
        <ul className="recommendations-gallery">
          {items.map((item) => (
            <li key={item.id} className="recommendation-card">
              <div className="recommendation-square">
                <RecommendationMedia item={item} />
                <h2 className="sr-only">{item.creatorName}</h2>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
