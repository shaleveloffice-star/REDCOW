"use client";

import { useId, useState, useTransition } from "react";

import { LabelWithNote } from "@/components/shared/label-with-note";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  submitContactMessageAction,
  type ContactMessageErrorCode
} from "@/server/actions/contact.actions";
import { trackEvent } from "@/lib/analytics";

export function ContactFormSection() {
  const t = useTranslations();
  const ids = useId();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [errorCode, setErrorCode] = useState<ContactMessageErrorCode | null>(null);

  const errorMessage = errorCode ? t.contactForm.errors[errorCode] : null;

  const handleSubmit = (formData: FormData) => {
    setErrorCode(null);
    startTransition(async () => {
      const result = await submitContactMessageAction(formData);
      if (result.ok) {
        trackEvent("contact_submit", { source: "footer" });
        setSubmitted(true);
        return;
      }
      setErrorCode(result.code);
    });
  };

  if (submitted) {
    return (
      <section className="site-contact-form" aria-live="polite">
        <h3 className="site-contact-form-title">{t.contactForm.successTitle}</h3>
        <p className="site-contact-form-lead">{t.contactForm.successMessage}</p>
      </section>
    );
  }

  return (
    <section className="site-contact-form" aria-labelledby={`${ids}-contact-title`}>
      <h3 id={`${ids}-contact-title`} className="site-contact-form-title">
        {t.contactForm.title}
      </h3>
      <p className="site-contact-form-lead">{t.contactForm.lead}</p>

      <form
        className="site-contact-form-fields"
        action={handleSubmit}
        noValidate
      >
        <label>
          {t.contactForm.fullName}
          <input name="fullName" type="text" autoComplete="name" required />
        </label>
        <label>
          {t.contactForm.phone}
          <input name="phone" type="tel" autoComplete="tel" required />
        </label>
        <label>
          <LabelWithNote label={t.contactForm.email} note={t.forms.optionalFieldNote} />
          <input name="email" type="email" autoComplete="email" />
        </label>
        <label>
          {t.contactForm.message}
          <textarea name="message" rows={4} required />
        </label>

        {errorMessage ? (
          <p className="site-contact-form-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button className="button" type="submit" disabled={isPending}>
          {isPending ? t.contactForm.submitting : t.contactForm.submit}
        </button>
      </form>
    </section>
  );
}
