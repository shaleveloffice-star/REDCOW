"use client";

import { Calendar, Gift, Mail, Phone, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { BirthDatePicker } from "@/components/features/home/birth-date-picker";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  submitCustomerClubSignupAction,
  type CustomerClubSignupErrorCode
} from "@/server/actions/customer-club.actions";
import { trackEvent, type AnalyticsSource } from "@/lib/analytics";

import "./customer-club.css";

type FieldKey = "fullName" | "phone" | "email" | "consent";

function fieldForError(code: CustomerClubSignupErrorCode): FieldKey | null {
  if (code === "fullName" || code === "phone" || code === "email" || code === "consent") {
    return code;
  }
  return null;
}

type CustomerClubSignupFormProps = {
  source?: AnalyticsSource;
  className?: string;
  previewSuccess?: boolean;
};

export function CustomerClubSignupForm({
  source = "footer",
  className,
  previewSuccess = false
}: CustomerClubSignupFormProps) {
  const t = useTranslations();
  const ids = useId();
  const fullNameId = `${ids}-full-name`;
  const phoneId = `${ids}-phone`;
  const emailId = `${ids}-email`;
  const consentId = `${ids}-consent`;
  const errorId = `${ids}-error`;

  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(previewSuccess);
  const [errorCode, setErrorCode] = useState<CustomerClubSignupErrorCode | null>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
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
          : invalidField === "email"
            ? emailRef.current
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
        trackEvent("club_signup", { source });
        setSubmitted(true);
        return;
      }
      setErrorCode(result.code);
    });
  };

  if (submitted) {
    return (
      <div
        className={["customer-club-panel customer-club-success", className].filter(Boolean).join(" ")}
        role="status"
        aria-live="polite"
      >
        <Image
          className="customer-club-success-icon"
          src="/images/brand/nb-loading-mark.png"
          alt=""
          width={160}
          height={139}
          aria-hidden
        />
        <h3>{t.customerClub.successTitle}</h3>
        <p>{t.customerClub.successMessage}</p>
      </div>
    );
  }

  return (
    <form
      className={["customer-club-panel customer-club-form", className].filter(Boolean).join(" ")}
      action={handleSubmit}
      noValidate
    >
      <div className="customer-club-fields">
        <div className="customer-club-field">
          <label className="customer-club-field-label" htmlFor={fullNameId}>
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
          <label className="customer-club-field-label" htmlFor={phoneId}>
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
          <label className="customer-club-field-label" htmlFor={emailId}>
            {t.customerClub.fields.email}
          </label>
          <span className="customer-club-input-box">
            <Mail className="customer-club-input-icon" strokeWidth={1.5} aria-hidden="true" />
            <input
              ref={emailRef}
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={t.customerClub.fields.email}
              disabled={isPending}
              aria-invalid={invalidField === "email" ? true : undefined}
              aria-describedby={invalidField === "email" ? errorId : undefined}
            />
          </span>
        </div>

        <div className="customer-club-field">
          <span className="customer-club-field-label" id={`${ids}-birth-label`}>
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
        <p ref={errorRef} id={errorId} className="customer-club-error" role="alert" tabIndex={-1}>
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
