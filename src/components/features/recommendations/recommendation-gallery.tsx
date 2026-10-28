import { RecommendationMedia } from "@/components/features/recommendations/recommendation-media";
import { isPressRecommendation } from "@/lib/recommendations/content-kind";
import { recommendationHasPlayableMedia } from "@/lib/recommendations/recommendation-embed";
import { isSafePublicHref } from "@/lib/security/safe-url";
import type { CreatorRecommendation } from "@/types/recommendations";

export function RecommendationGallery({ items }: { items: CreatorRecommendation[] }) {
  const visible = items.filter((item) => item.isActive && recommendationHasPlayableMedia(item));
  return (
    <ul className="recommendations-gallery">
      {visible.map((item) =>
        isPressRecommendation(item) ? (
          <li key={item.id} id={`creator-${item.id}`} className="recommendation-card recommendation-card--press">
            <PressCard item={item} />
          </li>
        ) : (
          <li key={item.id} id={`creator-${item.id}`} className="recommendation-card">
            <div className="recommendation-square">
              <RecommendationMedia item={item} />
            </div>
            <h2 className="recommendation-creator">{item.creatorName}</h2>
            {item.handle ? (
              <p className="recommendation-handle" dir="ltr">
                {item.handle}
              </p>
            ) : null}
          </li>
        )
      )}
    </ul>
  );
}

function PressCard({ item }: { item: CreatorRecommendation }) {
  const href = isSafePublicHref(item.contentUrl) ? item.contentUrl : "";
  const cover = item.mediaUrl.trim();
  const title = item.articleTitle.trim() || item.creatorName;
  const body = (
    <>
      <div className="recommendation-press-media">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={item.mediaAlt || title} loading="lazy" />
        ) : (
          <div className="recommendation-press-media-fallback" aria-hidden="true" />
        )}
      </div>
      <div className="recommendation-press-body">
        <p className="recommendation-press-outlet">{item.creatorName}</p>
        <h2 className="recommendation-press-title">{title}</h2>
        {item.quote ? <p className="recommendation-press-excerpt">{item.quote}</p> : null}
        {href ? <span className="recommendation-press-cta">לכתבה המלאה</span> : null}
      </div>
    </>
  );

  if (!href) {
    return <div className="recommendation-press-card">{body}</div>;
  }

  return (
    <a
      className="recommendation-press-card"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {body}
    </a>
  );
}
