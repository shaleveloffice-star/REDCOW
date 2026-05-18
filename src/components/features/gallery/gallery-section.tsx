import type { GalleryItem } from "@/types/content";

export function GallerySection({ items }: { items: GalleryItem[] }) {
  return (
    <section id="gallery" className="section page-shell">
      <span className="pill">גלריה</span>
      <h2 className="section-title">תמונות מוכנות ל-Storage עתידי</h2>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {items.map((item) => (
          <article className="card" key={item.id} style={{ minHeight: 180, padding: 20 }}>
            <p className="muted">{item.category}</p>
            <h3>{item.title}</h3>
            <p>{item.alt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
