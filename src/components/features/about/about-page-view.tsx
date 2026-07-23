import Image from "next/image";
import Link from "next/link";

import { ABOUT_PAGE_IMAGES as IMG } from "@/data/site-images.registry";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

type AboutPageViewProps = {
  siteImages?: SiteImagesMap;
};

export function AboutPageView({ siteImages }: AboutPageViewProps) {
  const hero = pickSiteImage(siteImages, "about-hero", IMG.hero);

  return (
    <section className="about-simple" aria-labelledby="about-simple-title">
      <Image
        src={hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="about-simple-image"
      />
      <div className="about-simple-overlay" aria-hidden="true" />

      <div className="about-simple-content">
        <h1 id="about-simple-title">NB BURGER המקום שבו כל ביס מרגיש אחרת</h1>
        <p className="about-simple-subtitle">
          המבורגרים כשרים מבשר איכותי, חומרי גלם טריים וחוויית אוכל שנבנתה מתוך
          אהבה אמיתית להמבורגר.
        </p>
        <p className="about-simple-description about-simple-description--first">
          ב-NB BURGER אנחנו מאמינים שהמבורגר טוב מתחיל בחומרי הגלם ומסתיים
          בחוויה שנשארת איתכם גם אחרי הביס האחרון. כל מנה מוכנה במקום מבשר
          איכותי, עם ירקות טריים, רטבים מיוחדים ולחמניות שנבחרו בקפידה כדי ליצור
          את השילוב המושלם.
        </p>
        <p className="about-simple-description">
          הקמנו את NB BURGER מתוך רצון להביא לרעננה חוויית המבורגר כשרה ברמה
          הגבוהה ביותר - בלי להתפשר על איכות, טעם או שירות. בין אם הגעתם לארוחה
          עם חברים, עם המשפחה או סתם כי התחשק לכם המבורגר אמיתי, אנחנו כאן כדי
          להגיש לכם אוכל מצוין, אווירה טובה ושירות מכל הלב.
        </p>
        <Link href="/" className="about-simple-home">
          חזרה לדף הבית
        </Link>
      </div>
    </section>
  );
}
