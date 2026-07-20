import { SiteNavbar } from "@/components/layout/site-navbar";

type SiteHeaderProps = {
  overlay?: boolean;
  orderUrl?: string;
};

export function SiteHeader({ overlay = false, orderUrl }: SiteHeaderProps) {
  return <SiteNavbar overlay={overlay} orderUrl={orderUrl} />;
}
