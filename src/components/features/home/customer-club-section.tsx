"use client";

import {
  BadgePercent,
  Cake,
  Calendar,
  CircleCheck,
  Crown,
  Gift,
  Phone,
  Star,
  User,
  UtensilsCrossed
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { BirthDatePicker } from "@/components/features/home/birth-date-picker";
import { useTranslations } from "@/components/providers/locale-provider";
import { BUSINESS } from "@/data/business";
import {
  submitCustomerClubSignupAction,
  type CustomerClubSignupErrorCode
} from "@/server/actions/customer-club.actions";

import "./customer-club.css";

const CLUB_HERO_IMAGE = "/images/brand/nb-club-hero.png";

const FEATURE_ICONS = [Gift, Star, Cake] as const;
const FORM_PERK_ICONS = [Crown, BadgePercent, UtensilsCrossed] as const;

type FieldKey = "fullName" | "phone" | "consent";

function fieldForError(code: CustomerClubSignupErrorCode): FieldKey | null {
  if (code === "fullName" || code === "phone" || code === "consent") {
    return code;
  }
  return null;
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.7A2.9 2.9 0 1 1 14.9 12 2.9 2.9 0 0 1 12 14.9zm5.95-8.85a1.15 1.15 0 1 0 1.15 1.15 1.15 1.15 0 0 0-1.15-1.15z"
      />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 8.2h2.4V5H14a4 4 0 0 0-4 4v2.2H7.5V14H10v7h3.2v-7h2.5l.5-2.8h-3V9a.8.8 0 0 1 .8-.8z"
      />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.6 7.2a5.6 5.6 0 0 1-3.5-1.2v7.1a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v2.7a2.7 2.7 0 1 0 1.8 2.6V2.5h2.6a5.6 5.6 0 0 0 3.6 3.5z"
      />
    </svg>
  );
}

