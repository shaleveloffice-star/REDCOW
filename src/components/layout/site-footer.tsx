import { getPrimaryBranch } from "@/services/branches.service";
import { TrackedAnchor } from "@/components/analytics/tracked-click";
import { FooterCustomerClubCta } from "@/components/layout/footer-customer-club-cta";
import { IconMail, IconMapPin, IconPhone } from "@/components/shared/site-icons";
import { SITE_WORDMARK_LIGHT_SRC, SITE_WORDMARK_LIGHT_WEBP_SRC } from "@/data/brand-assets";
import { BUSINESS, branchMapsUrl, branchAddress } from "@/data/business";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
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
  const t = await getLocalizedMessages(locale);
  const logoAlt = resolveImageAlt({ kind: "logo", locale });
  const branch = await getPrimaryBranch();
  const phone = branch ? branch.phone : BUSINESS.phone;
  const mapsUrl = branchMapsUrl(branch);

  const footerNavLinks = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.menu, href: "/menu" },
    { label: t.nav.kosher, href: "/kosher" },
    { label: t.nav.about, href: "/about" }
  ];

  return (
    <footer className="site-footer" id="site-footer">
      <div className="site-footer-glow" aria-hidden="true" />

      <div className="site-footer-main">
        <div className="site-footer-grid">
          <section className="site-footer-club" aria-labelledby="footer-club-title">
            <div className="site-footer-logo-wrap">
              <picture>
                <source srcSet={SITE_WORDMARK_LIGHT_WEBP_SRC} type="image/webp" />
                <img
                  className="site-footer-logo"
                  src={SITE_WORDMARK_LIGHT_SRC}
                  alt={logoAlt}
                  width={160}
                  height={72}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            <h2 id="footer-club-title" className="site-footer-heading">
              {t.footer.clubTitle}
            </h2>
            <p className="site-footer-club-lead">{t.footer.clubLead}</p>
            <FooterCustomerClubCta />
          </section>

          <section className="site-footer-brand site-footer-block" aria-labelledby="footer-nav-title">
            <h2 id="footer-nav-title" className="site-footer-heading">
              {t.footer.nav}
            </h2>
            <nav className="site-footer-links" aria-label={t.footer.nav}>
              {footerNavLinks.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
              <a href="/menu">{t.footer.fullMenu}</a>
            </nav>
          </section>

          <section className="site-footer-block" aria-labelledby="footer-info-title">
            <h2 id="footer-info-title" className="site-footer-heading">
              {t.location.hoursHeading}
            </h2>
            <div className="site-footer-info">
              <dl className="site-footer-hours">
                <div>
                  <dt>{t.location.days.sunThu}</dt>
                  <dd>{t.location.hours.sunThu}</dd>
                </div>
                {t.location.hours.fri ? (
                  <div>
                    <dt>{t.location.days.fri}</dt>
                    <dd>{t.location.hours.fri}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>{t.location.days.sat}</dt>
                  <dd>{t.location.hours.sat}</dd>
                </div>
              </dl>
              <p className="site-footer-info-line">{t.location.parking}</p>
            </div>
            <div className="site-footer-social-wrap">
              <h2 id="footer-social-title" className="site-footer-heading">
                {t.footer.followUs}
              </h2>
              <div className="site-footer-socials">
                <TrackedAnchor
                  href={BUSINESS.social.instagram}
                  className="site-footer-social"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  eventName="social_click"
                  source="footer"
                  eventParams={{ network: "instagram" }}
                >
                  <InstagramIcon />
                </TrackedAnchor>
                <TrackedAnchor
                  href={BUSINESS.social.facebook}
                  className="site-footer-social"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  eventName="social_click"
                  source="footer"
                  eventParams={{ network: "facebook" }}
                >
                  <FacebookIcon />
                </TrackedAnchor>
                <TrackedAnchor
                  href={BUSINESS.social.tiktok}
                  className="site-footer-social"
                  aria-label="TikTok"
                  target="_blank"
                  rel="noopener noreferrer"
                  eventName="social_click"
                  source="footer"
                  eventParams={{ network: "tiktok" }}
                >
                  <TikTokIcon />
                </TrackedAnchor>
                <TrackedAnchor
                  href={mapsUrl}
                  className="site-footer-social"
                  aria-label={t.footer.mapAria}
                  target="_blank"
                  rel="noopener noreferrer"
                  eventName="location_open"
                  source="footer"
                  eventParams={{ network: "maps" }}
                >
                  <IconMapPin className="site-footer-social-icon" />
                </TrackedAnchor>
              </div>
            </div>
          </section>

          <section className="site-footer-block site-footer-contact" aria-labelledby="footer-contact-title">
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
                <span>{branchAddress(branch, locale)}</span>
              </p>
              <a href={`mailto:${BUSINESS.email}`} className="site-footer-contact-link">
                <IconMail className="site-footer-icon" />
                <span>{BUSINESS.email}</span>
              </a>
            </div>
          </section>
        </div>
      </div>

      <div className="site-footer-bar">
        <div className="site-footer-bar-inner">
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
            <span className="site-footer-legal-sep" aria-hidden="true">
              ·
            </span>
            <a className="site-footer-legal-link" href="/accessibility">
              {t.footer.accessibility}
            </a>
          </div>
          <p className="site-footer-business-type">{t.location.businessType}</p>
          <p className="site-footer-copyright">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
