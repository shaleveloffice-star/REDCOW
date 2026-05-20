import Link from "next/link";
import { SITE_LOGO_SRC } from "@/components/layout/site-logo";

const IMG = {
  hero: "/images/hero/burger-hero.png",
  classic: "/images/menu/red-cow-classic.png",
  fries: "/images/menu/red-cow-fries.png",
  experience: "/images/experience/red-cow-experience.png",
  smoked: "/images/menu/smoked-burger.png"
} as const;

const momentItems = [
  { title: "צהריים", desc: "באמצע יום עבודה" },
  { title: "ערב", desc: "עם חברים" },
  { title: "דייט", desc: "קליל ונעים" },
  { title: "משפחה", desc: "שולחן פתוח" }
] as const;

export function AboutPageView() {
  return (
    <>
      <section className="about-hero" aria-labelledby="about-hero-title">
        <div className="about-hero-bg" aria-hidden="true">
          <img src={IMG.hero} alt="" className="about-hero-bg-img" width={1600} height={900} />
          <div className="about-hero-scrim" />
        </div>
        <div className="about-hero-content page-shell">
          <img className="about-hero-mark" src={SITE_LOGO_SRC} alt="" width={200} height={100} />
          <p className="menu-highlights-kicker about-hero-kicker">About Us</p>
          <h1 id="about-hero-title" className="about-hero-title">
            אודות NB - אן בי
          </h1>
          <p className="about-hero-sub">
            יש מקומות שמנסים להמציא את ההמבורגר מחדש.
            <span className="about-hero-sub-break">אנחנו לא שם.</span>
          </p>
          <div className="about-hero-cta">
            <Link className="about-btn about-btn-primary" href="/menu">
              לתפריט
            </Link>
            <a className="about-btn about-btn-ghost" href="/branches">
              סניפים
            </a>
          </div>
        </div>
      </section>

      <div className="about-page-content page-shell section">
        <p className="about-intro-narrow">
          ב־NB - אן בי לקחנו את הדבר הכי בסיסי, בשר טוב, לחמנייה רכה, ירקות טריים ורוטב נכון, ובנינו סביבו חוויה
          מדויקת.
        </p>

        <div className="about-split about-split-text-start">
          <div className="about-split-copy">
            <p className="about-section-kicker">בשר ופלנצ&apos;ה</p>
            <h2 className="about-section-title">מדויקים בבסיס</h2>
            <p>
              הבשר נטחן במקום, מתובל בעדינות, ועולה על פלנצ&apos;ה חמה שנותנת לו את הצריבה הנכונה מבחוץ ואת
              העסיסיות מבפנים.
            </p>
          </div>
          <figure className="about-split-figure">
            <div className="about-frame">
              <img src={IMG.classic} alt="המבורגר — בשר וצריבה נכונה" width={640} height={480} loading="lazy" />
            </div>
          </figure>
        </div>

        <div className="about-split about-split-img-start">
          <figure className="about-split-figure">
            <div className="about-frame about-frame-accent">
              <img src={IMG.fries} alt="תוספות וצ׳יפס ליד הבורגר" width={640} height={480} loading="lazy" />
            </div>
          </figure>
          <div className="about-split-copy">
            <p className="about-section-kicker">תפריט ברור</p>
            <h2 className="about-section-title">בלי עומס, בלי רעש</h2>
            <p>
              לא רצינו תפריט שמעמיס.
              <br />
              לא רצינו מנה שנראית טוב רק בתמונה.
              <br />
              רצינו אוכל שאנשים באמת רוצים לאכול שוב.
            </p>
            <p className="about-split-copy-tight">
              לכן התפריט שלנו נשאר ברור:
              <br />
              המבורגרים, צ&apos;יפס פריך, מנות צד חמות ורטבים שמשלימים את הביס בלי להשתלט עליו.
            </p>
          </div>
        </div>

        <section className="about-strip" aria-label="תמונות מהמטבח והמסעדה">
          <div className="about-strip-inner">
            <div className="about-strip-card">
              <img src={IMG.smoked} alt="מנת המבורגר מהתפריט" width={400} height={300} loading="lazy" />
            </div>
            <div className="about-strip-card">
              <img src={IMG.experience} alt="חוויית האוכל ב-NB" width={400} height={300} loading="lazy" />
            </div>
            <div className="about-strip-card">
              <img src={IMG.classic} alt="המבורגר קלאסי" width={400} height={300} loading="lazy" />
            </div>
          </div>
        </section>

        <div className="about-split about-split-text-start">
          <div className="about-split-copy">
            <p className="about-section-kicker">התחושה</p>
            <h2 className="about-section-title">מקום שחוזרים אליו</h2>
            <p>
              NB - אן בי נבנתה כמו מקום שחוזרים אליו.
              <br />
              לא רק בגלל האוכל, אלא בגלל התחושה.
            </p>
          </div>
          <figure className="about-split-figure">
            <div className="about-frame">
              <img src={IMG.experience} alt="אווירת המקום" width={640} height={480} loading="lazy" />
            </div>
          </figure>
        </div>

        <section className="about-moments" aria-labelledby="about-moments-title">
          <h2 id="about-moments-title" className="about-moments-heading">
            מתי באים?
          </h2>
          <p className="about-moments-lede">כל מיני רגעים — אותה חוויה מדויקת.</p>
          <ul className="about-moments-grid">
            {momentItems.map((item) => (
              <li key={item.title} className="about-moment-card">
                <span className="about-moment-title">{item.title}</span>
                <span className="about-moment-desc">{item.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <blockquote className="about-closing">
          <p>האווירה קלילה.</p>
          <p>האוכל מדויק.</p>
          <p>
            והכול בנוי סביב דבר אחד:
            <br />
            שיהיה פשוט טעים להיות כאן.
          </p>
        </blockquote>

        <div className="about-bottom-cta">
          <p className="about-bottom-cta-text">מוכנים לביס הבא?</p>
          <Link className="about-btn about-btn-primary about-btn-lg" href="/menu">
            לתפריט המלא
          </Link>
        </div>
      </div>
    </>
  );
}
