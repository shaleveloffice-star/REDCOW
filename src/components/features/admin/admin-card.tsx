export function AdminCard({
  title,
  description,
  children,
  actions
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="admin-card">
      <header className="admin-card-header">
        <div className="admin-card-heading">
          <h2 className="admin-card-title">{title}</h2>
          {description ? <p className="admin-card-desc">{description}</p> : null}
        </div>
        {actions ? <div className="admin-card-actions">{actions}</div> : null}
      </header>
      <div className="admin-card-body">{children}</div>
    </section>
  );
}
