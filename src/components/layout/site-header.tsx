import { SiteNavbar } from "@/components/layout/site-navbar";

type SiteHeaderProps = {
  overlay?: boolean;
  showPendingMenuTitle?: boolean;
};

export function SiteHeader({ overlay = false, showPendingMenuTitle }: SiteHeaderProps) {
  return <SiteNavbar overlay={overlay} showPendingMenuTitle={showPendingMenuTitle} />;
}
