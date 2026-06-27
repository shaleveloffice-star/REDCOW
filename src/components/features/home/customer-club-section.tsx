"use client";

import {
  BadgeCheck,
  Calendar,
  CircleCheck,
  Clock3,
  Gift,
  Lock,
  Percent,
  Phone,
  Star,
  User
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { BirthDatePicker } from "@/components/features/home/birth-date-picker";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  submitCustomerClubSignupAction,
  type CustomerClubSignupErrorCode
} from "@/server/actions/customer-club.actions";

import "./customer-club.css";

const perkIcons = [Gift, Star, Percent] as const;
const CLUB_HERO_IMAGE = "/images/brand/nb-club-hero.png";
const CLUB_MEMBER_AVATARS = [
  "/images/brand/club-member-1.png",
  "/images/brand/club-member-2.png",
  "/images/brand/club-member-3.png",
  "/images/brand/club-member-4.png"
] as const;

export function CustomerClubSection() {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [errorCode, setErrorCode] = useState<CustomerClubSignupErrorCode | null>(null);

  const perks = useMemo(
    () =>
      t.customerClub.perks.map((perk, index) => ({
        ...perk,
        Icon: perkIcons[index] ?? Gift
      })),
    [t]
  );

  const errorMessage = errorCode ? t.customerClub.errors[errorCode] : null;

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
    <section id="club" className="customer-club-section" aria-labelledby="customer-club-title">
      <div className="customer-club-shell">
        <div className="customer-club-form-slot">
          <aside className="customer-club-form-col">
            {submitted ? (
              <div className="customer-club-panel customer-club-success" role="status">
                <CircleCheck className="customer-club-success-icon" strokeWidth={1.5} aria-hidden="true" />
                <h3>{t.customerClub.successTitle}</h3>
                <p>{t.customerClub.successMessage}</p>
              </div>
            ) : (
              <form className="customer-club-panel customer-club-form" action={handleSubmit} noValidate>
                <p className="customer-club-form-hint">
                  <Clock3 strokeWidth={1.5} aria-hidden="true" />
                  <span>{t.customerClub.formHint}</span>
                </p>

                <div className="customer-club-fields">
                  <label className="customer-club-field">
                    <span className="customer-club-input-box">
                      <User className="customer-club-input-icon" strokeWidth={1.5} aria-hidden="true" />
                      <input
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        placeholder={t.customerClub.fields.fullName}
                        required
                        disabled={isPending}
                      />
                    </span>
                  </label>

                  <label className="customer-club-field">
                    <span className="customer-club-input-box">
                      <Phone className="customer-club-input-icon" strokeWidth={1.5} aria-hidden="true" />
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder={t.customerClub.fields.phone}
                        required
                        disabled={isPending}
                      />
                    </span>
                  </label>

                  <div className="customer-club-field">
                    <span className="customer-club-input-box customer-club-input-box--birth">
                      <Calendar className="customer-club-input-icon" strokeWidth={1.5} aria-hidden="true" />
                      <BirthDatePicker
                        name="birthDate"
                        label={t.customerClub.fields.birthDate}
                        showLabel={false}
                        disabled={isPending}
                      />
                    </span>
                  </div>
                </div>

                <button className="customer-club-submit" type="submit" disabled={isPending}>
                  <Gift strokeWidth={1.75} aria-hidden="true" />
                  <span>{isPending ? t.customerClub.submitting : t.customerClub.submit}</span>
                </button>

                <label className="customer-club-consent">
                  <input name="marketingConsent" type="checkbox" required disabled={isPending} />
                  <span>
                    {t.customerClub.consentPrefix}{" "}
                    <Link href="/privacy-policy">{t.customerClub.privacyLink}</Link>
                  </span>
                </label>

                {errorMessage ? (
                  <p className="customer-club-error" role="alert">
                    {errorMessage}
                  </p>
                ) : null}

                <div className="customer-club-social-proof">
                  <div className="customer-club-social-row">
                    <div className="customer-club-avatars" aria-hidden="true">
                      {CLUB_MEMBER_AVATARS.map((src, index) => (
                        <img
                          key={src}
                          className="customer-club-avatar"
                          src={src}
                          alt=""
                          width={36}
                          height={36}
                          loading="lazy"
                          style={{ zIndex: CLUB_MEMBER_AVATARS.length - index }}
                        />
                      ))}
                    </div>
                    <p>{t.customerClub.socialProof}</p>
                  </div>
                  <div className="customer-club-stars" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} strokeWidth={1.5} fill="#ffe1ba" color="#ffe1ba" />
                    ))}
                  </div>
                </div>
              </form>
            )}
          </aside>
        </div>

        <header className="customer-club-copy">
          <p className="customer-club-kicker">{t.customerClub.kicker}</p>
          <h2 id="customer-club-title" className="customer-club-title">
            <span className="customer-club-title-primary">{t.customerClub.titlePrimary}</span>
            <span className="customer-club-title-accent">{t.customerClub.titleAccent}</span>
          </h2>
          <p className="customer-club-lead">
            {t.customerClub.leadBefore}
            <span className="customer-club-lead-accent">{t.customerClub.leadHighlight}</span>
            {t.customerClub.leadAfter}
          </p>
        </header>

        <div className="customer-club-hero" aria-hidden="true">
          <img
            className="customer-club-hero-image"
            src={CLUB_HERO_IMAGE}
            alt={t.customerClub.burgerAlt}
            width={2100}
            height={2100}
            loading="lazy"
          />
        </div>

        <ul className="customer-club-perks" aria-label={t.customerClub.perksAria}>
          {perks.map((perk) => (
            <li key={perk.title}>
              <div className="customer-club-perk-body">
                <h3>{perk.title}</h3>
                <p>{perk.desc}</p>
              </div>
              <span className="customer-club-perk-icon" aria-hidden="true">
                <perk.Icon strokeWidth={1.5} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="customer-club-trust-bar">
        <div className="customer-club-trust-inner">
          <p>
            <Lock strokeWidth={1.5} aria-hidden="true" />
            <span>{t.customerClub.trustSafe}</span>
          </p>
          <p>
            <BadgeCheck strokeWidth={1.5} aria-hidden="true" />
            <span>{t.customerClub.trustTerms}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
