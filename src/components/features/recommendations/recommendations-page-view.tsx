import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import { isSafePublicHref } from "@/lib/security/safe-url";
import type { Locale } from "@/i18n/config";
import type {
  CreatorRecommendation,
  RecommendationPlatform,
  RecommendationsConfig
} from "@/types/recommendations";

const PLATFORM_LABELS: Record<RecommendationPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Content"
};

const COPY: Record<Locale, {
  breadcrumb: string;
  viewContent: string;
  viewProfile: string;
  empty: string;
}> = {
  he: {
    breadcrumb: "ממליצים עלינו",
    viewContent: "לצפייה בתוכן",
    viewProfile: "לפרופיל היוצר",
    empty: "המלצות חדשות יעלו כאן בקרוב."
  },
  en: {
    breadcrumb: "Recommendations",
    viewContent: "View content",
    viewProfile: "Creator profile",
    empty: "New recommendations are coming soon."
  },
  fr: {
    breadcrumb: "Ils parlent de nous",
    viewContent: "Voir le contenu",
    viewProfile: "Profil du créateur",
    empty: "De nouvelles recommandations arrivent bientôt."
  }
};

function RecommendationMedia({ item }: { item: CreatorRecommendation }) {
  if (item.mediaType === "video") {
    return (
      <video
        className="recommendation-card-media"
        controls
        playsInline
        preload="metadata"
        poster={item.posterUrl || undefined}
        aria-label={item.mediaAlt || item.creatorName}
      >
        <source src={item.mediaUrl} />
      </video>
    );
  }

  return (
    // Admin-managed URLs may be local or hosted by Vercel Blob.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="recommendation-card-media"
      src={item.mediaUrl}
      alt={item.mediaAlt || item.creatorName}
      loading="lazy"
    />
  );
}

function formatRecommendationDate(value: string, locale: Locale): string {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}

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
  const items = config.items.filter((item) => item.isActive);

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
        <ul className="recommendations-grid">
          {items.map((item) => {
            const contentHref = isSafePublicHref(item.contentUrl) ? item.contentUrl : "";
            const profileHref = isSafePublicHref(item.profileUrl) ? item.profileUrl : "";

            return (
              <li
                key={item.id}
                className={`recommendation-card is-template-${item.template}`}
              >
                <div className="recommendation-card-visual">
                  <RecommendationMedia item={item} />
                  <span className="recommendation-platform">
                    {PLATFORM_LABELS[item.platform]}
                  </span>
                </div>
                <div className="recommendation-card-content">
                  <div className="recommendation-creator">
                    <h2>{item.creatorName}</h2>
                    {item.handle ? <p>{item.handle}</p> : null}
                    {item.recommendationDate ? (
                      <time dateTime={item.recommendationDate}>
                        {formatRecommendationDate(item.recommendationDate, locale)}
                      </time>
                    ) : null}
                  </div>
                  {item.quote ? <blockquote>“{item.quote}”</blockquote> : null}
                  {contentHref || profileHref ? (
                    <div className="recommendation-card-links">
                      {contentHref ? (
                        <a href={contentHref} target="_blank" rel="noreferrer">
                          {copy.viewContent}
                        </a>
                      ) : null}
                      {profileHref ? (
                        <a href={profileHref} target="_blank" rel="noreferrer">
                          {copy.viewProfile}
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
