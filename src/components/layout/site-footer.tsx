import Link from "next/link";
import { SiteLogo } from "@/components/layout/site-logo";

const footerNavItems: { label: string; href: string }[] = [
  { label: "תפריט", href: "/menu" },
  { label: "גלריה", href: "/#gallery" },
  { label: "סניפים", href: "/branches" },
  { label: "צור קשר", href: "/#contact" }
];

const footerInfoItems = [
  { icon: "▦", label: "פתיחה בקרוב" },
  { icon: "⌖", label: "מרכז הארץ" },
  { icon: "♨", label: "משלוחים" },
  { icon: "▣", label: "איסוף עצמי" }
];

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-top-line">
        <span className="footer-burger-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
      <div className="footer-shell">
        <section className="footer-brand" aria-label="NB Burger">
          <div className="footer-col-head footer-col-head--logo">
            <SiteLogo variant="footer" />
          </div>
          <div className="footer-col-body">
            <span className="footer-brand-divider" aria-hidden="true" />
            <strong>
              המבורגר קלאסי.
              <br />
              בלי רעש מיותר.
            </strong>
          </div>
        </section>

        <nav className="footer-column" aria-label="ניווט תחתון">
          <div className="footer-col-head">
            <h3>ניווט</h3>
          </div>
          <div className="footer-col-body">
            {footerNavItems.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <section className="footer-column footer-info" aria-label="מידע">
          <div className="footer-col-head">
            <h3>מידע</h3>
          </div>
          <div className="footer-col-body">
            {footerInfoItems.map((item) => (
              <p key={item.label}>
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </p>
            ))}
          </div>
        </section>

        <section className="footer-signup" aria-labelledby="footer-signup-title">
          <div className="footer-signup-intro">
            <div className="footer-col-head">
              <h3 id="footer-signup-title">הביס הראשון בדרך.</h3>
            </div>
            <p>השאירו פרטים, ונעדכן אתכם כשהדלתות נפתחות.</p>
          </div>
          <form className="footer-signup-form" noValidate>
            <label className="footer-field">
              <span className="footer-field-label">שם מלא</span>
              <input
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="איך לפנות אליכם?"
              />
            </label>
            <label className="footer-field">
              <span className="footer-field-label">מספר טלפון</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="050-0000000"
                dir="ltr"
              />
            </label>
            <button className="footer-signup-submit" type="button">
              <span>עדכנו אותי</span>
              <span className="footer-signup-submit-icon" aria-hidden="true">
                ←
              </span>
            </button>
            <label className="footer-checkbox">
              <input name="approval" type="checkbox" />
              <span className="footer-checkbox-box" aria-hidden="true" />
              <span className="footer-checkbox-text">
                אני מאשר/ת קבלת עדכונים והודעות שיווקיות מ-NB Burger, בהתאם
                ל<Link href="/privacy-policy">מדיניות הפרטיות</Link>.
              </span>
            </label>
          </form>
        </section>
      </div>
      <div className="footer-bottom">
        <p>© 2026 NB Burger. All rights reserved.</p>
        <div className="footer-socials">
          <a aria-label="Instagram" className="footer-social instagram" href="https://instagram.com/redcow">
            <span />
          </a>
          <a aria-label="TikTok" className="footer-social tiktok" href="https://tiktok.com">
            <span />
          </a>
          <a aria-label="Facebook" className="footer-social facebook" href="https://facebook.com">
            <span />
          </a>
        </div>
      </div>
    </footer>
  );
}
