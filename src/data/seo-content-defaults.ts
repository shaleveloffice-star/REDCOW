import type { Locale } from "@/i18n/config";
import { joinParagraphs } from "@/lib/seo-content/paragraphs";
import type { SeoPageFieldsInput, SeoPageId } from "@/types/seo-content";

const MENU_CATEGORY_IDS = [
  "cat-burgers",
  "cat-meals",
  "cat-sides",
  "cat-salads",
  "cat-sauces",
  "cat-soft-drinks",
  "cat-beers"
] as const;

/** Canonical meta defaults — single source of truth for static page SERP fields. */
const PAGE_META_DEFAULTS: Record<
  Locale,
  Record<SeoPageId, Pick<SeoPageFieldsInput, "metaTitle" | "metaDescription">>
> = {
  he: {
    home: {
      metaTitle: "SO WHAT | המבורגר ברעננה",
      metaDescription:
        "מחפשים המבורגר ברעננה או המבורגר רעננה? SO WHAT באחוזה 96 - מסעדה כשרה ברעננה עם המבורגרים מבשר טרי הנטחן במקום, ארוחות ותוספות."
    },
    menu: {
      metaTitle: "תפריט המבורגרים ברעננה | SO WHAT",
      metaDescription:
        "גלו את תפריט ההמבורגרים של SO WHAT ברעננה - המבורגרים על הפלנצ׳ה, תוספות ומנות ממסעדה כשרה ברחוב אחוזה 96."
    },
    locations: {
      metaTitle: "מיקום ושעות | SO WHAT רעננה",
      metaDescription:
        "כתובת SO WHAT ברחוב אחוזה 96, שעות פתיחה, ניווט, איסוף עצמי ואזורי משלוח. כל מה שצריך לפני שמגיעים לסניף רעננה."
    },
    kosher: {
      metaTitle: "כשר בהשגחת רבנות | SO WHAT",
      metaDescription:
        "SO WHAT - מסעדת המבורגרים כשרה בהשגחת רבנות. פרטי הכשרות והמידע המעודכן יופיעו כאן."
    },
    about: {
      metaTitle: "אודות SO WHAT | הסיפור שלנו",
      metaDescription:
        "הסיפור של SO WHAT - המותג, החזון, הבשר והאנשים מאחורי המסעדה. איך בנינו חוויית המבורגר מדויקת ועקבית."
    },
    privacy: {
      metaTitle: "מדיניות פרטיות | SO WHAT",
      metaDescription: "מדיניות הפרטיות של SO WHAT - איסוף מידע, שימוש בנתונים וזכויות המשתמש."
    },
    terms: {
      metaTitle: "תקנון האתר | SO WHAT",
      metaDescription: "תקנון השימוש באתר SO WHAT."
    }
  },
  en: {
    home: {
      metaTitle: "SO WHAT | Kosher Burgers Raanana",
      metaDescription:
        "SO WHAT in Raanana - smash burgers on the plancha, fresh ingredients and bold flavor at Ahuzah 96."
    },
    menu: {
      metaTitle: "Burger Menu Raanana | SO WHAT",
      metaDescription:
        "Explore the SO WHAT menu in Raanana - plancha burgers, sides and full meals at our kosher restaurant."
    },
    locations: {
      metaTitle: "Location & Hours | SO WHAT Raanana",
      metaDescription: "Find SO WHAT in Raanana - address, opening hours, directions and delivery."
    },
    kosher: {
      metaTitle: "Kosher Certification | SO WHAT",
      metaDescription:
        "SO WHAT is a kosher burger restaurant under rabbinate supervision. Details will appear here."
    },
    about: {
      metaTitle: "About | SO WHAT Raanana",
      metaDescription:
        "Meet SO WHAT - Raanana's smash-burger spot. Quality beef, soft buns, plancha perfection."
    },
    privacy: {
      metaTitle: "Privacy Policy | SO WHAT",
      metaDescription: "SO WHAT privacy policy - data collection, usage and your rights."
    },
    terms: {
      metaTitle: "Terms of Use | SO WHAT",
      metaDescription: "Terms of use for the SO WHAT website."
    }
  },
  fr: {
    home: {
      metaTitle: "SO WHAT | Burgers casher Raanana",
      metaDescription:
        "SO WHAT à Raanana - burgers sur plancha, ingrédients frais et saveur intense, Ahuzah 96."
    },
    menu: {
      metaTitle: "Menu burgers Raanana | SO WHAT",
      metaDescription:
        "Découvrez le menu SO WHAT à Raanana - burgers plancha, accompagnements et formules dans un restaurant casher."
    },
    locations: {
      metaTitle: "Adresse & horaires | SO WHAT Raanana",
      metaDescription: "SO WHAT à Raanana - adresse, horaires, itinéraire et livraison."
    },
    kosher: {
      metaTitle: "Cacherout | SO WHAT",
      metaDescription:
        "SO WHAT est un restaurant de burgers casher sous supervision rabbinique. Les détails apparaîtront ici."
    },
    about: {
      metaTitle: "À propos | SO WHAT Raanana",
      metaDescription:
        "Découvrez SO WHAT - burgers smash à Raanana. Viande de qualité, buns moelleux, plancha maîtrisée."
    },
    privacy: {
      metaTitle: "Politique de confidentialité | SO WHAT",
      metaDescription:
        "Politique de confidentialité SO WHAT - collecte, usage des données et vos droits."
    },
    terms: {
      metaTitle: "Conditions d'utilisation | SO WHAT",
      metaDescription: "Conditions d'utilisation du site SO WHAT."
    }
  }
};

