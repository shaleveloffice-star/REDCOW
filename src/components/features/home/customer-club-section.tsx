"use client";

import { motion } from "framer-motion";
import { Gift, Percent, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { useTranslations } from "@/components/providers/locale-provider";
import {
  submitCustomerClubSignupAction,
  type CustomerClubSignupErrorCode
} from "@/server/actions/customer-club.actions";

const perkIcons = [Gift, Sparkles, Percent] as const;

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
        <motion.div
          className="customer-club-copy"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75 }}
        >
          <p className="customer-club-kicker">{t.customerClub.kicker}</p>
          <h2 id="customer-club-title" className="customer-club-title">
            {t.customerClub.title}
          </h2>
          <p className="customer-club-lead">{t.customerClub.lead}</p>

          <ul className="customer-club-perks" aria-label={t.customerClub.perksAria}>
            {perks.map((perk, index) => (
              <motion.li
                key={perk.title}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.55 }}
              >
                <span className="customer-club-perk-icon" aria-hidden="true">
                  <perk.Icon strokeWidth={1.5} />
                </span>
                <div>
                  <h3>{perk.title}</h3>
                  <p>{perk.desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="customer-club-form-wrap"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12, duration: 0.75 }}
        >
          {submitted ? (
            <div className="customer-club-success" role="status">
              <Sparkles className="customer-club-success-icon" strokeWidth={1.5} aria-hidden="true" />
              <h3>{t.customerClub.successTitle}</h3>
              <p>{t.customerClub.successMessage}</p>
            </div>
          ) : (
            <form className="customer-club-form" action={handleSubmit} noValidate>
              <div className="customer-club-form-grid">
                <label className="customer-club-field customer-club-field--full">
                  <span>{t.customerClub.fields.fullName}</span>
                  <input
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    disabled={isPending}
                  />
                </label>

                <label className="customer-club-field">
                  <span>{t.customerClub.fields.phone}</span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    disabled={isPending}
                  />
                </label>

                <label className="customer-club-field">
                  <span>{t.customerClub.fields.email}</span>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    disabled={isPending}
                  />
                </label>

                <label className="customer-club-field customer-club-field--full">
                  <span>{t.customerClub.fields.birthDate}</span>
                  <input name="birthDate" type="date" disabled={isPending} />
                </label>
              </div>

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

              <button
                className="menu-showcase-button customer-club-submit"
                type="submit"
                disabled={isPending}
              >
                {isPending ? t.customerClub.submitting : t.customerClub.submit}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
