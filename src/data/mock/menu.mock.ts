import type { MenuCategory, MenuItem } from "@/types/content";

const now = "2026-05-17T07:00:00.000Z";

/** תמונת מנה אחידה לכל התפריט */
export const MENU_ITEM_IMAGE = "/images/menu/nb-menu-burger.png";

export const mockMenuCategories: MenuCategory[] = [
  {
    id: "cat-burgers",
    name: "המבורגרים",
    slug: "burgers",
    description: "הקלאסיקות של NB BURGER",
    sortOrder: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "cat-chicken",
    name: "עוף וצמחוני",
    slug: "chicken-veg",
    description: "חלופות קלילות ומנות ללא בקר",
    sortOrder: 2,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "cat-sides",
    name: "תוספות",
    slug: "sides",
    description: "ליד הבורגר",
    sortOrder: 3,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "cat-drinks",
    name: "שתייה",
    slug: "drinks",
    description: "קר וחמים",
    sortOrder: 4,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "cat-desserts",
    name: "קינוחים",
    slug: "desserts",
    description: "סיום מתוק",
    sortOrder: 5,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];

export const mockMenuItems: MenuItem[] = [
  {
    id: "item-nb-classic",
    name: "NB Classic",
    description: "קציצת בקר, חסה, עגבנייה, בצל סגול ורוטב הבית.",
    price: 58,
    categoryId: "cat-burgers",
    imageUrl: MENU_ITEM_IMAGE,
    detailNotes: [
      "אנחנו משתמשים בגבינה אמריקאית כי היא נמסה טוב יותר מגבינות אחרות. היא הכי טובה.",
      "הבשר שלנו יקר לנו. לכן אנחנו משתמשים בתערובת מיוחדת שמיישנים אצלנו במקום."
    ],
    longDescription:
      "הקלאסיקה שלנו — בשר טרי על הפלנצ׳ה, שכבות ירקות פריכות ורוטב הבית.",
    slug: "nb-classic",
    imageAlt: "המבורגר NB Classic של NB BURGER",
    isActive: true,
    tags: ["מומלץ", "בקר"],
    sortOrder: 1,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-smoked-burger",
    name: "Smoked Burger",
    description: "בקר מעושן, גבינה, בצל מקורמל וברביקיו.",
    price: 66,
    categoryId: "cat-burgers",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: ["מעושן"],
    sortOrder: 2,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-spicy-burger",
    name: "Spicy Red",
    description: "בקר, גבינת צ'דר, חלפיניו, רוטב חריף הבית.",
    price: 62,
    categoryId: "cat-burgers",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: ["חריף"],
    sortOrder: 3,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-mushroom-swiss",
    name: "Mushroom Swiss",
    description: "בקר, פטריות מוקפצות, גבינת שווייץ ומיונז טרי.",
    price: 64,
    categoryId: "cat-burgers",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: ["בקר"],
    sortOrder: 4,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-double-stack",
    name: "Double Stack",
    description: "שתי קציצות בקר, גבינה כפולה, חסה ומלפפון חמוץ.",
    price: 78,
    categoryId: "cat-burgers",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: ["כפול", "בקר"],
    sortOrder: 5,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-crispy-chicken",
    name: "Crispy Chicken",
    description: "שניצל עוף פריך, חסה, מיונז לימון וחלה טרייה.",
    price: 52,
    categoryId: "cat-chicken",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: ["עוף"],
    sortOrder: 1,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-veggie-burger",
    name: "Veggie Stack",
    description: "קציצת ירקות וקטניות, אבוקדו, עגבנייה ורוטב טחינה.",
    price: 54,
    categoryId: "cat-chicken",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: ["צמחוני"],
    sortOrder: 2,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-fries",
    name: "צ'יפס NB",
    description: "צ'יפס פריך עם תיבול הבית.",
    price: 22,
    categoryId: "cat-sides",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: ["צמחוני"],
    sortOrder: 1,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-onion-rings",
    name: "טבעות בצל",
    description: "בצל בציפוי פריך, מוגש עם רוטב שום.",
    price: 26,
    categoryId: "cat-sides",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: [],
    sortOrder: 2,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-coleslaw",
    name: "סלט כרוב",
    description: "כרוב לבן ואדום ברוטב קרמי קליל.",
    price: 16,
    categoryId: "cat-sides",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: ["צמחוני"],
    sortOrder: 3,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-loaded-fries",
    name: "צ'יפס עמוס",
    description: "צ'יפס עם גבינה מותכת, בצל טיגון פריך וירקות טריים.",
    price: 36,
    categoryId: "cat-sides",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: ["מומלץ"],
    sortOrder: 4,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-lemonade",
    name: "לימונדה",
    description: "לימונדה קרה וסחוטה.",
    price: 14,
    categoryId: "cat-drinks",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: [],
    sortOrder: 1,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-soft-drink",
    name: "שתייה קלה",
    description: "קולה / זירו / ספרייט — בקבוק 500 מ\"ל.",
    price: 12,
    categoryId: "cat-drinks",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: [],
    sortOrder: 2,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-milkshake",
    name: "מילקשייק",
    description: "וניל, שוקולד או תות — עם קצפת.",
    price: 28,
    categoryId: "cat-drinks",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: ["מומלץ"],
    sortOrder: 3,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-cold-brew",
    name: "קולד ברו",
    description: "קפה קר מחולץ לאט, מוגש על קרח.",
    price: 18,
    categoryId: "cat-drinks",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: [],
    sortOrder: 4,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-brownie",
    name: "בראוניז שוקולד",
    description: "בראוניז חם עם כדור גלידת וניל.",
    price: 32,
    categoryId: "cat-desserts",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: [],
    sortOrder: 1,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-churros",
    name: "צ'ורוס",
    description: "מקלות פריכים עם סוכר וצנובר שוקולד.",
    price: 26,
    categoryId: "cat-desserts",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: ["צמחוני"],
    sortOrder: 2,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-cheesecake",
    name: "עוגת גבינה",
    description: "קרם גבינה אפוי על בסיס ביסקוויט ורוטד פירות יער.",
    price: 34,
    categoryId: "cat-desserts",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: [],
    sortOrder: 3,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "item-nuggets",
    name: "נגטס",
    description: "נגטס עוף פריכים, מוגשות עם רוטב לבחירה.",
    price: 28,
    categoryId: "cat-sides",
    imageUrl: MENU_ITEM_IMAGE,
    isActive: true,
    tags: ["עוף"],
    sortOrder: 5,
    createdAt: now,
    updatedAt: now
  }
];
