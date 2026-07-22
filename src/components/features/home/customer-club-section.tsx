"use client";

import {
  Calendar,
  CircleCheck,
  Gift,
  Phone,
  User
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { BirthDatePicker } from "@/components/features/home/birth-date-picker";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  submitCustomerClubSignupAction,
  type CustomerClubSignupErrorCode
} from "@/server/actions/customer-club.actions";

import "./customer-club.css";

const CLUB_HERO_IMAGE = "/images/brand/nb-club-hero-alpha.png";

type FieldKey = "fullName" | "phone" | "consent";

function fieldForError(code: CustomerClubSignupErrorCode): FieldKey | null {
  if (code === "fullName" || code === "phone" || code === "consent") {
    return code;
  }
  return null;
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
      className="customer-club-section customer-club-section--simple"
      aria-labelledby="customer-club-title"
    >
      <div className="customer-club-simple-shell">
        <header className="customer-club-simple-copy">
          <h2 id="customer-club-title" className="customer-club-title">
            {t.customerClub.title}
          </h2>
          <p className="customer-club-lead">{t.customerClub.lead}</p>
        </header>

        <div className="customer-club-simple-form-wrap">
          <div className="customer-club-simple-burger" aria-hidden="true">
            <Image
              className="customer-club-simple-burger-image"
              src={CLUB_HERO_IMAGE}
              alt=""
              width={1024}
              height={1024}
              sizes="(max-width: 700px) 150px, 230px"
              loading="lazy"
            />
          </div>

          <aside className="customer-club-simple-form-col">
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
              </form>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
