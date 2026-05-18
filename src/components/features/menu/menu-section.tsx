import type { MenuCategory, MenuItem } from "@/types/content";

export function MenuSection({
  groups
}: {
  groups: Array<MenuCategory & { items: MenuItem[] }>;
}) {
  return (
    <section id="menu" className="section page-shell">
      <span className="pill">תפריט</span>
      <h2 className="section-title">מנות שמוכנות לעבוד היום עם Mock Data</h2>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {groups.map((group) => (
          <article className="card" key={group.id} style={{ padding: 24 }}>
            <h3>{group.name}</h3>
            <p className="muted">{group.description}</p>
            <div className="grid">
              {group.items.map((item) => (
                <div key={item.id}>
                  <strong>{item.name}</strong>
                  <p className="muted">{item.description}</p>
                  <span>{item.price} ש"ח</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
