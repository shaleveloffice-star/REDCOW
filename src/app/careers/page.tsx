import type { Metadata } from "next";
import { getDirection } from "@/i18n/config";
import { getServerLocale } from "@/i18n/get-locale";
import { buildPageMetadata } from "@/lib/seo";
import { SiteFooter } from "@/components/layout/site-footer";
import { CareersForm } from "@/components/features/careers/careers-form";
import { CAREERS_COPY } from "@/components/features/careers/careers-copy";
import styles from "@/components/features/careers/careers.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = CAREERS_COPY[locale];
  return buildPageMetadata({ title: copy.pageTitle, description: copy.description, path: "/careers", locale });
}

export default async function CareersPage() {
  const locale = await getServerLocale();
  const copy = CAREERS_COPY[locale];
  return <>
    <main id="main-content" className={styles.page} dir={getDirection(locale)}>
      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label={copy.breadcrumb}>
          <a href="/">{copy.home}</a><span aria-hidden="true">/</span><span aria-current="page">{copy.breadcrumb}</span>
        </nav>
        <div className={styles.layout}>
          <header className={styles.intro}>
            <p className={styles.kicker}>{copy.kicker}</p>
            <h1>{copy.heading}</h1>
            <p className={styles.body}>{copy.intro}</p>
            <p className={styles.note}>{copy.note}</p>
            <ul className={styles.badges}>{copy.badges.map(badge => <li key={badge}>{badge}</li>)}</ul>
            <p className={styles.wordmark} dir="ltr" aria-hidden="true">SO WHAT?</p>
          </header>
          <CareersForm locale={locale} />
        </div>
      </div>
    </main>
    <SiteFooter />
  </>;
}
