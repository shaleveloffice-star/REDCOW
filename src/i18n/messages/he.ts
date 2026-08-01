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
  openingBanner: {
    message: "בקרוב הפתיחה"
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
    captionKicker: "מגדירים מחדש את חוויית ההמבורגר",
    captionTitle: "NB BURGER",
    menuCta: "לתפריט",
    orderCta: "להזמנה",
    scroll: "גלול",
    scrollAria: "גלול למטה",
    srTitle: `המבורגר כשר ב${BUSINESS.address.addressLocality}`
  },
  orderModal: {
    title: "בחרו אופן הזמנה",
    close: "סגור",
    pickup: "איסוף עצמי",
    delivery: "משלוח"
  },
  menuPage: {
    title: "תפריט המבורגרים ברעננה",
    categoryItemsHeading: "מנות בקטגוריה",
    filterAll: "הכל",
    empty: "אין מנות להצגה כרגע.",
    viewLocations: "הסניפים שלנו",
    heroAlt: "מנות מתוך תפריט NB BURGER",
    relatedCategories: "קטגוריות נוספות"
  },
  menuItemDetail: {
    orderNow: "להזמנה",
    galleryAria: "תמונות המנה",
    closeUpAlt: "מקרוב",
    backToMenu: "חזרה לתפריט",
    longSectionTitle: "על המנה",
    longSectionAria: "תיאור מורחב",
    allergyGuide: "מדריך אלרגנים"
  },
  aboutPage: {
    title: "אודות NB BURGER"
  },
  locations: {
    pageTitle: "מיקום ושעות — NB BURGER רעננה",
    findLocal: "מצא סניף",
    ourLocations: "הסניפים שלנו",
    mapTitle: "מפת סניפי NB BURGER",
    mapSummary: "מפת סניפי NB BURGER — רעננה, אחוזה 96",
    navigate: "ניווט",
    deliveryZonesTitle: "מיקומי משלוחים",
    deliveryZones: ["הוד השרון", "כפר סבא", "רעננה"],
    backHome: "חזרה לדף הבית"
  },
  menuShowcase: {
    title: "התפריט שלנו",
    lead: "המבורגרים, צ'יפס, נאגטס ועוד!",
    trackAria: "מנות מהתפריט",
    bestSeller: "הכי נמכר",
    fullMenu: "לתפריט המלא",
    prev: "מנות קודמות",
    next: "מנות הבאות"
  },
  homeStory: {
    imageAlt: "המבורגר NB BURGER"
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
    kicker: "NB CLUB",
    title: "מועדון הלקוחות",
    titlePrimary: "מועדון",
    titleAccent: "הלקוחות",
    lead: "הטבות בלעדיות, מבצעים מיוחדים וחוויית המבורגר ברמה אחרת",
    leadBefore: "",
    leadHighlight: "",
    leadAfter: "",
    cardAlt: "כרטיס חבר NB Club",
    burgerAlt: "המבורגר NB",
    formTitle: "הצטרפו עכשיו",
    formSubtitle: "ומקבלים עולם של הטבות",
    formHint: "הרשמה מהירה",
    socialProof: "2,300+ חברים",
    trustSafe: "המידע שלך נשאר אצלנו",
    trustTerms: "בלי עלות · בלי התחייבות",
    barBrandSub: "REAL BURGERS. REAL PEOPLE.",
    barSlogan: "NB CLUB — MORE THAN A BURGER",
    perksAria: "יתרונות המועדון",
    features: [
      { title: "מבצעים בלעדיים" },
      { title: "הטבות אישיות" },
      { title: "מתנה ביום ההולדת" }
    ],
    perks: [
      { title: "יום הולדת", desc: "" },
      { title: "חדשות", desc: "" },
      { title: "הטבות", desc: "" }
    ],
    formPerks: [
      { title: "חברים בלבד", desc: "הטבות בלעדיות" },
      { title: "מבצעים מיוחדים", desc: "הנחות שוות" },
      { title: "חוויה אחרת", desc: "אוכל ברמה גבוהה" }
    ],
    fields: {
      fullName: "שם מלא",
      phone: "טלפון",
      email: "אימייל (אופציונלי)",
      birthDate: "תאריך לידה"
    },
    consentPrefix: "מאשר/ת קבלת עדכונים ומתנות",
    privacyLink: "פרטיות",
    submit: "להצטרפות",
    submitting: "שולחים...",
    successTitle: "נרשמתם!",
    successMessage: "נחזור אליכם בקרוב.",
    errors: {
      fullName: "נא למלא שם מלא.",
      phone: "נא למלא מספר טלפון.",
      email: "נא למלא כתובת אימייל תקינה, אם הוזנה.",
      consent: "יש לאשר את תנאי ההצטרפות.",
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
    imageAlt: "חזית המסעדה",
    businessType: BUSINESS.businessTypeHe,
    kosher: BUSINESS.kosherHe
  },
  notFound: {
    title: "העמוד לא נמצא",
    description: "ייתכן שהכתובת השתנתה או שהקישור אינו תקין.",
    backHome: "חזרה לדף הבית"
  },
  contactForm: {
    title: "שלחו לנו הודעה",
    lead: "נשמח לעזור — השאירו פרטים ונחזור אליכם.",
    fullName: "שם מלא",
    phone: "טלפון",
    email: "אימייל (אופציונלי)",
    message: "הודעה",
    submit: "שליחה",
    submitting: "שולחים...",
    successTitle: "ההודעה נשלחה",
    successMessage: "קיבלנו את הפנייה ונחזור אליכם בהקדם.",
    errors: {
      fullName: "נא למלא שם מלא.",
      phone: "נא למלא מספר טלפון.",
      email: "נא למלא כתובת אימייל תקינה, אם הוזנה.",
      message: "נא לכתוב הודעה.",
      generic: "משהו השתבש. נסו שוב בעוד רגע."
    }
  },
  legal: {
    hebrewOnlyNotice: ""
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
  }
};
