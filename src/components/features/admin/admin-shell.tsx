import Link from "next/link";

const navItems = [
  { href: "/admin", label: "סקירה" },
  { href: "/admin/menu", label: "ניהול תפריט" },
  { href: "/admin/menu-categories", label: "קטגוריות תפריט" },
  { href: "/admin/branches", label: "סניפים" },
  { href: "/admin/gallery", label: "גלריה" },
  { href: "/admin/press", label: "כתבות" },
  { href: "/admin/contact-messages", label: "הודעות יצירת קשר" },
  { href: "/admin/career-applications", label: "קורות חיים" },
  { href: "/admin/order-links", label: "קישורי הזמנה" },
  { href: "/admin/settings", label: "הגדרות אתר" }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout" dir="rtl">
      <aside className="admin-sidebar">
        <Link className="admin-back-link" href="/">
          חזרה לאתר
        </Link>
        <div className="admin-brand">
          <p className="admin-brand-kicker">Admin Panel</p>
          <h1 className="admin-brand-title">RED COW</h1>
          <p className="admin-brand-sub">ניהול האתר</p>
        </div>
        <nav aria-label="ניווט ניהול" className="admin-nav">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
