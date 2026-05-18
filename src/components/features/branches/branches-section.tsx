import type { Branch } from "@/types/content";

export function BranchesSection({ branches }: { branches: Branch[] }) {
  return (
    <section id="branches" className="section page-shell">
      <span className="pill">סניפים</span>
      <h2 className="section-title">איפה פוגשים אותנו</h2>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {branches.map((branch) => (
          <article className="card" key={branch.id} style={{ padding: 24 }}>
            <h3>{branch.name}</h3>
            <p className="muted">{branch.address}, {branch.city}</p>
            <p>{branch.openingHours}</p>
            <a className="button secondary" href={branch.wazeUrl}>
              ניווט ב-Waze
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
