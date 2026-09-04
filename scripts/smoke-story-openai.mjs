/**
 * Live OpenAI Stories generation smoke test (mirrors production Structured Outputs).
 * Requires OPENAI_API_KEY in the environment. Does not publish or save anything.
 *
 *   $env:OPENAI_API_KEY="sk-..."; node scripts/smoke-story-openai.mjs
 */
import OpenAI from "openai";

const MODEL = "gpt-4.1";
const TIMEOUT_MS = 55_000;

const SECTION_TYPES = [
  "split-text-image",
  "split-image-text",
  "full-image",
  "quote",
  "cta",
  "long-content"
];

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "slug",
    "category",
    "subtitle",
    "heroAlt",
    "metaTitle",
    "metaDescription",
    "sections"
  ],
  properties: {
    title: { type: "string" },
    slug: { type: "string" },
    category: { type: "string" },
    subtitle: { type: "string" },
    heroAlt: { type: "string" },
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "type",
          "kicker",
          "title",
          "body",
          "imageAlt",
          "caption",
          "text",
          "attribution",
          "label",
          "href"
        ],
        properties: {
          type: { type: "string", enum: SECTION_TYPES },
          kicker: { type: "string" },
          title: { type: "string" },
          body: { type: "string" },
          imageAlt: { type: "string" },
          caption: { type: "string" },
          text: { type: "string" },
          attribution: { type: "string" },
          label: { type: "string" },
          href: { type: "string" }
        }
      }
    }
  }
};

const BRAND = `אתה כותב תוכן עבור NB BURGER — מסעדת המבורגרים ברעננה.
שפה: עברית טבעית. אופי: צנוע, ענייני, נקי, בטוח — לא מתרברב.
אסור: הכי טוב, מספר 1, המוביל, מושלם, מטורף, אגדי, חוויה בלתי נשכחת, טריקים, מהפכה.
אסור להמציא ביקורות, ציטוטים, עובדות, פרסים, היסטוריה או origin story.
כתבה מגזינית: סגנון מערכתי מבחוץ בלי להתחזות למבקר אמיתי.
short: 3 מקטעי תוכן + CTA אם נדרש.
סוגי section: split-text-image, split-image-text, full-image, quote, cta, long-content בלבד.`;

const FORBIDDEN = [
  "הכי טוב",
  "מספר 1",
  "המוביל",
  "מושלם",
  "מטורף",
  "אגדי",
  "בלתי נשכחת",
  "מהפכה",
  "נולד מתוך אהבה"
];

async function main() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          skipped: true,
          reason: "OPENAI_API_KEY not set in this shell — live test skipped"
        },
        null,
        2
      )
    );
    process.exit(2);
  }

  const client = new OpenAI({ apiKey, timeout: TIMEOUT_MS, maxRetries: 0 });
  const response = await client.responses.create({
    model: MODEL,
    input: [
      { role: "system", content: BRAND },
      {
        role: "user",
        content: [
          "צור טיוטת Story:",
          "primaryKeyword: אוכל ברעננה",
          "secondaryKeywords: מסעדה כשרה ברעננה בשרי | מסעדת בשרים רעננה | מסעדה ברעננה כשרה | מסעדה כשרה ברעננה מומלצת",
          "storyType: magazine (כתבה מגזינית)",
          "angle: מבט ענייני על אוכל ברעננה בהקשר של מסעדת בשרים כשרה",
          "length: short → 3 מקטעי תוכן + CTA",
          "goal: seo",
          "cta: menu (לתפריט)",
          "החזר לפי JSON Schema בלבד."
        ].join("\n")
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "nb_burger_story",
        strict: true,
        schema: SCHEMA
      }
    }
  });

  const text = response.output_text?.trim();
  if (!text) throw new Error("empty output_text");
  const data = JSON.parse(text);

  const required = [
    "title",
    "slug",
    "category",
    "subtitle",
    "heroAlt",
    "metaTitle",
    "metaDescription",
    "sections"
  ];
  for (const key of required) {
    if (key === "sections") {
      if (!Array.isArray(data.sections) || data.sections.length < 3) {
        throw new Error(`sections invalid: ${data.sections?.length}`);
      }
      continue;
    }
    if (!data[key] || typeof data[key] !== "string") throw new Error(`missing ${key}`);
  }

  const types = data.sections.map((s) => s.type);
  const blob = JSON.stringify(data);
  const hits = FORBIDDEN.filter((w) => blob.includes(w));
  const contentSections = data.sections.filter((s) => s.type !== "cta");
  const hasCta = data.sections.some((s) => s.type === "cta");

  const report = {
    ok: hits.length === 0 && contentSections.length === 3 && hasCta,
    model: MODEL,
    title: data.title,
    slug: data.slug,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    sectionTypes: types,
    contentSectionCount: contentSections.length,
    hasCta,
    forbiddenHits: hits,
    published: false,
    saved: false
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exit(1);
}

main().catch((err) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      },
      null,
      2
    )
  );
  process.exit(1);
});
