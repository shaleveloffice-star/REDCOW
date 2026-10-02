"use client";

import { ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";

type PublicPageTarget = { href: string; label: string };

const HOME: PublicPageTarget = { href: "/", label: "דף הבית" };

/** Admin sections with no dedicated public page (popup, order links, club…) point to the home page where they appear. */
const PUBLIC_PAGE_BY_ADMIN_PATH: Record<string, PublicPageTarget> = {
  "/admin/menu": { href: "/menu", label: "התפריט" },
  "/admin/menu-categories": { href: "/menu", label: "התפריט" },
  "/admin/branches": { href: "/locations", label: "מיקומים" },
  "/admin/stories": { href: "/stories", label: "סיפורים" },
  "/admin/recommendations": { href: "/recommendations", label: "ממליצים" },
  "/admin/pages/home": HOME,
  "/admin/pages/about": { href: "/about", label: "אודות" },
  "/admin/pages/kosher": { href: "/kosher", label: "כשרות" },
  "/admin/pages/locations": { href: "/locations", label: "מיקומים" },
  "/admin/pages/privacy": { href: "/privacy-policy", label: "מדיניות פרטיות" },
  "/admin/pages/terms": { href: "/terms", label: "תקנון" }
};

export function resolveAdminPublicPage(pathname: string): PublicPageTarget {
  const match = Object.keys(PUBLIC_PAGE_BY_ADMIN_PATH)
    .filter((adminPath) => pathname === adminPath || pathname.startsWith(`${adminPath}/`))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PUBLIC_PAGE_BY_ADMIN_PATH[match] : HOME;
}

export function AdminPublicPageLink() {
  const pathname = usePathname();
  const target = resolveAdminPublicPage(pathname);

  return (
    <a
      className="button secondary admin-public-page-link"
      href={target.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ExternalLink size={16} aria-hidden="true" />
      <span>צפייה באתר: {target.label}</span>
      <span className="sr-only">(נפתח בלשונית חדשה)</span>
    </a>
  );
}