function pagesForLocale(locale: Locale): Record<SeoPageId, SeoPageFieldsInput> {
  if (locale === "he") {
    return {
      home: {
        sectionTitle: "לא עוד המבורגר.",
        introduction: joinParagraphs([
          "ב-SO WHAT אנחנו מאמינים שאיכות לא צריכה הסברים ארוכים.",
          "בשר בקר איכותי, הנטחן במקום מדי יום.",
          "לחמניית בריוש טרייה.",
          "רטבים שמכינים במקום.",
          "וחומרי גלם שנבחרים בקפידה."
        ]),
        bottomContent: joinParagraphs([
          "כל המבורגר נצלה לפי הזמנה ומוגש בדיוק כמו שהוא צריך להיות - עסיסי, מדויק ובלתי מתפשר.",
          "כי בסוף, לא צריך להמציא מחדש את ההמבורגר.",
          "רק להכין אותו כמו שצריך."
        ]),
        faq: {
          kicker: "FAQ",
          title: "שאלות ותשובות",
          lead: "כל מה שחשוב לדעת לפני שמגיעים לביס הבא.",
          items: [
            {
              question: "איפה אפשר לאכול המבורגר כשר ברעננה?",
              answer:
                "SO WHAT מציעה חוויית המבורגר כשרה ברעננה, עם המבורגרים עסיסיים, חומרי גלם איכותיים ומנות שמוכנות במקום. אפשר להגיע לסניף וליהנות מהארוחה במקום או להזמין במשלוח."
            },
            {
              question: "איזו כשרות יש ל-SO WHAT?",
              answer:
                "SO WHAT היא מסעדה כשרה ופועלת תחת כשרות הרבנות. התפריט הבשרי שלנו מותאם לשומרי כשרות וכולל מגוון המבורגרים ומנות נוספות."
            },
            {
              question: "מה מיוחד בסמאש בורגר של SO WHAT?",
              answer:
                "הסמאש בורגר שלנו מבוסס על קציצת בקר שנצרבת על משטח חם לקבלת השחמה וטעם עשיר, ומוגשת עם תוספות ורטבים שמשלימים את הביס."
            },
            {
              question: "האם אפשר להזמין משלוח המבורגר מ-SO WHAT?",
              answer:
                "כן. ניתן להזמין משלוחים מ-SO WHAT ברעננה ובאזורי המשלוח הזמינים וליהנות מהמנות שלנו גם בבית או בעבודה."
            },
            {
              question: "מה שעות הפתיחה של SO WHAT?",
              answer:
                "שעות הפעילות עשויות להשתנות בהתאם ליום ולמועדים. מומלץ לבדוק את שעות הפתיחה המעודכנות באתר לפני ההגעה או ביצוע ההזמנה."
            },
            {
              question: "מה יש בתפריט של SO WHAT?",
              answer:
                "בתפריט תמצאו מגוון המבורגרים, סמאש בורגר, תוספות, מנות צד ורטבים. ניתן לצפות בתפריט המלא באתר ולבחור את המנה שמתאימה לכם."
            }
          ]
        }
      },
      about: {
        sectionTitle: "הסיפור שמאחורי SO WHAT",
        introduction: joinParagraphs([
          "SO WHAT נולדה מתוך מחשבה פשוטה: להכין המבורגר מחומרי גלם איכותיים, בלי קיצורי דרך ובלי להתפשר על הטעם.",
          "הבשר נטחן במקום מדי יום, כל מנה עולה לפלנצ׳ה רק אחרי ההזמנה, וכל מרכיב נבחר בקפידה - מהלחמנייה ועד הרטבים."
        ]),
        bottomContent: joinParagraphs([
          "מאחורי המותג עומדים אנשים שאוהבים המבורגר אמיתי: דיוק בהכנה, עקביות בכל ביס, ושירות שמכבד את מי שבא אלינו.",
          "רוצים להכיר את SO WHAT ברעננה מקרוב? בדף הבית תמצאו את החוויה המלאה, ובתפריט - את המנות עצמן."
        ]),
        cta: {
          title: "הכירו את SO WHAT",
          body: "לדף הבית של SO WHAT ברעננה - שם מתחיל הסיפור.",
          buttonLabel: "לדף הבית",
          buttonHref: "/"
        }
      },
      menu: {
        introduction: joinParagraphs([
          "ברוכים הבאים לתפריט המבורגרים של SO WHAT ברעננה - מסעדת המבורגרים הכשרה שבה כל מנה נולדת על הפלנצ׳ה החמה. כאן מרכזים חוויית המבורגר כשר: בשר בקר איכותי שנטחן במקום מדי יום, לחמנייה רכה, ירקות טריים ורטבים ביתיים. כל המבורגר נצלה לפי הזמנה - עסיסי, מדויק ובלתי מתפשר.",
          "בתפריט תמצאו את כל מה שצריך לארוחה שלמה: המבורגרים שלנו - מהקלאסי ועד גרסאות עם איולי כמהין או שום קונפי; ארוחות שמשלבות מנה, תוספת לבחירה ושתייה קלה; תוספות כמו צ'יפס, כנפיים ונאגטס; סלטים טריים מהמטבח; רטבים שמכינים במקום; ושתייה קרה שמשלימה את הביס. בין אם אתם מגיעים לסניף, מזמינים לאיסוף עצמי או במשלוח - התפריט נשאר אותו דבר: איכות, טריות וטעם.",
          "ב-SO WHAT אנחנו מאמינים שהמבורגר טוב מתחיל בחומרי גלם ומסתיים בחוויה שנשארת איתכם. גללו בין הקטגוריות, בחרו את המנה שמתאימה לכם, והזמינו לאיסוף עצמי או במשלוח. נתראה ברחוב אחוזה 96, רעננה - המקום שבו המבורגרים באמת מרגישים שונים."
        ]),
        categoryIntros: {
          "cat-burgers":
            "מחפשים המבורגר כשר? קציצות בקר שנטחנות במקום ועולות ישר לפלנצ׳ה - כולל סמאש בורגר ווריאציות הבית עם איולי כמהין, קונפי או גבינה נמסה.",
          "cat-meals":
            "ארוחת המבורגר בצלחת אחת - המבורגר שבחרתם, תוספת לבחירה ושתייה קלה. נוח לצהריים, לערב או עם חברים.",
          "cat-sides":
            "תוספות שמשלימות את הביס: צ'יפס פריך עם תיבול הבית, הום פרייז זהוב, כנפיים עסיסיות או נאגטס פריכים. אידיאלי ליד ההמבורגר, לשיתוף על השולחן או כמנה קלה בפני עצמה - תמיד טרי, תמיד מדויק.",
          "cat-salads":
            "סלטים טריים מהמטבח - עלי בייבי, חסה רומaine, קרוטונים, פרמזן ורטבים שמכינים במקום. איזון מושלם ליד המבורגר: קל, מרענן ועשיר בטעם, בלי להתפשר על איכות חומרי הגלם.",
          "cat-sauces":
            "רטבים ביתיים שמרימים כל מנה - מאיולי כמהין ועד צ'יפוטלה מעושן, דבש-חרדל, שום קונפי, קטשופ ומיונז קלאסי. כל רוטב מוכן אצלנו ומותאם ללחמנייה, לתוספות ולטעם האישי שלכם.",
          "cat-soft-drinks":
            "שתייה קלה וקרה שמשלימה את הארוחה - מים, סודה, לימונדה, קולה, ספרייט, פאנטה, ענבים ותה קר. בחירה פשוטה ומרעננת ליד ההמבורגר, הארוחה או התוספת שבחרתם.",
          "cat-beers":
            "בירות בקבוק מצוינות לליווי ארוחת המבורגר - קורונה, Stella Artois, Heineken וגולדסטאר. לשתות בקצב שלכם, ליד המנה שעל השולחן, באווירה הלא-פורמלית של SO WHAT."
        },
        categoryPages: {
          "cat-burgers": {
            metaTitle: "המבורגר כשר | SO WHAT",
            metaDescription:
              "המבורגר כשר של SO WHAT - בשר טרי הנטחן במקום, הכנה על הפלנצ׳ה, וסמאש בורגר לצד מגוון המבורגרים בתפריט."
          },
          "cat-meals": {
            metaTitle: "ארוחת המבורגר | SO WHAT",
            metaDescription:
              "ארוחות המבורגר של SO WHAT - המבורגר, תוספת ושתייה בארוחה אחת. נוח לצהריים, לערב או עם חברים."
          }
        }
      },
      locations: {
        introduction: joinParagraphs([
          "עמוד המיקום והשעות של SO WHAT מרכז את פרטי הסניף ברעננה: כתובת, שעות פעילות, איך מגיעים, איסוף עצמי ואזורי משלוח.",
          "לפני ביקור או הזמנה - בדקו כאן את השעות המעודכנות ואת אזורי החלוקה."
        ]),
        bottomContent: joinParagraphs([
          "הסניף ברחוב אחוזה 96 מציע ישיבה במקום, איסוף עצמי ומשלוחים לפי אזורי החלוקה.",
          "רוצים להכיר קודם את המותג והתפריט? חזרו לדף הבית של SO WHAT או עברו לתפריט המלא."
        ]),
        cta: {
          title: "SO WHAT רעננה",
          body: "לחוויית המסעדה המלאה - דף הבית של SO WHAT.",
          buttonLabel: "לדף הבית",
          buttonHref: "/"
        }
      },
      kosher: {
        sectionTitle: "כשר בהשגחת רבנות",
        introduction: joinParagraphs([
          "SO WHAT היא מסעדת המבורגרים כשרה בהשגחת רבנות.",
          "בעמוד זה יופיע מידע מעודכן על הכשרות, ההשגחה ופרטים נוספים - התוכן יעודכן מהפאנל הניהולי."
        ]),
        bottomContent: joinParagraphs([
          "שאלות על כשרות? צרו קשר עם הסניף או עקבו אחרי העדכונים כאן."
        ]),
        cta: {
          title: "מוכנים להזמין?",
          body: "עברו לתפריט ובחרו את המנה שלכם.",
          buttonLabel: "לתפריט",
          buttonHref: "/menu"
        }
      },
      privacy: {},
      terms: {}
    };
  }

  if (locale === "en") {
    return {
      home: {
        sectionTitle: "Not just another burger.",
        introduction: joinParagraphs([
          "At SO WHAT, we believe quality doesn't need a long explanation.",
          "Premium beef, ground in-house every day.",
          "Fresh brioche buns.",
          "House-made sauces.",
          "Ingredients chosen with care."
        ]),
        bottomContent: joinParagraphs([
          "Every burger is seared to order and served exactly as it should be - juicy, precise, and uncompromising.",
          "Because in the end, you don't need to reinvent the burger.",
          "Just make it the way it should be."
        ]),
        faq: {
          kicker: "FAQ",
          title: "Questions & Answers",
          lead: "Everything worth knowing before your next bite.",
          items: [
            {
              question: "Where can I eat kosher burgers in Ra'anana?",
              answer:
                "SO WHAT offers a kosher burger experience in Ra'anana with juicy burgers, quality ingredients, and food made fresh on site. Dine in or order delivery."
            },
            {
              question: "What kosher certification does SO WHAT have?",
              answer:
                "SO WHAT is a kosher restaurant operating under rabbinical supervision. Our meat menu suits kosher-keeping guests and includes burgers and more."
            },
            {
              question: "What makes SO WHAT's smash burger special?",
              answer:
                "Our smash burger uses beef seared on a hot surface for a rich crust and deep flavor, served with toppings and sauces that complete the bite."
            },
            {
              question: "Can I order SO WHAT delivery?",
              answer:
                "Yes. Order delivery in Ra'anana and available delivery zones and enjoy our food at home or work."
            },
            {
              question: "What are SO WHAT's opening hours?",
              answer:
                "Hours may vary by day and season. Check the latest opening hours on the site before visiting or ordering."
            },
            {
              question: "What's on the SO WHAT menu?",
              answer:
                "The menu includes burgers, smash burgers, sides, and sauces. Browse the full menu online and pick your dish."
            }
          ]
        }
      },
      about: {
        sectionTitle: "SO WHAT - where every bite feels different",
        introduction: joinParagraphs([
          "Kosher burgers from quality beef, fresh ingredients, and a dining experience built from a real love of the craft.",
          "At SO WHAT we believe a great burger starts with ingredients and ends with an experience that stays with you. Every dish is made in-house with quality beef, fresh vegetables, special sauces, and carefully chosen buns."
        ]),
        bottomContent: joinParagraphs([
          "We opened SO WHAT to bring Ra'anana a kosher burger experience at the highest level - without compromising on quality, taste, or service."
        ])
      },
      menu: {
        introduction: joinParagraphs([
          "Welcome to the SO WHAT menu in Ra'anana - a kosher burger restaurant where every dish starts on a hot plancha. Premium kosher burgers: quality beef ground in-house daily, soft buns, fresh vegetables, and house-made sauces.",
          "Our full menu covers everything for a complete meal: burgers from classic to truffle aioli and confit garlic; combo meals with a side and soft drink; crispy sides; fresh salads; house sauces; and cold drinks.",
          "Browse the categories, pick your dish, and order for pickup or delivery - 96 Ahuza St., Ra'anana."
        ]),
        categoryIntros: {
          "cat-burgers":
            "Beef patties ground in-house and seared on the plancha - where crust, juiciness, and depth of flavor come together.",
          "cat-meals":
            "Complete meals on one plate - your burger, a side of your choice, and a soft drink.",
          "cat-sides":
            "Sides that complete the bite: crispy fries, golden home fries, juicy wings, or crunchy nuggets.",
          "cat-salads":
            "Fresh salads from the kitchen - baby leaves, romaine, croutons, parmesan, and dressings made in-house.",
          "cat-sauces":
            "House sauces that elevate every dish - from truffle aioli to smoky chipotle, honey mustard, confit garlic, ketchup, and classic mayo.",
          "cat-soft-drinks":
            "Cold soft drinks to round out your meal - water, soda, lemonade, cola, Sprite, Fanta, grape juice, and iced tea.",
          "cat-beers":
            "Bottled beers that pair well with a burger meal - Corona, Stella Artois, Heineken, and Goldstar."
        }
      },
      locations: {
        introduction: joinParagraphs([
          "Find SO WHAT in Ra'anana - address, hours, navigation, and delivery areas.",
          "Dine in or order delivery to nearby zones."
        ])
      },
      kosher: {
        sectionTitle: "Kosher under rabbinate supervision",
        introduction: joinParagraphs([
          "SO WHAT is a kosher burger restaurant under rabbinate supervision.",
          "Updated kashrut details will appear on this page - content is managed from the admin panel."
        ]),
        cta: {
          title: "Ready to order?",
          body: "Browse the menu and pick your meal.",
          buttonLabel: "View menu",
          buttonHref: "/menu"
        }
      },
      privacy: {},
      terms: {}
    };
  }

  return {
    home: {
      sectionTitle: "Pas un burger de plus.",
      introduction: joinParagraphs([
        "Chez SO WHAT, nous croyons que la qualité n'a pas besoin de longs discours.",
        "Bœuf de qualité, haché sur place chaque jour.",
        "Pains briochés frais.",
        "Sauces préparées sur place.",
        "Des ingrédients choisis avec soin."
      ]),
      bottomContent: joinParagraphs([
        "Chaque burger est saisi à la commande et servi exactement comme il se doit - juteux, précis, sans compromis.",
        "Parce qu'au fond, il n'est pas nécessaire de réinventer le burger.",
        "Il suffit de le préparer comme il se doit."
      ]),
      faq: {
        kicker: "FAQ",
        title: "Questions & réponses",
        lead: "L'essentiel à savoir avant votre prochaine bouchée.",
        items: [
          {
            question: "Où manger un burger casher à Ra'anana ?",
            answer:
              "SO WHAT propose une expérience burger casher à Ra'anana, avec des burgers juteux et des produits frais préparés sur place. Sur place ou en livraison."
          },
          {
            question: "Quelle certification casher pour SO WHAT ?",
            answer:
              "SO WHAT est un restaurant casher sous supervision rabbinique. Notre carte de viande convient aux observateurs de la cacherout."
          },
          {
            question: "Qu'est-ce qui rend le smash burger SO WHAT spécial ?",
            answer:
              "Notre smash burger utilise un bœuf saisi sur surface chaude pour une croûte riche et une saveur profonde."
          },
          {
            question: "Livraison SO WHAT ?",
            answer: "Oui. Commandez en livraison à Ra'anana et dans les zones disponibles."
          },
          {
            question: "Quels sont les horaires ?",
            answer: "Les horaires peuvent varier. Consultez le site avant votre visite."
          },
          {
            question: "Que propose la carte ?",
            answer: "Burgers, smash burgers, accompagnements et sauces. Parcourez la carte en ligne."
          }
        ]
      }
    },
    about: {
      sectionTitle: "SO WHAT - où chaque bouchée compte",
      introduction: joinParagraphs([
        "Burgers casher au bœuf de qualité, ingrédients frais et une expérience culinaire sincère.",
        "Chez SO WHAT, un bon burger commence par les ingrédients et se termine par une expérience mémorable."
      ]),
      bottomContent: joinParagraphs([
        "Nous avons créé SO WHAT pour offrir à Ra'anana une expérience burger casher d'excellence."
      ])
    },
    menu: {
      introduction: joinParagraphs([
        "Bienvenue sur la carte des burgers SO WHAT à Ra'anana - restaurant casher où chaque plat naît sur la plancha.",
        "Notre carte complète : burgers, formules, accompagnements, salades, sauces et boissons fraîches.",
        "Parcourez les catégories et commandez - 96 rue Ahuza, Ra'anana."
      ]),
      categoryIntros: {
        "cat-burgers":
          "Steaks hachés préparés sur place et saisis sur la plancha - croûte, jus et profondeur de saveur.",
        "cat-meals": "Formules complètes - burger, accompagnement et boisson.",
        "cat-sides": "Accompagnements croustillants : frites, wings, nuggets.",
        "cat-salads": "Salades fraîches du kitchen avec vinaigrettes maison.",
        "cat-sauces": "Sauces maison pour relever chaque plat.",
        "cat-soft-drinks": "Boissons fraîches pour compléter le repas.",
        "cat-beers": "Bières en bouteille - Corona, Stella, Heineken, Goldstar."
      }
    },
    locations: {
      introduction: joinParagraphs([
        "Trouvez SO WHAT à Ra'anana - adresse, horaires et zones de livraison.",
        "Sur place ou en livraison."
      ])
    },
    kosher: {
      sectionTitle: "Casher sous supervision rabbinique",
      introduction: joinParagraphs([
        "SO WHAT est un restaurant de burgers casher sous supervision rabbinique.",
        "Les détails de cacherout mis à jour apparaîtront sur cette page - le contenu est géré depuis l'administration."
      ]),
      cta: {
        title: "Prêt à commander ?",
        body: "Parcourez la carte et choisissez votre plat.",
        buttonLabel: "Voir la carte",
        buttonHref: "/menu"
      }
    },
    privacy: {},
    terms: {}
  };
}

export function getDefaultSeoPageFields(
  locale: Locale,
  pageId: SeoPageId
): SeoPageFieldsInput {
  const metaDefaults =
    PAGE_META_DEFAULTS[locale]?.[pageId] ?? PAGE_META_DEFAULTS.he[pageId] ?? {};
  const pageDefaults = pagesForLocale(locale)[pageId] ?? {};

  return {
    ...metaDefaults,
    ...pageDefaults
  };
}

export function getDefaultPageMeta(
  locale: Locale,
  pageId: SeoPageId
): { title: string; description: string } {
  const fields = getDefaultSeoPageFields(locale, pageId);
  return {
    title: fields.metaTitle?.trim() ?? "",
    description: fields.metaDescription?.trim() ?? ""
  };
}

export function getDefaultSeoCategoryIntroIds(): readonly string[] {
  return MENU_CATEGORY_IDS;
}
