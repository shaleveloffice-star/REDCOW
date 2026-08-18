import { BUSINESS } from "@/data/business";
import type { LegalDocument } from "@/i18n/legal/types";

const ACCESSIBILITY_EMAIL = BUSINESS.email;

export function getAccessibilityContentHe(): LegalDocument {
  return {
    lastUpdated: "תאריך עדכון אחרון: 18 באוגוסט 2026",
    title: "הצהרת נגישות - NB BURGER",
    metaTitle: "הצהרת נגישות | NB BURGER",
    metaDescription:
      "הצהרת הנגישות של NB BURGER: התאמות שבוצעו באתר, הסדרי הנגישות בסניף באחוזה 96 ברעננה, ופניות בנושא נגישות.",
    introTitle: "מחויבות לנגישות",
    introBlocks: [
      {
        type: "paragraph",
        text: "NB BURGER מחויבת לאפשר שימוש נוח ונגיש יותר באתר ובסניף, ולשפר את הנגישות באופן מתמשך."
      },
      {
        type: "paragraph",
        text: "הצהרה זו מתארת התאמות שבוצעו באתר ואת הסדרי הנגישות הידועים בסניף. היא אינה מהווה טענה שהאתר נגיש באופן מלא או שעומד במלואו בת\"י 5568 או ב-WCAG."
      }
    ],
    sections: [
      {
        title: "התאמות נגישות באתר",
        blocks: [
          {
            type: "paragraph",
            text: "בוצעו באתר התאמות נגישות טכניות, בין היתר:"
          },
          {
            type: "list",
            items: [
              "כפתור נגישות עם התאמות תצוגה (גודל טקסט, ניגודיות, הדגשת קישורים והפחתת תנועה)",
              "קישור דילוג לתוכן",
              "תמיכה בניווט מקלדת",
              "מצבי מיקוד (focus states)",
              "טקסט חלופי (ALT) לתמונות",
              "תוויות ו-ARIA בטפסים",
              "טיפול נגיש בדיאלוגים",
              "אפשרות לעצירת סרטונים אוטומטיים",
              "התחשבות בהעדפת תנועה מופחתת (prefers-reduced-motion)",
              "הגדרת שפת האתר וכיוון הטקסט (lang ו-dir)",
              "התאמות לתפריט המובייל"
            ]
          }
        ]
      },
      {
        title: "הסדרי נגישות בסניף",
        blocks: [
          {
            type: "paragraph",
            text: "הסניף נמצא בכתובת אחוזה 96, רעננה."
          },
          {
            type: "list",
            items: [
              "קיימות חניות נכים ציבוריות בסביבת הסניף. אין מדובר בחניות פרטיות של NB BURGER.",
              "הכניסה לסניף נגישה לכיסא גלגלים.",
              "קיימת ישיבה נגישה לכיסא גלגלים.",
              "קיים דלפק נגיש.",
              "קיימים שירותי נכים."
            ]
          }
        ]
      },
      {
        title: "פניות בנושא נגישות",
        blocks: [
          {
            type: "paragraph",
            text: "אם נתקלתם בבעיית נגישות באתר או בסניף, נשמח שתפנו אלינו."
          },
          {
            type: "paragraphWithLink",
            before: "דוא\"ל לפניות בנושא נגישות: ",
            href: `mailto:${ACCESSIBILITY_EMAIL}`,
            linkText: ACCESSIBILITY_EMAIL
          },
          {
            type: "paragraph",
            text: "בפנייה, נבקש לציין במידת האפשר מהי הבעיה, באיזה עמוד היא הופיעה, ובאיזה מכשיר ודפדפן נעשה שימוש."
          }
        ]
      },
      {
        title: "תאריך עדכון",
        blocks: [
          {
            type: "paragraph",
            text: "הצהרה זו עודכנה לאחרונה ב-18 באוגוסט 2026."
          }
        ]
      }
    ]
  };
}
