import { Mail, MapPin, Phone } from "lucide-react";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="site-footer-social-icon" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="site-footer-social-icon" aria-hidden="true">
      <path
        d="M14 8.5h2.5V5H14c-2.8 0-4.5 1.7-4.5 4.6V12H7v3.5h2.5V22h3.5v-6.5H17V12h-3.5v-2.1c0-1 .3-1.4 1.5-1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

const MAPS_URL = "https://maps.google.com/?q=רח+ויצמן+1+כפר+סבא";

const footerNavLinks = [
  { label: "דף הבית", href: "/#hero" },
  { label: "על הפלנצ׳ה", href: "/#plancha" },
  { label: "מה יוצא מהמטבח", href: "/#kitchen" },
  { label: "התפריט", href: "/#menu" },
  { label: "האווירה", href: "/#atmosphere" },
  { label: "מיקום ושעות", href: "/#location" }
];

const footerMenuItems = [
  { label: "המבורגרים", href: "/#menu-burgers" },
  { label: "תוספות", href: "/#menu-sides" },
  { label: "שתייה", href: "/#menu-drinks" },
  { label: "קינוחים", href: "/#menu-desserts" }
];

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact" dir="rtl">
      <div className="site-footer-glow" aria-hidden="true" />

      <div className="site-footer-main">
        <div className="site-footer-grid">
          <section className="site-footer-brand" aria-label="NB Burger">
            <h3 className="site-footer-logo">
              NB
              <br />
              BURGER
            </h3>
            <p className="site-footer-tagline">
              בשר שנטחן במקום,
              <br />
              פלנצ׳ה לוהטת נביס שנבנה נכון.
            </p>
          </section>

          <section className="site-footer-block" aria-labelledby="footer-contact-title">
            <h4 id="footer-contact-title" className="site-footer-heading">
              צרו קשר
            </h4>
            <div className="site-footer-contact-list">
              <a href="tel:12345678" className="site-footer-contact-link">
                <Phone className="site-footer-icon" strokeWidth={1.5} aria-hidden="true" />
                <span>12345678</span>
              </a>
              <p className="site-footer-contact-item">
                <MapPin className="site-footer-icon" strokeWidth={1.5} aria-hidden="true" />
                <span>רח׳ ויצמן 1, כפר סבא</span>
              </p>
              <a href="mailto:hello@nbburger.co.il" className="site-footer-contact-link">
                <Mail className="site-footer-icon" strokeWidth={1.5} aria-hidden="true" />
                <span>hello@nbburger.co.il</span>
              </a>
            </div>
            <div className="site-footer-social-wrap">
              <p className="site-footer-social-label">עקבו אחרינו</p>
              <div className="site-footer-socials">
                <a
                  href="https://instagram.com"
                  className="site-footer-social"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramIcon />
                </a>
                <a
                  href="https://facebook.com"
                  className="site-footer-social"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FacebookIcon />
                </a>
                <a
                  href={MAPS_URL}
                  className="site-footer-social"
                  aria-label="מיקום במפה"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="site-footer-social-icon" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </section>

          <nav className="site-footer-block" aria-label="ניווט תחתון">
            <h4 className="site-footer-heading">ניווט</h4>
            <div className="site-footer-links">
              {footerNavLinks.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <section className="site-footer-block" aria-labelledby="footer-menu-title">
            <h4 id="footer-menu-title" className="site-footer-heading">
              תפריט
            </h4>
            <div className="site-footer-links">
              {footerMenuItems.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="site-footer-bar">
        <div className="site-footer-bar-inner">
          <p>© 2026 NB BURGER - כל הזכויות שמורות</p>
          <p className="site-footer-est">
            EST. <span>NB</span> BURGER 2026
          </p>
          <div className="site-footer-legal-links">
            <a className="site-footer-legal-link" href="/privacy-policy">
              מדיניות פרטיות
            </a>
            <span className="site-footer-legal-sep" aria-hidden="true">
              ·
            </span>
            <a className="site-footer-legal-link" href="/terms">
              תקנון האתר
            </a>
          </div>
          <p>לכל אירוע, בכל שעה. ביס אחד שלא תשכחו.</p>
        </div>
      </div>
    </footer>
  );
}
