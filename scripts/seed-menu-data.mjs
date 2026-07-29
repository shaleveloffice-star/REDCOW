/**
 * NB BURGER full menu seed — categories + items.
 * Used by scripts/seed-menu.mjs (local JSON + optional Firestore).
 */

const NOW = new Date().toISOString();

/** @type {import('../src/types/content.js').MenuCategory[]} */
export const MENU_CATEGORIES = [
  {
    id: "cat-burgers",
    name: "המבורגרים",
    slug: "burgers",
    description: "המבורגרים על הפלנצ׳ה — הבשר, הצריבה והביס.",
    sortOrder: 1,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "cat-meals",
    name: "ארוחות",
    slug: "meals",
    description: "ארוחות מלאות עם תוספת ושתייה.",
    sortOrder: 2,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "cat-sides",
    name: "תוספות",
    slug: "sides",
    description: "תוספות ליד המנה או להמבורגר.",
    sortOrder: 3,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "cat-salads",
    name: "סלטים",
    slug: "salads",
    description: "סלטים טריים מהמטבח.",
    sortOrder: 4,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "cat-sauces",
    name: "רטבים",
    slug: "sauces",
    description: "רטבים ביתיים לבחירה.",
    sortOrder: 5,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "cat-soft-drinks",
    name: "שתייה קלה",
    slug: "soft-drinks",
    description: "שתייה קלה וקלה.",
    sortOrder: 6,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW
  },
  {
    id: "cat-beers",
    name: "בירות",
    slug: "beers",
    description: "בירות בקבוק.",
    sortOrder: 7,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW
  }
];

/**
 * @param {object} row
 * @returns {import('../src/types/content.js').MenuItem}
 */
function item(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    longDescription: row.longDescription,
    price: row.price,
    categoryId: row.categoryId,
    imageUrl: "",
    closeUpImageUrl: "",
    slug: row.slug,
    imageAlt: "",
    primaryKeyword: row.primaryKeyword,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    isActive: true,
    tags: row.tags ?? [],
    sortOrder: row.sortOrder,
    createdAt: NOW,
    updatedAt: NOW
  };
}

