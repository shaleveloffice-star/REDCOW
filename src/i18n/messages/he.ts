import { BUSINESS } from "@/data/business";
import type { Messages } from "./types";

export const he: Messages = {
  a11y: {
    skipToMain: "דלג לתוכן הראשי"
  },
  lang: {
    label: "שפה",
    switchTo: "החלף שפה"
  },
  nav: {
    main: "ניווט ראשי",
    menuDialog: "תפריט ניווט",
    openMenu: "פתח תפריט ניווט",
    closeMenu: "סגור תפריט ניווט",
    home: "דף הבית",
    menu: "התפריט",
    plancha: "על הפלנצ׳ה",
    atmosphere: "האווירה",
    club: "מועדון לקוחות",
    location: "מיקום ושעות",
    about: "אודות",
    branches: "סניפים"
  },
  hero: {
    tagline: "פשוט המבורגר טוב.",
    menuCta: "לתפריט",
    orderCta: "להזמנה",
    scroll: "גלול",
    scrollAria: "גלול למטה"
  },
  menuShowcase: {
    title: "התפריט",
    lead: "הסטנדרט הגבוה של NB BURGER.",
    trackAria: "מנות מהתפריט",
    bestSeller: "הכי נמכר",
    fullMenu: "לתפריט המלא",
    prev: "מנות קודמות",
    next: "מנות הבאות"
  },
  plancha: {
    title: "על הפלנצ׳ה",
    lead: "הבשר מגיע טרי, ניטחן במקום ועולה ישר לאש.",
    listAria: "שלבי הכנת הבורגר על הפלנצ׳ה",
    steps: [
      {
        title: "הבשר",
        desc: "בשר שנטחן במקום, מתובל בעדינות ונכנס לפלנצ׳ה כשהוא טרי ומדויק."
      },
      {
        title: "הצריבה",
        desc: "חום גבוה, צריבה חזקה וקראסט שנותן לביס את האופי שלו."
      },
      {
        title: "הביס",
        desc: "לחמנייה רכה, ירקות טריים ורוטב שמחבר הכול בלי להשתלט."
      }
    ]
  },
  atmosphere: {
    title: "האווירה",
    leadLine1: "אוכל טוב, מוזיקה ברקע",
    leadLine2: "ואנשים שכיף לשבת איתם.",
    introTitle: "אמנות בין שתי לחמניות.",
    introLead: "קציצת פרימיום מנתחים מובחרים, שנטחנת במקום בכל יום.",
    droneAlt: "צילום מהרחפן",
    burgerStackAlt: "מבורגר מפורק",
    bottomAlt: "לחמנייה תחתונה"
  },
  customerClub: {
    kicker: "NB Club",
    title: "מועדון הלקוחות",
    titlePrimary: "מועדון",
    titleAccent: "הלקוחות",
    leadBefore: "הצטרפו למועדון ותקבלו ",
    leadHighlight: "הטבות, עדכונים והפתעות",
    leadAfter: " לפני כולם.",
    cardAlt: "כרטיס חבר NB Club",
    burgerAlt: "המבורגר NB",
    formHint: "הרשמה תוך 10 שניות בלבד",
    socialProof: "כבר יותר מ-2,300 חברי מועדון נהנים",
    trustSafe: "המידע שלך בטוח איתנו",
    trustTerms: "ללא עלות | ללא התחייבות | אפשר לבטל בכל רגע",
    perksAria: "יתרונות המועדון",
    perks: [
      {
        title: "מתנה ליום ההולדת",
        desc: "הפתעה מתוקה מהמטבח שלנו, בדיוק ביום שלכם."
      },
      {
        title: "חדש לפני כולם",
        desc: "גישה מוקדמת למנות חדשות וקמפיינים מיוחדים."
      },
      {
        title: "הטבות בלעדיות",
        desc: "מבצעים ועדכונים שמגיעים ישר אליכם — בלי ספאם."
      }
    ],
    fields: {
      fullName: "שם מלא",
      phone: "טלפון",
      email: "אימייל (אופציונלי)",
      birthDate: "תאריך לידה"
    },
    consentPrefix: "אני מאשר/ת קבלת עדכונים והטבות מהמועדון, בהתאם ל",
    privacyLink: "מדיניות הפרטיות",
    submit: "קבלו את ההטבות שלי",
    submitting: "שולחים...",
    successTitle: "ברוכים הבאים למועדון!",
    successMessage: "קיבלנו את ההרשמה שלכם. נשלח אליכם עדכון ברגע שהכל מוכן.",
    errors: {
      fullName: "נא למלא שם מלא.",
      phone: "נא למלא מספר טלפון.",
      email: "נא למלא כתובת אימייל תקינה, אם הוזנה.",
      consent: "יש לאשר את תנאי ההצטרפות למועדון.",
      generic: "משהו השתבש. נסו שוב בעוד רגע."
    },
    datePicker: {
      year: "שנה",
      month: "חודש",
      day: "יום",
      yearPlaceholder: "בחרו שנה",
      monthPlaceholder: "בחרו חודש",
      dayPlaceholder: "בחרו יום",
      prevMonth: "חודש קודם",
      nextMonth: "חודש הבא",
      pickYear: "בחירת שנה",
      pickMonth: "בחירת חודש"
    }
  },
  location: {
    title: "מיקום ושעות",
    locationHeading: "מיקום",
    address: BUSINESS.address.formatted.he,
    parking: "חניה חופשית בשפע",
    hoursHeading: "שעות פתיחה",
    days: {
      sunThu: "ראשון - חמישי",
      fri: "שישי",
      sat: "שבת"
    },
    hours: {
      sunThu: BUSINESS.displayHours.weekday,
      sat: BUSINESS.displayHours.saturday
    },
    navigate: "נווטו אלינו",
    imageAlt: "חזית המסעדה"
  },
  footer: {
    taglineLine1: "בשר שנטחן במקום,",
    taglineLine2: "פלנצ׳ה לוהטת נביס שנבנה נכון.",
    contact: "צרו קשר",
    followUs: "עקבו אחרינו",
    mapAria: "מיקום במפה",
    nav: "ניווט",
    menu: "תפריט",
    fullMenu: "לתפריט המלא",
    copyright: "© 2026 NB BURGER - כל הזכויות שמורות",
    privacy: "מדיניות פרטיות",
    terms: "תקנון האתר",
    closing: "לכל אירוע, בכל שעה. ביס אחד שלא תשכחו."
  },
  shortTour: {
    trigger: "סיור קצר",
    triggerAria: "התחל סיור קצר באתר",
    dialogAria: "סיור קצר באתר",
    skip: "דלג על הסיור",
    steps: ["ברוכים הבאים", "התפריט שלנו", "האווירה כאן", "על הפלנצ׳ה", "מצאו אותנו", "להזמין עכשיו"]
  }
};
