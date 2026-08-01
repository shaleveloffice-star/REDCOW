import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SeoContentBody } from "@/components/shared/seo-content-body";
import { getCachedResolvedSeoPageContent } from "@/lib/cache/cached-data";
import { getServerLocale } from "@/i18n/get-locale";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "תקנון אתר ותנאי שימוש | NB BURGER",
  description: "תקנון האתר ותנאי השימוש של NB BURGER.",
  path: "/terms"
});

type TermsBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

type TermsSection = {
  title: string;
  blocks: TermsBlock[];
};

const introParagraphs = [
  'ברוכים הבאים לאתר NB BURGER (להלן: "האתר").',
  "השימוש באתר, לרבות גלישה, ביצוע הזמנה, יצירת קשר, הרשמה למועדון לקוחות, השארת פרטים או שימוש בכל שירות המוצע באתר, מהווה אישור והסכמה מלאה לתנאי תקנון זה ולמדיניות הפרטיות של האתר.",
  "אם אינך מסכים לתנאי התקנון, הינך מתבקש להימנע משימוש באתר."
];

const termsSections: TermsSection[] = [
  {
    title: "1. כללי",
    blocks: [
      {
        type: "paragraph",
        text: "האתר מופעל ומנוהל על ידי NB BURGER ומשמש להצגת מידע, תפריטים, מוצרים, שירותים, הזמנות, מבצעים, תוכן שיווקי, יצירת קשר ושירותים נוספים."
      },
      {
        type: "paragraph",
        text: "NB BURGER רשאית לעדכן, לשנות, למחוק או להוסיף הוראות לתקנון זה בכל עת וללא הודעה מוקדמת. הנוסח המעודכן שיפורסם באתר יהיה הנוסח המחייב."
      },
      {
        type: "paragraph",
        text: "השימוש באתר מותר למטרות חוקיות בלבד ובהתאם להוראות תקנון זה."
      }
    ]
  },
  {
    title: "2. שימוש באתר",
    blocks: [
      { type: "paragraph", text: "המשתמש מתחייב להשתמש באתר בהתאם להוראות החוק בלבד." },
      { type: "paragraph", text: "חל איסור לבצע באתר, בין היתר:" },
      {
        type: "list",
        items: [
          "שימוש בלתי חוקי.",
          "ניסיון חדירה למערכות האתר.",
          "שיבוש פעילות האתר.",
          "הפעלת רובוטים, תוכנות אוטומטיות או כלי סריקה.",
          "העתקה, שכפול, הפצה או פרסום של תכני האתר ללא אישור מראש ובכתב.",
          "התחזות לאחר.",
          "מסירת מידע כוזב.",
          "כל פעולה העלולה לגרום נזק לאתר, לבעליו או למשתמשים אחרים."
        ]
      },
      {
        type: "paragraph",
        text: "NB BURGER רשאית למנוע גישה לאתר מכל משתמש אשר הפר הוראה מהוראות תקנון זה או פעל בניגוד לדין."
      }
    ]
  },
  {
    title: "3. מידע באתר",
    blocks: [
      { type: "paragraph", text: "הנהלת האתר עושה מאמץ להציג מידע מדויק, שלם ועדכני." },
      {
        type: "paragraph",
        text: "עם זאת, ייתכנו טעויות סופר, טעויות הקלדה, אי־דיוקים, השמטות או שינויים."
      },
      { type: "paragraph", text: "התמונות באתר מיועדות להמחשה בלבד." },
      { type: "paragraph", text: "ייתכנו הבדלים בין התמונות לבין המוצר בפועל." },
      {
        type: "paragraph",
        text: "במקרה של טעות ברורה במחיר, בתיאור מוצר או בכל פרט אחר, NB BURGER תהיה רשאית לתקן את הטעות או לבטל את ההזמנה בהתאם להוראות הדין."
      }
    ]
  },
  {
    title: "4. הזמנות ותשלומים",
    blocks: [
      {
        type: "paragraph",
        text: 'המחירים באתר מוצגים בשקלים חדשים וכוללים מע"מ כחוק, אלא אם צוין אחרת.'
      },
      { type: "paragraph", text: "NB BURGER רשאית לעדכן בכל עת:" },
      {
        type: "list",
        items: ["מחירים", "מבצעים", "תפריטים", "מוצרים", "תוספות", "זמינות מוצרים"]
      },
      { type: "paragraph", text: "שליחת הזמנה באתר אינה מהווה אישור סופי לביצועה." },
      {
        type: "paragraph",
        text: "הזמנה תיחשב מאושרת רק לאחר קליטתה ואישורה על ידי מערכות העסק ובהתאם לזמינות המוצרים."
      },
      { type: "paragraph", text: "NB BURGER רשאית שלא לאשר הזמנה במקרים של:" },
      {
        type: "list",
        items: [
          "חוסר מלאי.",
          "טעות במחיר.",
          "חשש להונאה.",
          "תקלה טכנית.",
          "מסירת פרטים שגויים.",
          "כל סיבה אחרת המותרת על פי דין."
        ]
      }
    ]
  },
  {
    title: "5. משלוחים ואיסוף",
    blocks: [
      { type: "paragraph", text: "זמני המשלוח המוצגים באתר הינם הערכה בלבד." },
      { type: "paragraph", text: "ייתכנו עיכובים עקב:" },
      {
        type: "list",
        items: [
          "עומסים.",
          "מזג אוויר.",
          "מצב ביטחוני.",
          "אירועי כוח עליון.",
          "תקלות טכניות.",
          "אזורי חלוקה.",
          "עומסי תנועה."
        ]
      },
      { type: "paragraph", text: "על הלקוח למסור כתובת מלאה ונכונה." },
      {
        type: "paragraph",
        text: "NB BURGER לא תהיה אחראית לעיכובים או לאי אספקת ההזמנה עקב מסירת פרטים שגויים."
      }
    ]
  },
  {
    title: "6. ביטולים והחזרים",
    blocks: [
      {
        type: "paragraph",
        text: "לאחר שהחלה הכנת ההזמנה לא ניתן לבטלה, בכפוף להוראות חוק הגנת הצרכן."
      },
      {
        type: "paragraph",
        text: "בכל מקרה של בעיה חריגה ניתן לפנות לשירות הלקוחות והנושא ייבחן בהתאם להוראות הדין."
      },
      {
        type: "paragraph",
        text: "אין באמור בתקנון זה כדי לגרוע מזכויות הצרכן לפי כל דין."
      }
    ]
  },
  {
    title: "7. קניין רוחני",
    blocks: [
      {
        type: "paragraph",
        text: "כל זכויות הקניין הרוחני באתר שייכות ל-NB BURGER בלבד."
      },
      { type: "paragraph", text: "לרבות:" },
      {
        type: "list",
        items: [
          "לוגו",
          "סימני מסחר",
          "תמונות",
          "סרטונים",
          "עיצוב האתר",
          "קוד האתר",
          "טקסטים",
          "גרפיקה",
          "אייקונים",
          "מסמכים",
          "קבצים"
        ]
      },
      {
        type: "paragraph",
        text: "אין להעתיק, להפיץ, לפרסם, לשכפל, לבצע הנדסה לאחור או לעשות כל שימוש מסחרי ללא אישור מראש ובכתב."
      }
    ]
  },
  {
    title: "8. פרטיות ואבטחת מידע",
    blocks: [
      {
        type: "paragraph",
        text: "NB BURGER פועלת בהתאם להוראות הדין בישראל בנושא הגנת הפרטיות."
      },
      { type: "paragraph", text: "האתר עשוי לאסוף מידע כגון:" },
      {
        type: "list",
        items: [
          "שם",
          "טלפון",
          "כתובת",
          'כתובת דוא"ל',
          "פרטי הזמנה",
          "כתובת IP",
          "Cookies",
          "סוג הדפדפן",
          "נתוני שימוש",
          "מידע סטטיסטי"
        ]
      },
      { type: "paragraph", text: "המידע נאסף לצורך:" },
      {
        type: "list",
        items: [
          "תפעול האתר.",
          "ביצוע הזמנות.",
          "שירות לקוחות.",
          "שיפור השירות.",
          "אבטחת מידע.",
          "מניעת הונאות.",
          "דיוור ושיווק בכפוף להסכמת המשתמש ולהוראות הדין."
        ]
      },
      {
        type: "paragraph",
        text: "NB BURGER נוקטת באמצעי אבטחת מידע מקובלים וסבירים, אולם אינה יכולה להבטיח חסינות מוחלטת מפני חדירה בלתי מורשית למערכותיה."
      }
    ]
  },
  {
    title: "9. Cookies",
    blocks: [
      { type: "paragraph", text: "האתר משתמש בקובצי Cookies לצורך:" },
      {
        type: "list",
        items: [
          "תפעול האתר.",
          "אבטחה.",
          "מדידת ביצועים.",
          "התאמת חוויית המשתמש.",
          "ניתוח סטטיסטי.",
          "התאמת פרסום."
        ]
      },
      {
        type: "paragraph",
        text: "המשתמש רשאי לחסום Cookies באמצעות הגדרות הדפדפן, אולם ייתכן שחלק מהשירותים באתר לא יפעלו באופן תקין."
      }
    ]
  },
  {
    title: "10. מערכות צד שלישי",
    blocks: [
      { type: "paragraph", text: "האתר עשוי להשתמש בשירותי צד שלישי, לרבות:" },
      {
        type: "list",
        items: [
          "Google Analytics",
          "Google Tag Manager",
          "Meta Pixel",
          "Google Ads",
          "מערכות דיוור",
          "מערכות סליקה",
          "מערכות אבטחה",
          "מערכות אנליטיקה"
        ]
      },
      {
        type: "paragraph",
        text: "השימוש במערכות אלו כפוף גם למדיניות הפרטיות של אותן חברות."
      }
    ]
  },
  {
    title: "11. דיוור והודעות שיווקיות",
    blocks: [
      { type: "paragraph", text: "השארת פרטים באתר עשויה לאפשר שליחת:" },
      {
        type: "list",
        items: ["מבצעים", "קופונים", "עדכונים", "חדשות", "תוכן שיווקי"]
      },
      {
        type: "paragraph",
        text: "המשתמש רשאי להסיר עצמו מרשימת הדיוור בכל עת בהתאם להוראות הדין."
      }
    ]
  },
  {
    title: "12. אחריות המשתמש",
    blocks: [
      { type: "paragraph", text: "המשתמש אחראי למסור מידע מלא, נכון ומדויק." },
      {
        type: "paragraph",
        text: "NB BURGER לא תהיה אחראית לכל נזק, עיכוב או אי אספקת שירות הנובעים ממידע שגוי שנמסר על ידי המשתמש."
      }
    ]
  },
  {
    title: "13. זמינות האתר",
    blocks: [
      { type: "paragraph", text: "NB BURGER אינה מתחייבת שהאתר יהיה זמין באופן רציף." },
      { type: "paragraph", text: "ייתכנו הפסקות עקב:" },
      {
        type: "list",
        items: [
          "תחזוקה.",
          "עדכונים.",
          "תקלות.",
          "עומסי שרתים.",
          "אירועי סייבר.",
          "תקלות תקשורת.",
          "נסיבות שאינן בשליטת העסק."
        ]
      }
    ]
  },
  {
    title: "14. כוח עליון",
    blocks: [
      {
        type: "paragraph",
        text: "NB BURGER לא תהיה אחראית לעיכוב או לאי מתן שירות הנובע ממלחמה, מבצע צבאי, מצב חירום, כוח עליון, שביתה, מגפה, אסון טבע, הפסקת חשמל, תקלות אינטרנט, החלטות רשויות או כל נסיבה שאינה בשליטתה."
      }
    ]
  },
  {
    title: "15. קישורים חיצוניים",
    blocks: [
      {
        type: "paragraph",
        text: "ייתכן שהאתר יכלול קישורים לאתרי אינטרנט של צדדים שלישיים."
      },
      {
        type: "paragraph",
        text: "NB BURGER אינה אחראית לתוכן, למידע, לשירותים או למדיניות הפרטיות של אותם אתרים."
      }
    ]
  },
  {
    title: "16. הגבלת אחריות",
    blocks: [
      {
        type: "paragraph",
        text: "NB BURGER עושה מאמצים לספק שירות איכותי ומידע מדויק, אולם אינה מתחייבת כי האתר יהיה נקי מתקלות או שגיאות."
      },
      {
        type: "paragraph",
        text: "ככל שהדבר מותר על פי דין, אחריותה של NB BURGER תהיה מוגבלת לאחריות הקבועה בדין בלבד."
      },
      {
        type: "paragraph",
        text: "אין באמור בתקנון זה כדי לגרוע מזכויות צרכניות שלא ניתן להתנות עליהן לפי החוק."
      }
    ]
  },
  {
    title: "17. שמירת זכויות",
    blocks: [
      {
        type: "paragraph",
        text: "אי־מימוש או עיכוב במימוש זכות כלשהי של NB BURGER לפי תקנון זה או לפי הדין, לא ייחשבו כוויתור על אותה זכות או על כל זכות אחרת."
      }
    ]
  },
  {
    title: "18. הפרדת סעיפים",
    blocks: [
      {
        type: "paragraph",
        text: "אם יקבע בית משפט מוסמך כי הוראה כלשהי בתקנון זה אינה תקפה, בטלה או אינה ניתנת לאכיפה, לא יהיה בכך כדי לפגוע בתוקפם של יתר סעיפי התקנון, אשר ימשיכו לעמוד בתוקפם המלא."
      }
    ]
  },
  {
    title: "19. סמכות שיפוט",
    blocks: [
      { type: "paragraph", text: "על תקנון זה יחולו דיני מדינת ישראל בלבד." },
      {
        type: "paragraph",
        text: "כל מחלוקת או סכסוך הנוגעים לשימוש באתר או לשירותים המוצעים בו יתבררו בפני בית המשפט המוסמך בישראל, בהתאם להוראות הדין."
      }
    ]
  },
  {
    title: "20. יצירת קשר",
    blocks: [
      { type: "paragraph", text: "NB BURGER" },
      {
        type: "list",
        items: [
          "📍 כתובת: אחוזה 96, רעננה, ישראל",
          '📧 דוא"ל: official.nbburger@gmail.com'
        ]
      }
    ]
  }
];

export default async function TermsPage() {
  const locale = await getServerLocale();
  const seoContent = await getCachedResolvedSeoPageContent(locale, "terms");

  return (
    <>
      <main id="main-content" className="legal-page">
        <article className="legal-document">
          <p className="legal-kicker">עודכן לאחרונה: 22/07/2026</p>
          <h1>תקנון אתר ותנאי שימוש – NB BURGER</h1>

          <SeoContentBody text={seoContent.introduction} className="legal-seo-intro" />

          <section>
            {introParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          {termsSections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.blocks.map((block, index) =>
                block.type === "paragraph" ? (
                  <p key={`${section.title}-paragraph-${index}`}>{block.text}</p>
                ) : (
                  <ul key={`${section.title}-list-${index}`}>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )
              )}
            </section>
          ))}

          <p className="legal-related">
            לפרטים נוספים על איסוף ושימוש במידע אישי, ראו גם{" "}
            <a href="/privacy-policy">מדיניות הפרטיות</a>.
          </p>

          <SeoContentBody text={seoContent.bottomContent} className="legal-seo-bottom" />
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
