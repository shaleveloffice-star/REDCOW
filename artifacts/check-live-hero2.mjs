const html = await (await fetch("https://www.sowhat.co.il/", { headers: { "cache-control": "no-cache" } })).text();
const hero = html.match(/id="hero"[\s\S]{0,5000}/)?.[0] ?? "";
console.log(hero.slice(0, 2500));
console.log("---");
console.log("has video tag", /<video/i.test(hero));
console.log("mp4s", [...hero.matchAll(/[^"'=\s]+\.mp4/g)].map((m) => m[0]));
console.log("webps", [...hero.matchAll(/[^"'=\s]+\.webp/g)].map((m) => m[0]).slice(0, 8));
