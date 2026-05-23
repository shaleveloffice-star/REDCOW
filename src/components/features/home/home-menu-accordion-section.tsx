"use client";

import type { MenuCategory, MenuItem } from "@/types/content";
import { useEffect, useId, useState } from "react";

type MenuGroup = MenuCategory & { items: MenuItem[] };

type HomeMenuAccordionSectionProps = {
  groups: MenuGroup[];
};

const MENU_PLACEHOLDER_IMAGE = "/images/menu/placeholder.svg";

function getCategoryImageUrl(items: MenuItem[]): string {
  const withImage = items.find((item) => item.imageUrl.trim().length > 0);
  return withImage?.imageUrl.trim() || MENU_PLACEHOLDER_IMAGE;
}

export function HomeMenuAccordionSection({ groups }: HomeMenuAccordionSectionProps) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const first = groups[0]?.id;
    return first ? new Set([first]) : new Set();
  });

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash.startsWith("menu-")) {
      return;
    }
    const slug = hash.slice("menu-".length);
    const category = groups.find((entry) => entry.slug === slug);
    if (!category) {
      return;
    }
    setOpenIds((prev) => new Set([...prev, category.id]));
  }, [groups]);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (groups.length === 0) {
    return null;
  }

  return (
    <section id="menu" className="home-menu-section" aria-labelledby="home-menu-title">
      <div className="home-menu-shell">
        <header className="home-menu-header">
          <span className="home-menu-header-rule" aria-hidden="true" />
          <h2 id="home-menu-title" className="home-menu-title">
            התפריט
          </h2>
          <span className="home-menu-header-rule home-menu-header-rule--wide" aria-hidden="true" />
          <p className="home-menu-note">באים רעבים</p>
        </header>

        <div className="menu-category-list">
          {groups.map((category, index) => {
            const isOpen = openIds.has(category.id);
            const panelId = `${baseId}-panel-${category.id}`;
            const buttonId = `${baseId}-btn-${category.id}`;
            const indexLabel = String(index + 1).padStart(2, "0");
            const categoryImage = getCategoryImageUrl(category.items);

            return (
              <article
                key={category.id}
                id={`menu-${category.slug}`}
                className={`menu-category-row${isOpen ? " is-open" : ""}`}
              >
                <h3 className="menu-category-heading">
                  <button
                    id={buttonId}
                    type="button"
                    className="menu-category-trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(category.id)}
                  >
                    <span className="menu-category-index" aria-hidden="true">
                      <span className="menu-category-index-num">{indexLabel}</span>
                      <span className="menu-category-index-arrow">→</span>
                    </span>

                    <span className="menu-category-copy">
                      <span className="menu-category-name">{category.name}</span>
                      {category.description ? (
                        <span className="menu-category-desc">{category.description}</span>
                      ) : null}
                    </span>

                    <span className="menu-category-thumb">
                      <img src={categoryImage} alt="" width={168} height={112} loading="lazy" />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  className="menu-category-panel"
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  <ul className="menu-category-items">
                    {category.items.map((item) => (
                      <li key={item.id} className="menu-category-item">
                        <div className="menu-category-item-copy">
                          <strong className="menu-category-item-name">{item.name}</strong>
                          {item.description ? (
                            <p className="menu-category-item-desc">{item.description}</p>
                          ) : null}
                          {item.tags.length > 0 ? (
                            <ul className="menu-category-item-tags" aria-label="תגיות">
                              {item.tags.map((tag) => (
                                <li key={tag}>{tag}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                        <p className="menu-category-item-price">
                          <span>{item.price}</span>
                          <span className="menu-category-item-currency">₪</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
