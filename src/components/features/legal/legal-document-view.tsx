import { SeoContentBody } from "@/components/shared/seo-content-body";
import type { LegalBlock, LegalDocument } from "@/i18n/legal/types";

type LegalDocumentViewProps = {
  document: LegalDocument;
  seoIntroduction?: string;
  seoBottomContent?: string;
};

function renderBlock(block: LegalBlock, key: string) {
  if (block.type === "paragraph") {
    return <p key={key}>{block.text}</p>;
  }

  return (
    <ul key={key}>
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalDocumentView({
  document,
  seoIntroduction,
  seoBottomContent
}: LegalDocumentViewProps) {
  return (
    <article className="legal-document">
      <p className="legal-kicker">{document.lastUpdated}</p>
      <h1>{document.title}</h1>

      {seoIntroduction ? (
        <SeoContentBody text={seoIntroduction} className="legal-seo-intro" />
      ) : null}

      <section>
        {document.introTitle ? <h2>{document.introTitle}</h2> : null}
        {document.introBlocks.map((block, index) =>
          renderBlock(block, `intro-${index}`)
        )}
      </section>

      {document.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.blocks.map((block, index) =>
            renderBlock(block, `${section.title}-${index}`)
          )}
        </section>
      ))}

      {document.relatedLink ? (
        <p className="legal-related">
          {document.relatedLink.prefix}{" "}
          <a href={document.relatedLink.href}>{document.relatedLink.linkText}</a>.
        </p>
      ) : null}

      {seoBottomContent ? (
        <SeoContentBody text={seoBottomContent} className="legal-seo-bottom" />
      ) : null}
    </article>
  );
}
