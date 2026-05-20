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
          <SiteLogo variant="footer" />
          <span className="footer-brand-divider" aria-hidden="true" />
          <strong>
            המבורגר קלאסי.
            <br />
            בלי רעש מיותר.
          </strong>
        </section>

        <nav className="footer-column" aria-label="ניווט תחתון">
          <h3>ניווט</h3>
          {footerNavItems.map((item) => (
            <a href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </nav>

        <section className="footer-column footer-info" aria-label="מידע">
          <h3>מידע</h3>
          {footerInfoItems.map((item) => (
            <p key={item.label}>
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </p>
          ))}
        </section>

        <section className="footer-signup" aria-labelledby="footer-signup-title">
          <h3 id="footer-signup-title">הביס הראשון בדרך.</h3>
          <p>השאירו פרטים, ונעדכן אתכם כשהדלתות נפתחות.</p>
          <form>
            <label>
              <span>שם מלא</span>
              <input name="fullName" type="text" />
            </label>
            <label>
              <span>מספר טלפון</span>
              <input name="phone" type="tel" />
            </label>
            <label className="footer-checkbox">
              <input name="approval" type="checkbox" />
              <span>
                אני מאשר/ת קבלת עדכונים והודעות שיווקיות מ-RED COW - רד קאו, בהתאם
                ל<Link href="/privacy-policy">מדיניות הפרטיות</Link>.
              </span>
            </label>
            <button type="button">עדכנו אותי</button>
          </form>
        </section>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Red Cow. All rights reserved.</p>
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
