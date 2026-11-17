const html = await (await fetch("https://www.sowhat.co.il/stories/kosher-burger")).text();
const chunkUrls = [
  ...html.matchAll(/\/_next\/static\/chunks\/[^"']+\.js/g),
  ...html.matchAll(/\/_next\/static\/[^"']+\/_buildManifest\.js/g)
].map((m) => m[0]);
const unique = [...new Set(chunkUrls)];
console.log("chunks", unique.length);

let found = null;
for (const path of unique) {
  const js = await (await fetch(`https://www.sowhat.co.il${path}`)).text();
  if (!/AIza[0-9A-Za-z_-]{20,}/.test(js) && !js.includes("firebaseConfig") && !js.includes("projectId")) {
    continue;
  }
  const key = js.match(/AIza[0-9A-Za-z_-]{35,}/);
  const projectId =
    js.match(/projectId["']?\s*[:=]\s*["']([a-z0-9-]+)["']/i) ||
    js.match(/([a-z0-9-]+)\.firebaseapp\.com/);
  if (key || projectId) {
    found = {
      path,
      apiKey: key?.[0] ?? null,
      projectHint: projectId?.[1] ?? projectId?.[0] ?? null,
      hasFirebase: /firebase/i.test(js)
    };
    // keep searching for a full config
    const authDomain = js.match(/([a-z0-9-]+)\.firebaseapp\.com/);
    const storage = js.match(/([a-z0-9-]+)\.appspot\.com/);
    if (key && authDomain) {
      found = {
        path,
        apiKey: key[0],
        authDomain: authDomain[0],
        storageBucket: storage?.[0] ?? null,
        projectId: authDomain[1]
      };
      break;
    }
  }
}
console.log(JSON.stringify(found, null, 2));
