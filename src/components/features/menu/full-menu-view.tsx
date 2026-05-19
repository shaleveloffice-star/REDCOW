import type { MenuCategory, MenuItem } from "@/types/content";

export function FullMenuView({
  groups
}: {
  groups: Array<MenuCategory & { items: MenuItem[] }>;
}) {
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
            {category.description ? <p className="menu-page-category-desc">{category.description}</p> : null}
          </div>
          <ul className="menu-page-grid">
            {category.items.map((item) => (
              <li key={item.id}>
                <article className="menu-page-dish">
                  <div className="menu-page-dish-head">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="menu-page-dish-visual">
                    <img alt={item.name} src={item.imageUrl} width={400} height={300} loading="lazy" decoding="async" />
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
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
