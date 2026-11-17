const checks = [
  {
    src: "/stories/burger-sauces-selection",
    href: "/menu/sauces",
    label: "הרטבים בתפריט SO WHAT"
  },
  {
    src: "/stories/fixed-burger-recipe",
    href: "/menu/hamburger-so-classic",
    label: "המבורגר SO קלאסי"
  },
  {
    src: "/stories/vegetarian-burger-development",
    href: "/menu/hamburger-nb-vegan",
    label: "ההמבורגר הטבעוני שלנו"
  },
  {
    src: "/stories/behind-the-scenes-burger",
    href: "/stories/fixed-burger-recipe",
    label: "איך שומרים על מתכון קבוע"
  },
  {
    src: "/menu/so-smash",
    href: "/stories/smash-burger-crispy-edges",
    label: "מה יוצר את הקצוות הקריספיים"
  },
  {
    src: "/stories/kosher-burger",
    href: "/",
    label: "המבורגר ברעננה"
  }
];

function contentAnchors(html, href, label) {
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  const re = new RegExp(
    `<a\\b[^>]*href=["']${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>([\\s\\S]*?)<\\/a>`,
    "gi"
  );
  return [...main.matchAll(re)]
    .map((m) => ({ tag: m[0], text: m[1].replace(/<[^>]+>/g, "").trim() }))
    .filter((a) => a.text.includes(label) || a.tag.includes("seo-inline-link") || a.tag.includes("story-long-content-link"));
}

for (const check of checks) {
  const res = await fetch(`https://www.sowhat.co.il${check.src}`, {
    signal: AbortSignal.timeout(30000),
    headers: { "cache-control": "no-cache" }
  });
  const html = await res.text();
  const hits = contentAnchors(html, check.href, check.label);
  const hasExact = hits.some((h) => h.text === check.label || h.text.includes(check.label));
  console.log(
    JSON.stringify(
      {
        src: check.src,
        status: res.status,
        href: check.href,
        label: check.label,
        found: hasExact,
        hitCount: hits.length,
        sample: hits[0] ?? null,
        xvercelid: res.headers.get("x-vercel-id"),
        cache: res.headers.get("x-vercel-cache")
      },
      null,
      2
    )
  );
}
