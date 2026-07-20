import { SiteNavbar } from "@/components/layout/site-navbar";
import type { OrderLink } from "@/types/content";

type SiteHeaderProps = {
  overlay?: boolean;
  orderUrl?: string;
  orderLinks?: OrderLink[];
};

export function SiteHeader({ overlay = false, orderUrl, orderLinks }: SiteHeaderProps) {
  return <SiteNavbar overlay={overlay} orderUrl={orderUrl} orderLinks={orderLinks} />;
}
