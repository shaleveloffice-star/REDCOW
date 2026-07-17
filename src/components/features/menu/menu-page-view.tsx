import Image from "next/image";
import Link from "next/link";

import { MenuAutoplayMedia } from "@/components/features/menu/menu-autoplay-media";
import { BUSINESS } from "@/data/business";
import { getServerLocale } from "@/i18n/get-locale";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { getMessages } from "@/i18n/messages";
import { isVideoMediaUrl } from "@/lib/menu-media";
import type { MenuCategory, MenuItem } from "@/types/content";

type MenuPageViewProps = {
  groups: Array<MenuCategory & { items: MenuItem[] }>;
};

export async function MenuPageView({ groups }: MenuPageViewProps) {
  const locale = await getServerLocale();
  const t = getMessages(locale);

  return (
    <>
      <header className="menu-page-intro menu-highlights-shell">
        <p className="menu-highlights-kicker">Menu</p>
        <h1 className="menu-page-hero-title">
          {`תפריט המבורגרים ב${BUSINESS.address.addressLocality}`}
        </h1>
        <p className="menu-page-lede">
          {`בחרו את ההמבורגר הבא שלכם מתוך התפריט של ${BUSINESS.name} – עם מנות שמוכנות על הפלנצ׳ה ותוספות שמשלימות כל ביס.`}
        </p>
        <div className="menu-page-intro-actions">
          <Link className="menu-showcase-button menu-page-back" href="/">
            {t.nav.home}
          </Link>
          <Link className="menu-showcase-button menu-page-back" href="/branches">
            {`פרטי הסניף וניווט ל-${BUSINESS.name} ${BUSINESS.address.addressLocality}`}
          </Link>
        </div>
      </header>

      {groups.length === 0 ? (
        <p className="menu-page-empty">{t.menuShowcase.lead}</p>
      ) : (
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
                            <MenuAutoplayMedia src={item.imageUrl} name={localized.name} />
                          ) : (
                            <Image
                              alt={localized.name}
                              src={item.imageUrl}
                              width={400}
                              height={300}
                              sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
      )}
    </>
  );
}
