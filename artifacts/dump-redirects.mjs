import mod from "../next.config.ts";
const config = mod?.default ?? mod;
console.log("keys", Object.keys(config || {}));
const r = await config.redirects();
const classic = r.filter((x) => String(x.source).includes("hamburger-nb-classic"));
const confit = r.filter((x) => String(x.source).includes("hamburger-nb-confit"));
const catchAlls = r.filter((x) => x.source === "/:path*" && x.has);

console.log("total", r.length);
console.log("classic rules", JSON.stringify(classic, null, 2));
console.log("confit rules", JSON.stringify(confit, null, 2));
console.log("catch-alls", JSON.stringify(catchAlls, null, 2));

const nbburgerBlock = [];
for (const rule of r) {
  const host = rule.has?.[0]?.value;
  if (host !== "nbburger\\.co\\.il") continue;
  nbburgerBlock.push({
    source: rule.source,
    destination: rule.destination
  });
  if (nbburgerBlock.length >= 12) break;
}
console.log("first nbburger.co.il rules", JSON.stringify(nbburgerBlock, null, 2));

const classicIdx = r.findIndex((x) => x.source === "/menu/hamburger-nb-classic" && x.has?.[0]?.value === "nbburger\\.co\\.il");
const catchIdx = r.findIndex((x) => x.source === "/:path*" && x.has?.[0]?.value === "nbburger\\.co\\.il");
console.log({ classicIdx, catchIdx, classicBeforeCatchAll: classicIdx >= 0 && classicIdx < catchIdx });
