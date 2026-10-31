"use client";

import { useRef, useState, type FormEvent } from "react";
import { submitCareerApplicationAction } from "@/server/actions/careers.actions";
import type { Locale } from "@/i18n/config";
import { IconArrowUpRight } from "@/components/shared/site-icons";
import { CAREERS_COPY } from "./careers-copy";
import styles from "./careers.module.css";

type Field = "fullName" | "phone" | "residenceArea" | "age" | "experience";

export function CareersForm({ locale }: { locale: Locale }) {
  const t = CAREERS_COPY[locale];
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const submitting = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    let invalidField: string | undefined;
    submitting.current = true;
    setPending(true);
    setError("");
    setFieldErrors({});
    try {
      const result = await submitCareerApplicationAction(data);
      if (result.success) {
        form.reset();
        setSent(true);
        requestAnimationFrame(() => successRef.current?.focus());
      } else {
        const fields = result.fieldErrors ?? {};
        setFieldErrors(fields);
        if (!Object.keys(fields).length) setError(t.genericError);
        invalidField = Object.keys(fields)[0];
      }
    } catch {
      setError(t.genericError);
    } finally {
      setPending(false);
      submitting.current = false;
      if (invalidField) {
        requestAnimationFrame(() => form.querySelector<HTMLInputElement>(`[name="${invalidField}"]`)?.focus());
      }
    }
  }

  const feedback = (field: Field) => fieldErrors[field] ? (
    <span className={styles.fieldError} id={`careers-${field}-error`} role="alert">
      {locale === "he" ? fieldErrors[field] : t.fieldError}
    </span>
  ) : null;
  const invalid = (field: Field) => ({
    "aria-invalid": Boolean(fieldErrors[field]),
    "aria-describedby": fieldErrors[field] ? `careers-${field}-error` : undefined
  });

  return <section className={styles.card} aria-labelledby="careers-form-title">
    <span className={styles.formEyebrow}>LET’S WORK TOGETHER</span>
    <h2 id="careers-form-title">{t.title}</h2>
    {sent ? <div className={styles.success} role="status" tabIndex={-1} ref={successRef}>
      <span className={styles.successMark} aria-hidden="true">✓</span>
      <h3>{t.successTitle}</h3><p>{t.success}</p>
    </div> : <>
      <p className={styles.formLead}>{t.lead}</p>
      <form onSubmit={submit} aria-busy={pending}>
        <p className={styles.required}>{t.required}</p>
        <fieldset className={styles.fields} disabled={pending}>
          <legend className="sr-only">{t.title}</legend>
          <label className={styles.field} htmlFor="careers-fullName">{t.fullName}
            <input id="careers-fullName" name="fullName" autoComplete="name" required minLength={2} maxLength={120} {...invalid("fullName")} />
            {feedback("fullName")}
          </label>
          <label className={styles.field} htmlFor="careers-phone">{t.phone}
            <input id="careers-phone" name="phone" type="tel" dir="ltr" autoComplete="tel" required maxLength={40} {...invalid("phone")} />
            {feedback("phone")}
          </label>
          <div className={styles.fieldRow}>
            <label className={styles.field} htmlFor="careers-residenceArea">{t.residenceArea}
              <input id="careers-residenceArea" name="residenceArea" autoComplete="address-level2" required minLength={2} maxLength={120} {...invalid("residenceArea")} />
              {feedback("residenceArea")}
            </label>
            <label className={styles.field} htmlFor="careers-age">{t.age}
              <input id="careers-age" name="age" type="number" inputMode="numeric" min={1} max={120} step={1} required {...invalid("age")} />
              {feedback("age")}
            </label>
          </div>
          <fieldset className={styles.experience} {...invalid("experience")}>
            <legend>{t.experience}</legend>
            <div className={styles.choices}>
              <label><input type="radio" name="experience" value="yes" required /><span>{t.yes}</span></label>
              <label><input type="radio" name="experience" value="no" required /><span>{t.no}</span></label>
            </div>
            {feedback("experience")}
          </fieldset>
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="careers-website">{t.botLabel}</label>
            <input id="careers-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          {error && <p className={styles.formError} role="alert">{error}</p>}
          <button className={styles.submit} type="submit">{pending ? t.sending : t.submit}<span aria-hidden="true"><IconArrowUpRight /></span></button>
        </fieldset>
        <p className={styles.privacy}>{t.privacy} <a href="/privacy-policy">{t.privacyLink}</a></p>
      </form>
    </>}
  </section>;
}
