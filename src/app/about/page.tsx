import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "אודות | Red Cow"
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell section inner-page">
        <h1 className="section-title">אודות</h1>
      </main>
      <SiteFooter />
    </>
  );
}
