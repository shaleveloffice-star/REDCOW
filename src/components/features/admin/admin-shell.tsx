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
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link href="/" className="pill">
          חזרה לאתר
        </Link>
        <h1 style={{ margin: "24px 0 0", fontSize: 28 }}>Red Cow Admin</h1>
        <p className="muted">ניהול לוקלי, מוכן לחיבור Firebase בעתיד.</p>
        <nav className="admin-nav">
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
