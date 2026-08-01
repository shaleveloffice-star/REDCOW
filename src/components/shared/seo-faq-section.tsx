"use client";

import { useId, useState } from "react";

import type { SeoFaqBlock, SeoFaqItem } from "@/types/seo-content";

export type SeoFaqContent = Required<SeoFaqBlock> & { items: SeoFaqItem[] };

type SeoFaqSectionProps = {
  faq: SeoFaqContent;
  className?: string;
  titleId?: string;
  defaultOpenIndex?: number | null;
};

export function hasSeoFaqContent(faq: SeoFaqContent): boolean {
  return Boolean(
    faq.kicker.trim() ||
      faq.title.trim() ||
      faq.lead.trim() ||
      faq.items.some((item) => item.question.trim() && item.answer.trim())
  );
}

export function SeoFaqSection({
  faq,
  className = "seo-faq-section",
  titleId,
  defaultOpenIndex = 0
}: SeoFaqSectionProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);
  const items = faq.items.filter((item) => item.question.trim() && item.answer.trim());

  if (!hasSeoFaqContent({ ...faq, items })) {
    return null;
  }

  const headingId = titleId ?? `${baseId}-title`;

  return (
    <section className={className} aria-labelledby={faq.title.trim() ? headingId : undefined}>
      <div className={`${className}-shell`}>
        <header className={`${className}-header`}>
          {faq.kicker.trim() ? <p className={`${className}-kicker`}>{faq.kicker}</p> : null}
          {faq.title.trim() ? (
            <h3 id={headingId} className={`${className}-title`}>
              {faq.title}
            </h3>
          ) : null}
          {faq.lead.trim() ? <p className={`${className}-lead`}>{faq.lead}</p> : null}
        </header>

        {items.length > 0 ? (
          <div className={`${className}-list`}>
            {items.map((item, index) => {
              const isOpen = openIndex === index;
              const panelId = `${baseId}-panel-${index}`;
              const buttonId = `${baseId}-button-${index}`;

              return (
                <div
                  key={`${item.question}-${index}`}
                  className={`${className}-item${isOpen ? " is-open" : ""}`}
                >
                  <h4 className={`${className}-question`}>
                    <button
                      id={buttonId}
                      type="button"
                      className={`${className}-trigger`}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                    >
                      <span>{item.question}</span>
                      <span className={`${className}-icon`} aria-hidden="true">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                  </h4>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`${className}-answer`}
                    hidden={!isOpen}
                  >
                    <p>{item.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