/** @type {import('../src/types/content.js').MenuItem[]} */
export const MENU_ITEMS = [
  // ── המבורגרים ──
  item({
    id: "item-nb-burger-klasi",
    categoryId: "cat-burgers",
    sortOrder: 1,
    name: "המבורגר NB קלאסי",
    slug: "nb-burger-klasi",
    price: 58,
    description: "קציצת בקר על הפלנצ׳ה, חסה, עגבנייה, בצל סגול ורוטב הבית.",
    longDescription:
      "הקלאסיקה של NB BURGER ברעננה — בשר טרי שנטחן במקום, נצרב על הפלנצ׳ה לקבלת קראסט מושלם, ומוגש בלחמנייה רכה עם ירקות טריים ורוטב הבית. מסעדת המבורגרים כשרה ברחוב אחוזה 96.",
    primaryKeyword: "המבורגר NB קלאסי רעננה",
    metaTitle: "המבורגר NB קלאסי | NB BURGER רעננה",
    metaDescription:
      "המבורגר NB קלאסי ברעננה — קציצת בקר על הפלנצ׳ה, ירקות טריים ורוטב הבית. NB BURGER, מסעדת המבורגרים הכשרה באחוזה 96.",
    tags: ["המבורגר", "בקר", "מומלץ"]
  }),
  item({
    id: "item-nb-burger-kamhin",
    categoryId: "cat-burgers",
    sortOrder: 2,
    name: "המבורגר NB כמהין",
    slug: "nb-burger-kamhin",
    price: 64,
    description: "קציצת בקר, איולי כמהין, חסה, עגבנייה, בצל סגול וגבינה.",
    longDescription:
      "המבורגר NB כמהין משלב בשר עסיסי על הפלנצ׳ה עם איולי כמהין עשיר, גבינה נמסה וירקות טריים. חוויית המבורגר פרימיום ברעננה — NB BURGER, מסעדת המבורגרים הכשרה.",
    primaryKeyword: "המבורגר כמהין רעננה",
    metaTitle: "המבורגר NB כמהין | NB BURGER רעננה",
    metaDescription:
      "המבורגר NB כמהין ברעננה — בקר על הפלנצ׳ה, איולי כמהין וגבינה. NB BURGER, מסעדת המבורגרים הכשרה באחוזה 96.",
    tags: ["המבורגר", "כמהין"]
  }),
  item({
    id: "item-nb-burger-konfi",
    categoryId: "cat-burgers",
    sortOrder: 3,
    name: "המבורגר NB קונפי",
    slug: "nb-burger-konfi",
    price: 66,
    description: "קציצת בקר, איולי שום קונפי, חסה, עגבנייה, בצל מקורמל וגבינה.",
    longDescription:
      "המבורגר NB קונפי — קציצת בקר שנצרבה על הפלנצ׳ה, איולי שום קונפי ארומטי, בצל מקורמל מתוק וגבינה נמסה. טעם עמוק ומדויק מ-NB BURGER, מסעדת ההמבורגרים ברעננה.",
    primaryKeyword: "המבורגר קונפי רעננה",
    metaTitle: "המבורגר NB קונפי | NB BURGER רעננה",
    metaDescription:
      "המבורגר NB קונפי ברעננה — בקר על הפלנצ׳ה, איולי שום קונפי ובצל מקורמל. NB BURGER, מסעדת המבורגרים הכשרה.",
    tags: ["המבורגר", "קונפי"]
  }),
  item({
    id: "item-nb-burger-vegan",
    categoryId: "cat-burgers",
    sortOrder: 4,
    name: "המבורגר NB טבעוני",
    slug: "nb-burger-vegan",
    price: 58,
    description: "קציצה טבעונית על הפלנצ׳ה, חסה, עגבנייה, בצל סגול, מלפפון חמוץ ורוטב הבית.",
    longDescription:
      "המבורגר NB טבעוני — קציצה צמחונית שנצרבה על הפלנצ׳ה עם ירקות טריים ורוטב הבית, בלחמנייה רכה. אופציה טבעונית מלאה ב-NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "המבורגר טבעוני רעננה",
    metaTitle: "המבורגר NB טבעוני | NB BURGER רעננה",
    metaDescription:
      "המבורגר NB טבעוני ברעננה — קציצה צמחונית על הפלנצ׳ה וירקות טריים. NB BURGER, מסעדת המבורגרים הכשרה באחוזה 96.",
    tags: ["המבורגר", "טבעוני"]
  }),

  // ── ארוחות ──
  item({
    id: "item-meal-nb-klasi",
    categoryId: "cat-meals",
    sortOrder: 1,
    name: "ארוחת NB קלאסי",
    slug: "meal-nb-klasi",
    price: 78,
    description: "המבורגר NB קלאסי, תוספת לבחירה ושתייה קלה.",
    longDescription:
      "ארוחת NB קלאסי — ההמבורגר הקלאסי שלנו עם תוספת לבחירה ושתייה קלה. ארוחה מלאה ומשביעה מ-NB BURGER, מסעדת המבורגרים הכשרה ברעננה.",
    primaryKeyword: "ארוחת המבורגר רעננה",
    metaTitle: "ארוחת NB קלאסי | NB BURGER רעננה",
    metaDescription:
      "ארוחת NB קלאסי ברעננה — המבורגר קלאסי, תוספת ושתייה. NB BURGER, מסעדת המבורגרים הכשרה באחוזה 96.",
    tags: ["ארוחה"]
  }),
  item({
    id: "item-meal-nb-kamhin",
    categoryId: "cat-meals",
    sortOrder: 2,
    name: "ארוחת NB כמהין",
    slug: "meal-nb-kamhin",
    price: 84,
    description: "המבורגר NB כמהין, תוספת לבחירה ושתייה קלה.",
    longDescription:
      "ארוחת NB כמהין — המבורגר עם איולי כמהין, תוספת לבחירה ושתייה קלה. ארוחה מלאה מ-NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "ארוחת המבורגר כמהין רעננה",
    metaTitle: "ארוחת NB כמהין | NB BURGER רעננה",
    metaDescription:
      "ארוחת NB כמהין ברעננה — המבורגר כמהין, תוספת ושתייה. NB BURGER, מסעדת המבורגרים הכשרה.",
    tags: ["ארוחה"]
  }),

  // ── תוספות ──
  item({
    id: "item-side-fries",
    categoryId: "cat-sides",
    sortOrder: 1,
    name: "צ'יפס",
    slug: "chips",
    price: 22,
    description: "צ'יפס פריך עם תיבול הבית.",
    longDescription:
      "צ'יפס פריך וזהוב עם תיבול הבית — התוספת הקלאסית ליד ההמבורגר ב-NB BURGER רעננה. מושלם ליד כל מנה מהתפריט.",
    primaryKeyword: "צ'יפס רעננה",
    metaTitle: "צ'יפס | NB BURGER רעננה",
    metaDescription:
      "צ'יפס פריך עם תיבול הבית — תוספת מ-NB BURGER, מסעדת המבורגרים הכשרה ברעננה. הזמינו ליד ההמבורגר.",
    tags: ["תוספת"]
  }),
  item({
    id: "item-side-home-fries",
    categoryId: "cat-sides",
    sortOrder: 2,
    name: "הום פרייז",
    slug: "home-fries",
    price: 26,
    description: "תפוחי אדמה חתוכים, מטוגנים ומתובלים.",
    longDescription:
      "הום פרייז — פרוסות תפוחי אדמה מטוגנות ומתובלות, פריכות מבחוץ ורכות מבפנים. תוספת מעולה מ-NB BURGER, מסעדת ההמבורגרים ברעננה.",
    primaryKeyword: "הום פרייז רעננה",
    metaTitle: "הום פרייז | NB BURGER רעננה",
    metaDescription:
      "הום פרייז מ-NB BURGER ברעננה — תפוחי אדמה מתובלים ופריכים. מסעדת המבורגרים הכשרה באחוזה 96.",
    tags: ["תוספת"]
  }),
  item({
    id: "item-side-wings",
    categoryId: "cat-sides",
    sortOrder: 3,
    name: "כנפיים",
    slug: "wings",
    price: 34,
    description: "כנפיים עסיסיות עם רוטב לבחירה.",
    longDescription:
      "כנפיים עסיסיות ופריכות, מוגשות עם רוטב לבחירה. מנה מושלמת לשיתוף או כתוספת ליד ההמבורגר — NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "כנפיים רעננה",
    metaTitle: "כנפיים | NB BURGER רעננה",
    metaDescription:
      "כנפיים עסיסיות מ-NB BURGER ברעננה — תוספת מושלמת ליד ההמבורגר. מסעדת המבורגרים הכשרה.",
    tags: ["תוספת"]
  }),
  item({
    id: "item-side-nuggets-4",
    categoryId: "cat-sides",
    sortOrder: 4,
    name: "4 יחידות נאגטס",
    slug: "nuggets-4",
    price: 28,
    description: "4 נאגטס עוף פריכים, מוגשים עם רוטב לבחירה.",
    longDescription:
      "4 נאגטס עוף פריכים וזהובים, מוגשים עם רוטב לבחירה. תוספת קלה וטעימה מ-NB BURGER, מסעדת המבורגרים הכשרה ברעננה.",
    primaryKeyword: "נאגטס רעננה",
    metaTitle: "4 נאגטס | NB BURGER רעננה",
    metaDescription:
      "4 נאגטס עוף פריכים מ-NB BURGER ברעננה. תוספת מושלמת ליד ההמבורגר — מסעדת המבורגרים הכשרה.",
    tags: ["תוספת", "עוף"]
  }),
  item({
    id: "item-side-nuggets-7",
    categoryId: "cat-sides",
    sortOrder: 5,
    name: "7 יחידות נאגטס",
    slug: "nuggets-7",
    price: 38,
    description: "7 נאגטס עוף פריכים, מוגשים עם רוטב לבחירה.",
    longDescription:
      "7 נאגטס עוף פריכים — מנה גדולה יותר לשיתוף או לרעב גדול. מ-NB BURGER, מסעדת המבורגרים הכשרה ברעננה.",
    primaryKeyword: "נאגטס עוף רעננה",
    metaTitle: "7 נאגטס | NB BURGER רעננה",
    metaDescription:
      "7 נאגטס עוף פריכים מ-NB BURGER ברעננה. תוספת עוף מושלמת — מסעדת המבורגרים הכשרה באחוזה 96.",
    tags: ["תוספת", "עוף"]
  }),

  // ── סלטים ──
  item({
    id: "item-salad-green",
    categoryId: "cat-salads",
    sortOrder: 1,
    name: "סלט ירוק",
    slug: "salad-green",
    price: 28,
    description: "עלי בייבי, מלפפון, עגבנייה, בצל סגול ורוטב לבחירה.",
    longDescription:
      "סלט ירוק טרי עם עלי בייבי, ירקות חתוכים ורוטב לבחירה. אופציה קלה ורעננה ליד ההמבורגר — NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "סלט ירוק רעננה",
    metaTitle: "סלט ירוק | NB BURGER רעננה",
    metaDescription:
      "סלט ירוק טרי מ-NB BURGER ברעננה — ירקות טריים ורוטב לבחירה. מסעדת המבורגרים הכשרה.",
    tags: ["סלט"]
  }),
  item({
    id: "item-salad-caesar-small",
    categoryId: "cat-salads",
    sortOrder: 2,
    name: "סלט קיסר קטן",
    slug: "salad-caesar-small",
    price: 32,
    description: "חסה רומaine, קרוטונים, פרמזן ורוטב קיסר.",
    longDescription:
      "סלט קיסר קטן — חסה פריכה, קרוטונים, פרמזן ורוטב קיסר קלאסי. מנה מושלמת לפתיחה או לצד ההמבורגר — NB BURGER רעננה.",
    primaryKeyword: "סלט קיסר רעננה",
    metaTitle: "סלט קיסר קטן | NB BURGER רעננה",
    metaDescription:
      "סלט קיסר קטן מ-NB BURGER ברעננה — חסה, קרוטונים ופרמזן. מסעדת המבורגרים הכשרה.",
    tags: ["סלט"]
  }),
  item({
    id: "item-salad-caesar-large",
    categoryId: "cat-salads",
    sortOrder: 3,
    name: "סלט קיסר גדול",
    slug: "salad-caesar-large",
    price: 42,
    description: "חסה רומaine, קרוטונים, פרמזן ורוטב קיסר — מנה גדולה.",
    longDescription:
      "סלט קיסר גדול — מנה משביעה עם חסה רומaine, קרוטונים, פרמזן ורוטב קיסר. NB BURGER, מסעדת המבורגרים הכשרה ברעננה.",
    primaryKeyword: "סלט קיסר גדול רעננה",
    metaTitle: "סלט קיסר גדול | NB BURGER רעננה",
    metaDescription:
      "סלט קיסר גדול מ-NB BURGER ברעננה — מנה משביעה עם חסה, קרוטונים ופרמזן. מסעדת המבורגרים הכשרה.",
    tags: ["סלט"]
  }),

  // ── רטבים ──
  item({
    id: "item-sauce-aioli-konfi",
    categoryId: "cat-sauces",
    sortOrder: 1,
    name: "איולי שום קונפי",
    slug: "aioli-konfi",
    price: 6,
    description: "איולי ביתי עם שום קונפי.",
    longDescription:
      "איולי שום קונפי ביתי — רוטב עשיר וארומטי שמשדרג כל המבורגר. מ-NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "איולי שום קונפי",
    metaTitle: "איולי שום קונפי | NB BURGER רעננה",
    metaDescription:
      "איולי שום קונפי ביתי מ-NB BURGER ברעננה. רוטב מושלם ליד ההמבורגר — מסעדת המבורגרים הכשרה.",
    tags: ["רטב"]
  }),
  item({
    id: "item-sauce-aioli-honey-mustard",
    categoryId: "cat-sauces",
    sortOrder: 2,
    name: "איולי דבש וחרדל",
    slug: "aioli-honey-mustard",
    price: 6,
    description: "איולי מתקתק עם דבש וחרדל.",
    longDescription:
      "איולי דבש וחרדל — שילוב מתקתק וחריף שמתאים לתוספות ולהמבורגר. מ-NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "איולי דבש וחרדל",
    metaTitle: "איולי דבש וחרדל | NB BURGER רעננה",
    metaDescription:
      "איולי דבש וחרדל מ-NB BURGER ברעננה. רוטב מתקתק ליד ההמבורגר — מסעדת המבורגרים הכשרה.",
    tags: ["רטב"]
  }),
  item({
    id: "item-sauce-aioli-kamhin",
    categoryId: "cat-sauces",
    sortOrder: 3,
    name: "איולי כמהין",
    slug: "aioli-kamhin",
    price: 6,
    description: "איולי כמהין עשיר וקרמי.",
    longDescription:
      "איולי כמהין — רוטב קרמי ועשיר בניחוח כמהין, מושלם ליד ההמבורגר או לתוספות. NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "איולי כמהין",
    metaTitle: "איולי כמהין | NB BURGER רעננה",
    metaDescription:
      "איולי כמהין מ-NB BURGER ברעננה — רוטב קרמי ועשיר. מסעדת המבורגרים הכשרה באחוזה 96.",
    tags: ["רטב"]
  }),
  item({
    id: "item-sauce-aioli-mint",
    categoryId: "cat-sauces",
    sortOrder: 4,
    name: "איולי נענע",
    slug: "aioli-mint",
    price: 6,
    description: "איולי רענן עם נענע.",
    longDescription:
      "איולי נענע — רוטב רענן וקליל שמאזן את עושר ההמבורגר. מ-NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "איולי נענע",
    metaTitle: "איולי נענע | NB BURGER רעננה",
    metaDescription:
      "איולי נענע מ-NB BURGER ברעננה. רוטב רענן ליד ההמבורגר — מסעדת המבורגרים הכשרה.",
    tags: ["רטב"]
  }),
  item({
    id: "item-sauce-aioli-chipotle",
    categoryId: "cat-sauces",
    sortOrder: 5,
    name: "איולי צ'יפוטלה",
    slug: "aioli-chipotle",
    price: 6,
    description: "איולי מעושן וחריף עם צ'יפוטלה.",
    longDescription:
      "איולי צ'יפוטלה — רוטב מעושן וחריף לחובבי טעם חזק. מ-NB BURGER, מסעדת המבורגרים הכשרה ברעננה.",
    primaryKeyword: "איולי צ'יפוטלה",
    metaTitle: "איולי צ'יפוטלה | NB BURGER רעננה",
    metaDescription:
      "איולי צ'יפוטלה מ-NB BURGER ברעננה — רוטב מעושן וחריף. מסעדת המבורגרים הכשרה.",
    tags: ["רטב", "חריף"]
  }),
  item({
    id: "item-sauce-ketchup",
    categoryId: "cat-sauces",
    sortOrder: 6,
    name: "קטשופ",
    slug: "ketchup",
    price: 5,
    description: "קטשופ קלאסי.",
    longDescription:
      "קטשופ קלאסי — הרוטב הבסיסי לצ'יפס, נאגטס ולכל תוספת. NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "קטשופ",
    metaTitle: "קטשופ | NB BURGER רעננה",
    metaDescription:
      "קטשופ מ-NB BURGER ברעננה. רוטב קלאסי ליד התוספות — מסעדת המבורגרים הכשרה.",
    tags: ["רטב"]
  }),
  item({
    id: "item-sauce-mayo",
    categoryId: "cat-sauces",
    sortOrder: 7,
    name: "מיונז",
    slug: "mayo",
    price: 5,
    description: "מיונז קלאסי.",
    longDescription:
      "מיונז קלאסי — רוטב חלק ומוכר שמתאים לכל מנה. NB BURGER, מסעדת המבורגרים הכשרה ברעננה.",
    primaryKeyword: "מיונז",
    metaTitle: "מיונז | NB BURGER רעננה",
    metaDescription:
      "מיונז מ-NB BURGER ברעננה. רוטב קלאסי ליד ההמבורגר והתוספות — מסעדת המבורגרים הכשרה.",
    tags: ["רטב"]
  }),

  // ── שתייה קלה ──
  item({
    id: "item-drink-water",
    categoryId: "cat-soft-drinks",
    sortOrder: 1,
    name: "מים מינרלים",
    slug: "mineral-water",
    price: 8,
    description: "בקבוק מים מינרלים.",
    longDescription:
      "מים מינרלים קרים — השתייה המושלמת ליד ההמבורגר. NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "מים מינרלים רעננה",
    metaTitle: "מים מינרלים | NB BURGER רעננה",
    metaDescription:
      "מים מינרלים מ-NB BURGER ברעננה. שתייה קלה ליד הארוחה — מסעדת המבורגרים הכשרה.",
    tags: ["שתייה"]
  }),
  item({
    id: "item-drink-soda",
    categoryId: "cat-soft-drinks",
    sortOrder: 2,
    name: "סודה",
    slug: "soda",
    price: 10,
    description: "סודה מוגזת.",
    longDescription:
      "סודה מוגזת וקרה — משקה מרענן ליד ההמבורגר. NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "סודה רעננה",
    metaTitle: "סודה | NB BURGER רעננה",
    metaDescription:
      "סודה מוגזת מ-NB BURGER ברעננה. שתייה קלה ליד הארוחה — מסעדת המבורגרים הכשרה.",
    tags: ["שתייה"]
  }),
  item({
    id: "item-drink-lemonade",
    categoryId: "cat-soft-drinks",
    sortOrder: 3,
    name: "לימונדה",
    slug: "lemonade",
    price: 14,
    description: "לימונדה קרה ומרעננת.",
    longDescription:
      "לימונדה קרה ומרעננת — משקה מושלם ליד ההמבורגר בימים חמים. NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "לימונדה רעננה",
    metaTitle: "לימונדה | NB BURGER רעננה",
    metaDescription:
      "לימונדה קרה מ-NB BURGER ברעננה. שתייה מרעננת ליד ההמבורגר — מסעדת המבורגרים הכשרה.",
    tags: ["שתייה"]
  }),
  item({
    id: "item-drink-cola",
    categoryId: "cat-soft-drinks",
    sortOrder: 4,
    name: "קולה",
    slug: "cola",
    price: 10,
    description: "קוקה קולה.",
    longDescription:
      "קוקה קולה קרה — הקלאסיקה ליד כל ארוחה. NB BURGER, מסעדת המבורגרים הכשרה ברעננה.",
    primaryKeyword: "קולה רעננה",
    metaTitle: "קולה | NB BURGER רעננה",
    metaDescription:
      "קוקה קולה מ-NB BURGER ברעננה. שתייה קלה ליד ההמבורגר — מסעדת המבורגרים הכשרה.",
    tags: ["שתייה"]
  }),
  item({
    id: "item-drink-cola-zero",
    categoryId: "cat-soft-drinks",
    sortOrder: 5,
    name: "קולה זירו",
    slug: "cola-zero",
    price: 10,
    description: "קוקה קולה זירו.",
    longDescription:
      "קוקה קולה זירו — אותו טעם, ללא סוכר. NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "קולה זירו רעננה",
    metaTitle: "קולה זירו | NB BURGER רעננה",
    metaDescription:
      "קוקה קולה זירו מ-NB BURGER ברעננה. שתייה קלה ליד הארוחה — מסעדת המבורגרים הכשרה.",
    tags: ["שתייה"]
  }),
  item({
    id: "item-drink-sprite",
    categoryId: "cat-soft-drinks",
    sortOrder: 6,
    name: "ספרייט",
    slug: "sprite",
    price: 10,
    description: "ספרייט.",
    longDescription:
      "ספרייט מוגז ומרענן — משקה לימון-ליימון ליד ההמבורגר. NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "ספרייט רעננה",
    metaTitle: "ספרייט | NB BURGER רעננה",
    metaDescription:
      "ספרייט מ-NB BURGER ברעננה. שתייה קלה ליד ההמבורגר — מסעדת המבורגרים הכשרה.",
    tags: ["שתייה"]
  }),
  item({
    id: "item-drink-sprite-zero",
    categoryId: "cat-soft-drinks",
    sortOrder: 7,
    name: "ספרייט זירו",
    slug: "sprite-zero",
    price: 10,
    description: "ספרייט זירו.",
    longDescription:
      "ספרייט זירו — רעננות לימון-ליימון ללא סוכר. NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "ספרייט זירו רעננה",
    metaTitle: "ספרייט זירו | NB BURGER רעננה",
    metaDescription:
      "ספרייט זירו מ-NB BURGER ברעננה. שתייה קלה ליד הארוחה — מסעדת המבורגרים הכשרה.",
    tags: ["שתייה"]
  }),
  item({
    id: "item-drink-fanta",
    categoryId: "cat-soft-drinks",
    sortOrder: 8,
    name: "פאנטה",
    slug: "fanta",
    price: 10,
    description: "פאנטה תפוזים.",
    longDescription:
      "פאנטה תפוזים — משקה מוגז ומתוק ליד ההמבורגר. NB BURGER, מסעדת המבורגרים הכשרה ברעננה.",
    primaryKeyword: "פאנטה רעננה",
    metaTitle: "פאנטה | NB BURGER רעננה",
    metaDescription:
      "פאנטה תפוזים מ-NB BURGER ברעננה. שתייה קלה ליד ההמבורגר — מסעדת המבורגרים הכשרה.",
    tags: ["שתייה"]
  }),
  item({
    id: "item-drink-grape",
    categoryId: "cat-soft-drinks",
    sortOrder: 9,
    name: "ענבים",
    slug: "grape-drink",
    price: 10,
    description: "משקה ענבים.",
    longDescription:
      "משקה ענבים מתוק ומרענן — NB BURGER, מסעדת המבורגרים ברעננה.",
    primaryKeyword: "משקה ענבים רעננה",
    metaTitle: "ענבים | NB BURGER רעננה",
    metaDescription:
      "משקה ענבים מ-NB BURGER ברעננה. שתייה קלה ליד הארוחה — מסעדת המבורגרים הכשרה.",
    tags: ["שתייה"]
  }),
  item({
    id: "item-drink-fuzetea",
    categoryId: "cat-soft-drinks",
    sortOrder: 10,
    name: "פיוז טי",
    slug: "fuzetea",
    price: 12,
    description: "תה קר פיוז טי.",
    longDescription:
      "פיוז טי — תה קר מרענן ליד ההמבורגר. NB BURGER, מסעדת המבורגרים הכשרה ברעננה.",
    primaryKeyword: "פיוז טי רעננה",
    metaTitle: "פיוז טי | NB BURGER רעננה",
    metaDescription:
      "פיוז טי מ-NB BURGER ברעננה. תה קר ליד הארוחה — מסעדת המבורגרים הכשרה.",
    tags: ["שתייה"]
  }),

  // ── בירות ──
  item({
    id: "item-beer-corona",
    categoryId: "cat-beers",
    sortOrder: 1,
    name: "בקבוק קורונה",
    slug: "beer-corona",
    price: 26,
    description: "בירה קורונה בבקבוק.",
    longDescription:
      "בירה קורונה בבקבוק — ליד ההמבורגר ב-NB BURGER, מסעדת המבורגרים ברעננה. לבני 18+ בלבד.",
    primaryKeyword: "בירה קורונה רעננה",
    metaTitle: "בקבוק קורונה | NB BURGER רעננה",
    metaDescription:
      "בירה קורונה בבקבוק מ-NB BURGER ברעננה. ליד ההמבורגר — מסעדת המבורגרים הכשרה. 18+.",
    tags: ["בירה", "18+"]
  }),
  item({
    id: "item-beer-stella",
    categoryId: "cat-beers",
    sortOrder: 2,
    name: "בקבוק סטלה",
    slug: "beer-stella",
    price: 26,
    description: "בירה Stella Artois בבקבוק.",
    longDescription:
      "בירה Stella Artois בבקבוק — זוג מנצח ליד ההמבורגר. NB BURGER, מסעדת המבורגרים ברעננה. 18+.",
    primaryKeyword: "בירה סטלה רעננה",
    metaTitle: "בקבוק סטלה | NB BURGER רעננה",
    metaDescription:
      "בירה Stella Artois בבקבוק מ-NB BURGER ברעננה. ליד ההמבורגר — מסעדת המבורגרים הכשרה. 18+.",
    tags: ["בירה", "18+"]
  }),
  item({
    id: "item-beer-heineken",
    categoryId: "cat-beers",
    sortOrder: 3,
    name: "בקבוק הייניקן",
    slug: "beer-heineken",
    price: 26,
    description: "בירה Heineken בבקבוק.",
    longDescription:
      "בירה Heineken בבקבוק — משקה מושלם ליד ארוחת ההמבורגר. NB BURGER, מסעדת המבורגרים ברעננה. 18+.",
    primaryKeyword: "בירה הייניקן רעננה",
    metaTitle: "בקבוק הייניקן | NB BURGER רעננה",
    metaDescription:
      "בירה Heineken בבקבוק מ-NB BURGER ברעננה. ליד ההמבורגר — מסעדת המבורגרים הכשרה. 18+.",
    tags: ["בירה", "18+"]
  }),
  item({
    id: "item-beer-goldstar",
    categoryId: "cat-beers",
    sortOrder: 4,
    name: "בקבוק גולדסטאר",
    slug: "beer-goldstar",
    price: 24,
    description: "בירה גולדסטאר בבקבוק.",
    longDescription:
      "בירה גולדסטאר בבקבוק — בירה ישראלית קלאסית ליד ההמבורגר. NB BURGER, מסעדת המבורגרים הכשרה ברעננה. 18+.",
    primaryKeyword: "בירה גולדסטאר רעננה",
    metaTitle: "בקבוק גולדסטאר | NB BURGER רעננה",
    metaDescription:
      "בירה גולדסטאר בבקבוק מ-NB BURGER ברעננה. ליד ההמבורגר — מסעדת המבורגרים הכשרה. 18+.",
    tags: ["בירה", "18+"]
  })
];
