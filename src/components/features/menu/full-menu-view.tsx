"use client";

import type { MenuCategory, MenuItem } from "@/types/content";

import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { AutoplayVideo } from "@/components/shared/autoplay-video";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { isVideoMediaUrl } from "@/lib/menu-media";

const MENU_VIDEO_POSTER = "/images/menu/placeholder.svg";

export function FullMenuView({
  groups
}: {
  groups: Array<MenuCategory & { items: MenuItem[] }>;
}) {
  const { locale } = useLocale();
  const t = useTranslations();

  if (groups.length === 0) {
    return <p className="menu-page-empty">{t.menuShowcase.lead}</p>;
  }

  return (
    <div className="menu-page-body menu-highlights-shell">
      {groups.map((category) => (
        <section
          key={category.id}
          className="menu-page-category"
          id={category.slug}
          aria-labelledby={`menu-cat-${category.id}`}
        >
          <div className="menu-page-category-head">
            <h2 id={`menu-cat-${category.id}`}>{category.name}</h2>
            {category.description ? (
              <p className="menu-page-category-desc">{category.description}</p>
            ) : null}
          </div>
          <ul className="menu-page-grid">
            {category.items.map((item) => {
              const localized = getLocalizedMenuItem(item, locale);

              return (
                <li key={item.id}>
                  <article className="menu-page-dish">
                    <div className="menu-page-dish-head">
                      <h3>{localized.name}</h3>
                      <p>{localized.description}</p>
                    </div>
                    <div className="menu-page-dish-visual">
                      {isVideoMediaUrl(item.imageUrl) ? (
                        <AutoplayVideo
                          src={item.imageUrl}
                          poster={MENU_VIDEO_POSTER}
                          aria-label={localized.name}
                        />
                      ) : (
                        <img
                          alt={localized.name}
                          src={item.imageUrl}
                          width={400}
                          height={300}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                    <div className="menu-page-dish-foot">
                      {item.tags.length > 0 ? (
                        <ul className="menu-page-tags" aria-label="תגיות">
                          {item.tags.map((tag) => (
                            <li key={tag}>{tag}</li>
                          ))}
                        </ul>
                      ) : null}
                      <strong className="menu-page-dish-price">{item.price} ₪</strong>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
