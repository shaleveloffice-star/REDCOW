"use client";

import { usePathname } from "next/navigation";

import { SiteNavbar } from "@/components/layout/site-navbar";
import type { OrderLink } from "@/types/content";

type SiteHeaderClientProps = {
  orderLinks: OrderLink[];
};

export function SiteHeaderClient({ orderLinks }: SiteHeaderClientProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  return (
    <SiteNavbar
      overlay={isHome}
      orderUrl={orderLinks[0]?.url ?? "#location"}
      orderLinks={orderLinks}
    />
  );
}
