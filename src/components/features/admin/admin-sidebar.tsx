"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderTree,
  LayoutDashboard,
  Link2,
  Mail,
  MapPin,
  Newspaper,
  Search,
  Settings,
  UtensilsCrossed,
  Users
} from "lucide-react";

import { logoutAdminAction } from "@/server/actions/auth.actions";

const navItems = [
  { href: "/admin", label: "סקירה", icon: LayoutDashboard, exact: true },
  { href: "/admin/menu", label: "ניהול תפריט", icon: UtensilsCrossed },
  { href: "/admin/menu-categories", label: "קטגוריות", icon: FolderTree },
  { href: "/admin/branches", label: "סניפים", icon: MapPin },
  { href: "/admin/press", label: "כתבות", icon: Newspaper },
  { href: "/admin/contact-messages", label: "הודעות", icon: Mail },
  { href: "/admin/customer-club", label: "מועדון לקוחות", icon: Users },
  { href: "/admin/career-applications", label: "קורות חיים", icon: FileText },
  { href: "/admin/order-links", label: "קישורי הזמנה", icon: Link2 },
  { href: "/admin/seo-content", label: "תוכן SEO", icon: Search },
  { href: "/admin/settings", label: "הגדרות", icon: Settings }
] as const;

function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-glow" aria-hidden="true" />

      <Link className="admin-back-link" href="/">
        <span aria-hidden="true">←</span>
        חזרה לאתר
      </Link>

      <div className="admin-brand">
        <p className="admin-brand-kicker">Admin Panel</p>
        <h1 className="admin-brand-title">NB BURGER</h1>
        <p className="admin-brand-sub">ניהול האתר</p>
      </div>

      <nav aria-label="ניווט ניהול" className="admin-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href, "exact" in item ? item.exact : false);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="admin-nav-icon" aria-hidden="true">
                <Icon strokeWidth={1.75} size={18} />
              </span>
              <span className="admin-nav-label">{item.label}</span>
              {active ? <span className="admin-nav-active-dot" aria-hidden="true" /> : null}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAdminAction} className="admin-logout-form">
        <button className="admin-logout-button" type="submit">
          יציאה
        </button>
      </form>
    </aside>
  );
}
