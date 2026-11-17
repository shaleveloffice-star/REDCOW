import fs from "node:fs";

const pages = [
  "/stories/burger-sauces-selection",
  "/stories/fixed-burger-recipe",
  "/stories/vegetarian-burger-development",
  "/stories/behind-the-scenes-burger",
  "/menu/so-smash",
  "/stories/kosher-burger"
];

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<\/(p|h1|h2|h3|h4|li|div|section|article)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, "[$3]($2)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const out = {};
for (const path of pages) {
  const html = await (await fetch(`https://www.sowhat.co.il${path}`, { signal: AbortSignal.timeout(30000) })).text();
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  const text = strip(main);
  out[path] = text;
  console.log("\n====", path, "====\n");
  console.log(text.slice(0, 3500));
}

fs.writeFileSync("artifacts/page-content-extract.json", JSON.stringify(out, null, 2), "utf8");
console.log("\nWrote artifacts/page-content-extract.json");
