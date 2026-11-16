const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createLoader } = require("./helpers.cjs");

test("story and menu internal content links are added once and keep existing links", () => {
  const load = createLoader();
  const {
    enrichBrandStoryContentLinks,
    enrichMenuItemContentLinks
  } = load("@/lib/content/internal-content-links");

  const sauces = enrichBrandStoryContentLinks({
    id: "1",
    slug: "burger-sauces-selection",
    title: "רטבים",
    sections: [
      {
        type: "long-content",
        body: "רטבים קלאסיים מול תוספות סודיות\n\nאיולי שום ורטבים פיקנטיים. כבר יש [קישור קיים](/stories)."
      }
    ]
  });
  assert.match(sauces.sections[0].body, /\[הרטבים בתפריט SO WHAT\]\(\/menu\/sauces\)/);
  assert.match(sauces.sections[0].body, /\[קישור קיים\]\(\/stories\)/);
  const saucesAgain = enrichBrandStoryContentLinks(sauces);
  assert.equal(
    saucesAgain.sections[0].body.split("/menu/sauces").length - 1,
    sauces.sections[0].body.split("/menu/sauces").length - 1
  );

  const classic = enrichBrandStoryContentLinks({
    id: "2",
    slug: "fixed-burger-recipe",
    title: "מתכון",
    sections: [{ type: "long-content", body: "מתכון קבוע וקו קלאסי לאורך זמן." }]
  });
  assert.match(classic.sections[0].body, /\[המבורגר SO קלאסי\]\(\/menu\/hamburger-so-classic\)/);

  const vegan = enrichBrandStoryContentLinks({
    id: "3",
    slug: "vegetarian-burger-development",
    title: "צמחוני",
    sections: [{ type: "long-content", body: "פיתוח המבורגר צמחוני ללא בשר." }]
  });
  assert.match(vegan.sections[0].body, /\[ההמבורגר הטבעוני שלנו\]\(\/menu\/hamburger-nb-vegan\)/);

  const behind = enrichBrandStoryContentLinks({
    id: "4",
    slug: "behind-the-scenes-burger",
    title: "מאחורי",
    sections: [{ type: "long-content", body: "בסרוויס שומרים על דיוק ועקביות בכל מנה." }]
  });
  assert.match(behind.sections[0].body, /\[איך שומרים על מתכון קבוע\]\(\/stories\/fixed-burger-recipe\)/);

  const kosher = enrichBrandStoryContentLinks({
    id: "5",
    slug: "kosher-burger",
    title: "כשר",
    sections: [
      {
        type: "long-content",
        body: "לא משנה אם חיפשתם המבורגר ברעננה, המבורגר כשר ברעננה או פשוט מקום לאכול. כבר יש [מיקום](/locations)."
      }
    ]
  });
  assert.match(kosher.sections[0].body, /\[המבורגר ברעננה\]\(\/\)/);
  assert.match(kosher.sections[0].body, /\[מיקום\]\(\/locations\)/);

  const smash = enrichMenuItemContentLinks({
    id: "m1",
    slug: "so-smash",
    name: "SO Smash",
    categoryId: "c1",
    price: 56,
    isActive: true,
    sortOrder: 1,
    description: "",
    longDescription: "קציצות סמאש עם קרום קריספי על הפלנצ׳ה."
  });
  assert.match(
    smash.longDescription,
    /\[מה יוצר את הקצוות הקריספיים\]\(\/stories\/smash-burger-crispy-edges\)/
  );
});
