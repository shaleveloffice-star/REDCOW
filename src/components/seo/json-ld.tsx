import { serializeJsonLd, type JsonLdObject } from "@/lib/seo/json-ld";

type JsonLdProps = {
  data: JsonLdObject | JsonLdObject[];
};

/** Injects a single JSON-LD script tag. Safe for XSS via serializeJsonLd. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
