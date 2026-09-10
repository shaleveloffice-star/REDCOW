"use client";

import { useId, useState } from "react";

import { getValidFaqItems, hasValidFaqItems, type SeoFaqContent } from "@/lib/seo/faq-utils";

export type { SeoFaqContent };

type HeadingLevel = "h2" | "h3" | "h4";

type SeoFaqSectionProps = {
  faq: SeoFaqContent;
  className?: string;
  sectionId?: string;
  titleId?: string;
  titleLevel?: HeadingLevel;
  questionLevel?: HeadingLevel;
  defaultOpenIndex?: number | null;
};

/** @deprecated Prefer hasValidFaqItems — FAQ requires at least one complete Q&A pair. */
export function hasSeoFaqContent(faq: SeoFaqContent): boolean {
  return hasValidFaqItems(faq);
}

export function SeoFaqSection({
  faq,
  className = "site-faq",
  sectionId,
  titleId,
  titleLevel = "h2",
  questionLevel = "h3",
  defaultOpenIndex = 0
}: SeoFaqSectionProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);
  const items = getValidFaqItems(faq.items);

  if (!hasValidFaqItems(faq)) {
    return null;
  }

  const headingId = titleId ?? `${baseId}-title`;
  const TitleTag = titleLevel;
  const QuestionTag = questionLevel;
  // BEM block only — modifiers like "site-faq--nested" must not prefix child classes.
  const blockClass = className.trim().split(/\s+/).find(Boolean) || "site-faq";

  return (
    <section
      id={sectionId}
      className={className}
      aria-labelledby={faq.title.trim() ? headingId : undefined}
    >
      <div className={`${blockClass}-shell`}>
        <header className={`${blockClass}-header`}>
          {faq.kicker.trim() ? <p className={`${blockClass}-kicker`}>{faq.kicker}</p> : null}
          {faq.title.trim() ? (
            <TitleTag id={headingId} className={`${blockClass}-title`}>
              {faq.title}
            </TitleTag>
          ) : null}
          {faq.lead.trim() ? <p className={`${blockClass}-lead`}>{faq.lead}</p> : null}
        </header>

        <div className={`${blockClass}-list`}>
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;

            return (
              <div
                key={`${item.question}-${index}`}
                className={`${blockClass}-item${isOpen ? " is-open" : ""}`}
              >
                <QuestionTag className={`${blockClass}-question`}>
                  <button
                    id={buttonId}
                    type="button"
                    className={`${blockClass}-trigger`}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span>{item.question}</span>
                    <span className={`${blockClass}-icon`} aria-hidden="true">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </QuestionTag>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`${blockClass}-answer`}
                  hidden={!isOpen}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
