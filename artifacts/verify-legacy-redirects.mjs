const paths = [
  ["/menu/hamburger-nb-classic", "/menu/hamburger-so-classic"],
  ["/menu/4-piece-nuggets", "/menu/nuggets-4"],
  ["/menu/nb-classic-meal", "/menu/so-classic-meal"],
  ["/menu/chili-chicken-wings", "/menu/wings-10"],
  ["/menu/hamburger-nb-confit", "/menu/so-house-burger"]
];

const hosts = [
  "https://nbburger.co.il",
  "https://www.nbburger.co.il",
  "http://nbburger.co.il",
  "http://www.nbburger.co.il",
  "https://sowhat.co.il",
  "https://www.sowhat.co.il",
  "http://sowhat.co.il",
  "http://www.sowhat.co.il"
];

const finalOrigin = "https://www.sowhat.co.il";

async function chain(url) {
  const hops = [];
  let cur = url;
  for (let i = 0; i < 8; i++) {
    const r = await fetch(cur, { redirect: "manual", signal: AbortSignal.timeout(25000) });
    const loc = r.headers.get("location");
    hops.push({ status: r.status, url: cur, location: loc });
    if (!loc || ![301, 302, 303, 307, 308].includes(r.status)) break;
    cur = new URL(loc, cur).href;
  }
  return hops;
}

function stripSlash(u) {
  return u.replace(/\/$/, "");
}

function fmt(hops) {
  return hops
    .map((h) => `${h.status} ${h.url}${h.location ? ` -> ${h.location}` : ""}`)
    .join("\n  ");
}

const rows = [];
for (const [oldPath, finalPath] of paths) {
  const expectedFinal = finalOrigin + finalPath;
  console.log(`\n######## ${oldPath} => ${finalPath} ########`);
  for (const host of hosts) {
    const start = host + oldPath;
    const hops = await chain(start);
    const last = hops[hops.length - 1];
    const seen = new Set();
    let loop = false;
    for (const h of hops) {
      if (seen.has(h.url)) loop = true;
      seen.add(h.url);
    }
    const endsOk = last.status === 200 && stripSlash(last.url) === expectedFinal;
    const redirectHops = hops.slice(0, -1);
    const lastRedirect = redirectHops[redirectHops.length - 1];
    const landsOnFinal =
      lastRedirect &&
      stripSlash(new URL(lastRedirect.location, lastRedirect.url).href) === expectedFinal;
    // Accept http->https upgrade before the final permanent hop.
    const pass = endsOk && !loop && landsOnFinal;
    rows.push({ start, pass, endsOk, loop, hopCount: hops.length });
    console.log(`${pass ? "PASS" : "FAIL"} ${start}`);
    console.log(`  ${fmt(hops)}`);
  }
}

const failed = rows.filter((r) => !r.pass);
console.log("\n==== SUMMARY ====");
console.log(
  JSON.stringify(
    {
      total: rows.length,
      passed: rows.filter((r) => r.pass).length,
      failed: failed.length,
      failedStarts: failed.map((f) => f.start)
    },
    null,
    2
  )
);
if (failed.length) process.exitCode = 1;
