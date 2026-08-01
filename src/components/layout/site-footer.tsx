import { ContactFormSection } from "@/components/features/contact/contact-form-section";
import { IconMail, IconMapPin, IconPhone } from "@/components/shared/site-icons";
import { SITE_LOGO_SRC } from "@/data/brand-assets";
import { BUSINESS, getBusinessMapsSearchUrl } from "@/data/business";
import { getServerLocale } from "@/i18n/get-locale";
import { getMessages } from "@/i18n/messages";
import { resolveImageAlt } from "@/lib/image-alt";

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

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="site-footer-social-icon" aria-hidden="true">
      <path
        d="M19.6 8.2a5.8 5.8 0 0 1-3.4-1.1v7.2a5.3 5.3 0 1 1-4.5-5.2v2.5a2.8 2.8 0 1 0 2 2.7V3h2.5a5.8 5.8 0 0 0 3.4 3.4v1.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export async function SiteFooter() {
  const locale = await getServerLocale();
  const t = getMessages(locale);
  const logoAlt = resolveImageAlt({ kind: "logo", locale });
  const phone = BUSINESS.phone;
  const mapsUrl = getBusinessMapsSearchUrl();

  const footerNavLinks = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.menu, href: "/menu" },
    { label: t.nav.location, href: "/locations" },
    { label: t.nav.about, href: "/about" }
  ];

  const footerMenuItems = [{ label: t.footer.fullMenu, href: "/menu" }];

  return (
    <footer className="site-footer" id="site-footer">
      <div className="site-footer-glow" aria-hidden="true" />

      <div className="site-footer-main">
        <div className="site-footer-grid">
          <section className="site-footer-brand" aria-label={BUSINESS.name}>
            <img
              className="site-footer-logo"
              src={SITE_LOGO_SRC}
              alt={logoAlt}
              width={160}
              height={160}
              loading="lazy"
              decoding="async"
            />
            <p className="site-footer-tagline">
              {t.footer.taglineLine1}
              <br />
              {t.footer.taglineLine2}
            </p>
          </section>

          <section className="site-footer-block" aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title" className="site-footer-heading">
              {t.footer.contact}
            </h2>
            <div className="site-footer-contact-list">
              {phone ? (
                <a href={`tel:${phone}`} className="site-footer-contact-link">
                  <IconPhone className="site-footer-icon" />
                  <span>{phone}</span>
                </a>
              ) : null}
              <p className="site-footer-contact-item">
                <IconMapPin className="site-footer-icon" />
                <span>{t.location.address}</span>
              </p>
              <a href={`mailto:${BUSINESS.email}`} className="site-footer-contact-link">
                <IconMail className="site-footer-icon" />
                <span>{BUSINESS.email}</span>
              </a>
            </div>
            <ContactFormSection />
            <div className="site-footer-social-wrap">
              <p className="site-footer-social-label">{t.footer.followUs}</p>
              <div className="site-footer-socials">
                <a
                  href={BUSINESS.social.instagram}
                  className="site-footer-social"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramIcon />
                </a>
                <a
                  href={BUSINESS.social.facebook}
                  className="site-footer-social"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FacebookIcon />
                </a>
                <a
                  href={BUSINESS.social.tiktok}
                  className="site-footer-social"
                  aria-label="TikTok"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TikTokIcon />
                </a>
                <a
                  href={mapsUrl}
                  className="site-footer-social"
                  aria-label={t.footer.mapAria}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconMapPin className="site-footer-social-icon" />
                </a>
              </div>
            </div>
          </section>

          <nav className="site-footer-block" aria-labelledby="footer-nav-title">
            <h2 id="footer-nav-title" className="site-footer-heading">
              {t.footer.nav}
            </h2>
            <div className="site-footer-links">
              {footerNavLinks.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <section className="site-footer-block" aria-labelledby="footer-menu-title">
            <h2 id="footer-menu-title" className="site-footer-heading">
              {t.footer.menu}
            </h2>
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
          <p>{t.footer.copyright}</p>
          <p className="site-footer-est">
            EST. <span>NB</span> BURGER 2026
          </p>
          <div className="site-footer-legal-links">
            <a className="site-footer-legal-link" href="/privacy-policy">
              {t.footer.privacy}
            </a>
            <span className="site-footer-legal-sep" aria-hidden="true">
              ·
            </span>
            <a className="site-footer-legal-link" href="/terms">
              {t.footer.terms}
            </a>
          </div>
          <p>{t.footer.closing}</p>
        </div>
      </div>
    </footer>
  );
}
