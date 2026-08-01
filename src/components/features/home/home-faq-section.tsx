"use client";

import { useId, useState } from "react";

import type { ResolvedSeoPageContent } from "@/types/seo-content";

type HomeFaqSectionProps = {
  faq: ResolvedSeoPageContent["faq"];
};

export function HomeFaqSection({ faq }: HomeFaqSectionProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faq.items.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="home-faq-section" aria-labelledby="home-faq-title">
      <div className="home-faq-shell">
        <header className="home-faq-header">
          {faq.kicker ? <p className="home-faq-kicker">{faq.kicker}</p> : null}
          <h2 id="home-faq-title" className="home-faq-title">
            {faq.title}
          </h2>
          {faq.lead ? <p className="home-faq-lead">{faq.lead}</p> : null}
        </header>

        <div className="home-faq-list">
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;

            return (
              <div
                key={item.question}
                className={`home-faq-item${isOpen ? " is-open" : ""}`}
              >
                <h3 className="home-faq-question">
                  <button
                    id={buttonId}
                    type="button"
                    className="home-faq-trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span>{item.question}</span>
                    <span className="home-faq-icon" aria-hidden="true">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="home-faq-answer"
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
