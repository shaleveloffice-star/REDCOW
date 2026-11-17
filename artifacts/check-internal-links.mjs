const checks = [
  ["/stories/burger-sauces-selection", "/menu/sauces", "הרטבים בתפריט SO WHAT"],
  ["/stories/fixed-burger-recipe", "/menu/hamburger-so-classic", "המבורגר SO קלאסי"],
  ["/stories/vegetarian-burger-development", "/menu/hamburger-nb-vegan", "ההמבורגר הטבעוני שלנו"],
  ["/stories/behind-the-scenes-burger", "/stories/fixed-burger-recipe", "איך שומרים על מתכון קבוע"],
  ["/menu/so-smash", "/stories/smash-burger-crispy-edges", "מה יוצר את הקצוות הקריספיים"],
  ["/stories/kosher-burger", "/", "המבורגר ברעננה"]
];

function extractMainText(html) {
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  return main
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findAnchors(html, href) {
  const re = new RegExp(`<a\\b[^>]*href=["']${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "gi");
  return [...html.matchAll(re)].map((m) => m[0]);
}

for (const [src, href, text] of checks) {
  const res = await fetch(`https://www.sowhat.co.il${src}`, { signal: AbortSignal.timeout(30000) });
  const html = await res.text();
  const anchors = findAnchors(html, href);
  const textPresent = html.includes(text);
  const mdPresent = html.includes(`[${text}](${href})`);
  console.log(
    JSON.stringify(
      {
        src,
        status: res.status,
        href,
        text,
        existingAnchors: anchors.length,
        sampleAnchor: anchors[0] ?? null,
        textPresent,
        mdPresent,
        snippetAroundText: (() => {
          const plain = extractMainText(html);
          const idx = plain.indexOf(text.slice(0, Math.min(12, text.length)));
          if (idx < 0) return null;
          return plain.slice(Math.max(0, idx - 80), idx + 120);
        })()
      },
      null,
      2
    )
  );
}
