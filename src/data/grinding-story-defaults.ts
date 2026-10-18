import type { Locale } from "@/i18n/config";
import type { SeoStoryBlock } from "@/types/seo-content";

export const GRINDING_STORY_DEFAULTS: Record<Locale, SeoStoryBlock> = {
  he: {
    title: "הטעם מתחיל בטחינה. בכל יום מחדש.",
    introduction: "אצלנו ב-SO WHAT, ההמבורגר מתחיל בבשר טרי שמגיע למסעדה ונטחן כאן במקום מדי יום. אנחנו מקפידים על חומרי גלם טריים ועל הכנה מדויקת, כי הבסיס לביס עסיסי באמת מתחיל הרבה לפני שהקציצה פוגשת את הפלנצ׳ה.",
    bottomContent: `הבשר עובר בדיקות ובקרת כשרות מדי יום, תחת פיקוח ובהקפדה על כל שלב בדרך. מהקבלה במסעדה ועד הטחינה במקום, אנחנו נותנים תשומת לב לפרטים שמרכיבים את המנה שלכם.

טרי שמגיע. טרי שנטחן. טעם שמרגישים בכל ביס.

ככה אנחנו אוהבים להכין המבורגר כשר ברעננה: עם בשר טרי, עבודה יומיומית והרבה כבוד לחומר הגלם.`
  },
  en: {
    title: "Great flavor starts with a fresh grind. Every day.",
    introduction: "At SO WHAT, every burger starts with fresh beef delivered to our restaurant and ground here daily. We care about fresh ingredients and careful preparation, because a truly juicy bite begins long before the patty meets the plancha.",
    bottomContent: `Our beef undergoes daily checks, including kosher supervision. From arrival at the restaurant to grinding in-house, we pay attention to every step that goes into your meal.

Delivered fresh. Ground fresh. Flavor in every bite.

That is how we make a kosher burger in Raanana: fresh beef, daily preparation and respect for the ingredients.`
  },
  fr: {
    title: "Le goût commence par une viande fraîchement hachée.",
    introduction: "Chez SO WHAT, chaque burger commence par une viande fraîche livrée au restaurant et hachée sur place chaque jour. Des ingrédients frais et une préparation soignée : une bouchée juteuse se prépare bien avant que le steak ne touche la plancha.",
    bottomContent: `La viande fait l’objet de contrôles quotidiens, notamment de cacherout, sous supervision. De sa réception au restaurant jusqu’au hachage sur place, nous veillons à chaque étape de votre repas.

Livrée fraîche. Hachée sur place. Du goût à chaque bouchée.

Notre façon de préparer un burger casher à Raanana : de la viande fraîche, un travail quotidien et le respect des ingrédients.`
  }
};
