import { SiteNavbar } from "@/components/layout/site-navbar";

type SiteHeaderProps = {
  overlay?: boolean;
};

export function SiteHeader({ overlay = false }: SiteHeaderProps) {
  return <SiteNavbar overlay={overlay} />;
}
