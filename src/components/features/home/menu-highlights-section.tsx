import Link from "next/link";
import type { MenuCategory, MenuItem } from "@/types/content";

export function MenuHighlightsSection({
  groups
}: {
  groups: Array<MenuCategory & { items: MenuItem[] }>;
}) {
  const highlights = groups.flatMap((group) => group.items).slice(0, 3);

  return (
    <section className="menu-highlights" aria-labelledby="menu-highlights-title">
      <div className="menu-highlights-shell">
        <p className="menu-highlights-kicker">Menu Highlights</p>
        <h2 id="menu-highlights-title">המנות שלנו</h2>
        <div className="menu-highlights-grid">
          {highlights.map((item) => (
            <article className="menu-highlight-card" key={item.id}>
              <div className="menu-highlight-content">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <strong>{item.price} ₪</strong>
              </div>
              <div className="menu-highlight-image">
                <img alt={item.name} src={item.imageUrl} />
              </div>
            </article>
          ))}
        </div>
        <Link className="menu-highlights-button" href="/menu">
          צפה בתפריט המלא
        </Link>
      </div>
    </section>
  );
}
