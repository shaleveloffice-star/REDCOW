import Link from "next/link";

export type MenuBreadcrumbItem = {
  label: string;
  href?: string;
};

type MenuBreadcrumbsProps = {
  items: MenuBreadcrumbItem[];
};

export function MenuBreadcrumbs({ items }: MenuBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav className="menu-bleecker-breadcrumbs" aria-label="Breadcrumb">
      <ol className="menu-bleecker-breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="menu-bleecker-breadcrumbs-item">
              {item.href && !isLast ? (
                <Link href={item.href} className="menu-bleecker-breadcrumbs-link">
                  {item.label}
                </Link>
              ) : (
                <span className="menu-bleecker-breadcrumbs-current" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span className="menu-bleecker-breadcrumbs-separator" aria-hidden="true">
                  ›
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
