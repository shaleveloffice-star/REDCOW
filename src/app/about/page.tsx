import type { Metadata } from "next";
import { AboutPageView } from "@/components/features/about/about-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "אודות NB - אן בי",
  description:
    "אודות NB - אן בי. המבורגר בסיסי: בשר טוב, לחמנייה רכה, ירקות טריים ורוטב נכון, בחוויה מדויקת."
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="about-page" dir="rtl">
        <AboutPageView />
      </main>
      <SiteFooter />
    </>
  );
}