export function CustomerClubSection() {
  const t = useTranslations();
  const ids = useId();
  const fullNameId = `${ids}-full-name`;
  const phoneId = `${ids}-phone`;
  const consentId = `${ids}-consent`;
  const errorId = `${ids}-error`;

  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [errorCode, setErrorCode] = useState<CustomerClubSignupErrorCode | null>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const errorMessage = errorCode ? t.customerClub.errors[errorCode] : null;
  const invalidField = errorCode ? fieldForError(errorCode) : null;

  useEffect(() => {
    if (!errorCode) return;

    const target =
      invalidField === "fullName"
        ? fullNameRef.current
        : invalidField === "phone"
          ? phoneRef.current
          : invalidField === "consent"
            ? consentRef.current
            : errorRef.current;

    window.requestAnimationFrame(() => {
      target?.focus();
    });
  }, [errorCode, invalidField]);

  const handleSubmit = (formData: FormData) => {
    setErrorCode(null);
    startTransition(async () => {
      const result = await submitCustomerClubSignupAction(formData);
      if (result.ok) {
        setSubmitted(true);
        return;
      }
      setErrorCode(result.code);
    });
  };

  return (
    <section
      id="club"
      className="customer-club-section customer-club-section--mockup"
      aria-labelledby="customer-club-title"
    >
      <div className="customer-club-shell">
        <div className="customer-club-visual">
          <header className="customer-club-copy">
            <p className="customer-club-kicker">{t.customerClub.kicker}</p>
            <h2 id="customer-club-title" className="customer-club-title">
              {t.customerClub.title}
            </h2>
            <span className="customer-club-title-rule" aria-hidden="true" />
            <p className="customer-club-lead">{t.customerClub.lead}</p>
          </header>

          <ul className="customer-club-features" aria-label={t.customerClub.perksAria}>
            {t.customerClub.features.map((feature, index) => {
              const Icon = FEATURE_ICONS[index] ?? Gift;
              return (
                <li key={feature.title} className="customer-club-feature">
                  <span className="customer-club-feature-icon" aria-hidden="true">
                    <Icon strokeWidth={1.5} />
                  </span>
                  <span className="customer-club-feature-label">{feature.title}</span>
                </li>
              );
            })}
          </ul>

          <div className="customer-club-hero" aria-hidden="true">
            <div className="customer-club-hero-glow" />
            <div className="customer-club-hero-particles" />
            <Image
              className="customer-club-hero-image"
              src={CLUB_HERO_IMAGE}
              alt=""
              width={2100}
              height={2100}
              sizes="(max-width: 899px) 280px, 520px"
              loading="lazy"
            />
          </div>
        </div>

        <aside className="customer-club-form-col">
          {submitted ? (
            <div
              className="customer-club-panel customer-club-success"
              role="status"
              aria-live="polite"
            >
              <CircleCheck className="customer-club-success-icon" strokeWidth={1.5} aria-hidden="true" />
              <h3>{t.customerClub.successTitle}</h3>
              <p>{t.customerClub.successMessage}</p>
            </div>
          ) : (
            <form className="customer-club-panel customer-club-form" action={handleSubmit} noValidate>
              <header className="customer-club-form-head">
                <h3 className="customer-club-form-title">
                  <span className="customer-club-form-title-line" aria-hidden="true" />
                  <span>{t.customerClub.formTitle}</span>
                  <span className="customer-club-form-title-line" aria-hidden="true" />
                </h3>
                <p className="customer-club-form-subtitle">{t.customerClub.formSubtitle}</p>
              </header>

              <div className="customer-club-fields">
                <div className="customer-club-field">
                  <label className="visually-hidden" htmlFor={fullNameId}>
                    {t.customerClub.fields.fullName}
                  </label>
                  <span className="customer-club-input-box">
                    <User className="customer-club-input-icon" strokeWidth={1.5} aria-hidden="true" />
                    <input
                      ref={fullNameRef}
                      id={fullNameId}
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder={t.customerClub.fields.fullName}
                      required
                      disabled={isPending}
                      aria-invalid={invalidField === "fullName" ? true : undefined}
                      aria-describedby={invalidField === "fullName" ? errorId : undefined}
                    />
                  </span>
                </div>

                <div className="customer-club-field">
                  <label className="visually-hidden" htmlFor={phoneId}>
                    {t.customerClub.fields.phone}
                  </label>
                  <span className="customer-club-input-box">
                    <Phone className="customer-club-input-icon" strokeWidth={1.5} aria-hidden="true" />
                    <input
                      ref={phoneRef}
                      id={phoneId}
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder={t.customerClub.fields.phone}
                      required
                      disabled={isPending}
                      aria-invalid={invalidField === "phone" ? true : undefined}
                      aria-describedby={invalidField === "phone" ? errorId : undefined}
                    />
                  </span>
                </div>

                <div className="customer-club-field">
                  <span className="visually-hidden" id={`${ids}-birth-label`}>
                    {t.customerClub.fields.birthDate}
                  </span>
                  <span className="customer-club-input-box customer-club-input-box--birth">
                    <Calendar className="customer-club-input-icon" strokeWidth={1.5} aria-hidden="true" />
                    <BirthDatePicker
                      name="birthDate"
                      label={t.customerClub.fields.birthDate}
                      labelledBy={`${ids}-birth-label`}
                      showLabel={false}
                      disabled={isPending}
                    />
                  </span>
                </div>
              </div>

              <button className="customer-club-submit" type="submit" disabled={isPending}>
                <span>{isPending ? t.customerClub.submitting : t.customerClub.submit}</span>
                <Gift strokeWidth={1.75} aria-hidden="true" />
              </button>

              <label className="customer-club-consent" htmlFor={consentId}>
                <input
                  ref={consentRef}
                  id={consentId}
                  name="marketingConsent"
                  type="checkbox"
                  required
                  disabled={isPending}
                  aria-invalid={invalidField === "consent" ? true : undefined}
                  aria-describedby={invalidField === "consent" ? errorId : undefined}
                />
                <span>
                  {t.customerClub.consentPrefix}
                  {" · "}
                  <Link href="/privacy-policy">{t.customerClub.privacyLink}</Link>
                </span>
              </label>

              {errorMessage ? (
                <p
                  ref={errorRef}
                  id={errorId}
                  className="customer-club-error"
                  role="alert"
                  tabIndex={-1}
                >
                  {errorMessage}
                </p>
              ) : null}

              <ul className="customer-club-form-perks" aria-hidden="true">
                {t.customerClub.formPerks.map((perk, index) => {
                  const Icon = FORM_PERK_ICONS[index] ?? Crown;
                  return (
                    <li key={perk.title} className="customer-club-form-perk">
                      <span className="customer-club-form-perk-icon">
                        <Icon strokeWidth={1.5} />
                      </span>
                      <span className="customer-club-form-perk-text">
                        <strong>{perk.title}</strong>
                        <span>{perk.desc}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </form>
          )}
        </aside>
      </div>

      <div className="customer-club-bar">
        <div className="customer-club-bar-inner">
          <div className="customer-club-bar-brand">
            <p className="customer-club-bar-name">{BUSINESS.name}</p>
            <p className="customer-club-bar-sub">{t.customerClub.barBrandSub}</p>
          </div>

          <div className="customer-club-bar-socials">
            <a
              href={BUSINESS.social.instagram}
              className="customer-club-bar-social"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <IconInstagram />
            </a>
            <a
              href={BUSINESS.social.facebook}
              className="customer-club-bar-social"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <IconFacebook />
            </a>
            <a
              href={BUSINESS.social.tiktok}
              className="customer-club-bar-social"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
            >
              <IconTikTok />
            </a>
          </div>

          <p className="customer-club-bar-slogan">{t.customerClub.barSlogan}</p>
        </div>
      </div>
    </section>
  );
}
