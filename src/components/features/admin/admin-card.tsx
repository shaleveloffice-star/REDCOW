export function AdminCard({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-card">
      <header className="admin-card-header">
        <h2 className="admin-card-title">{title}</h2>
        {description ? <p className="admin-card-desc">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
