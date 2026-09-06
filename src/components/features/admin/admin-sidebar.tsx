"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  FileText,
  FolderTree,
  Home,
  Images,
  Info,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Newspaper,
  ScrollText,
  Settings,
  Shield,
  UtensilsCrossed,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { logoutAdminAction } from "@/server/actions/auth.actions";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    id: "overview",
    label: "ראשי",
    items: [{ href: "/admin", label: "סקירה", icon: LayoutDashboard, exact: true }]
  },
  {
    id: "content",
    label: "תוכן ותפריט",
    items: [
      { href: "/admin/menu", label: "ניהול תפריט", icon: UtensilsCrossed },
      { href: "/admin/menu-categories", label: "קטגוריות", icon: FolderTree },
      { href: "/admin/branches", label: "סניפים", icon: MapPin },
      { href: "/admin/press", label: "כתבות", icon: Newspaper },
      { href: "/admin/stories", label: "סיפורים", icon: BookOpen },
      { href: "/admin/gallery", label: "גלריה", icon: Images },
      { href: "/admin/announcement-popup", label: "פופ־אפ הודעה", icon: Megaphone },
      { href: "/admin/order-links", label: "קישורי הזמנה", icon: Link2 }
    ]
  },
  {
    id: "leads",
    label: "לקוחות ופניות",
    items: [
      { href: "/admin/customer-club", label: "מועדון לקוחות", icon: Users },
      { href: "/admin/contact-messages", label: "הודעות", icon: Mail },
      { href: "/admin/career-applications", label: "קורות חיים", icon: FileText }
    ]
  },
  {
    id: "seo",
    label: "SEO ועמודים",
    items: [
      { href: "/admin/pages/home", label: "דף הבית", icon: Home },
      { href: "/admin/pages/about", label: "אודות", icon: Info },
      { href: "/admin/pages/locations", label: "מיקומים", icon: MapPin },
      { href: "/admin/pages/privacy", label: "פרטיות", icon: Shield },
      { href: "/admin/pages/terms", label: "תקנון", icon: ScrollText }
    ]
  },
  {
    id: "system",
    label: "מערכת",
    items: [{ href: "/admin/settings", label: "הגדרות", icon: Settings }]
  }
];

function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupHasActive(pathname: string, group: NavGroup) {
  return group.items.some((item) => isActivePath(pathname, item.href, item.exact));
}

function buildOpenState(pathname: string): Record<string, boolean> {
  const open: Record<string, boolean> = {};
  for (const group of navGroups) {
    open[group.id] = groupHasActive(pathname, group) || group.id === "overview" || group.id === "content";
  }
  return open;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => buildOpenState(pathname));

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const group of navGroups) {
        if (groupHasActive(pathname, group)) next[group.id] = true;
      }
      return next;
    });
  }, [pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const groups = useMemo(() => navGroups, []);

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-top">
        <Link className="admin-back-link" href="/">
          <span aria-hidden="true">←</span>
          חזרה לאתר
        </Link>

        <div className="admin-brand">
          <div className="admin-brand-mark" aria-hidden="true">
            NB
          </div>
          <div>
            <p className="admin-brand-kicker">Admin</p>
            <h1 className="admin-brand-title">NB BURGER</h1>
            <p className="admin-brand-sub">ניהול האתר</p>
          </div>
        </div>
      </div>

      <nav aria-label="ניווט ניהול" className="admin-nav">
        {groups.map((group) => {
          const open = openGroups[group.id] ?? true;
          const activeGroup = groupHasActive(pathname, group);

          return (
            <div
              key={group.id}
              className={`admin-nav-group${open ? " is-open" : ""}${activeGroup ? " is-active-group" : ""}`}
            >
              {group.items.length === 1 && group.id === "overview" ? (
                group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(pathname, item.href, item.exact);
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
                })
              ) : (
                <>
                  <button
                    type="button"
                    className="admin-nav-group-toggle"
                    aria-expanded={open}
                    onClick={() => toggleGroup(group.id)}
                  >
                    <span>{group.label}</span>
                    <ChevronDown size={16} aria-hidden="true" />
                  </button>
                  {open ? (
                    <div className="admin-nav-group-items">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActivePath(pathname, item.href, item.exact);
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
                    </div>
                  ) : null}
                </>
              )}
            </div>
          );
        })}
      </nav>

      <form action={logoutAdminAction} className="admin-logout-form">
        <button className="admin-logout-button" type="submit">
          <LogOut size={16} aria-hidden="true" />
          יציאה
        </button>
      </form>
    </aside>
  );
}
