const html = await (await fetch("https://www.sowhat.co.il/")).text();
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
console.log("script count", scripts.length);
const apiKey = html.match(/AIza[0-9A-Za-z_-]{20,}/);
console.log("inline apiKey", apiKey ? apiKey[0].slice(0, 12) + "..." : null);

const candidates = scripts.filter((s) => /_next\/static/.test(s)).slice(0, 40);
let found = null;
for (const src of candidates) {
  const url = src.startsWith("http") ? src : `https://www.sowhat.co.il${src}`;
  const js = await (await fetch(url)).text();
  if (js.includes("apiKey") && js.includes("projectId") && js.includes("firebase")) {
    const key = js.match(/apiKey:"(AIza[^"]+)"/) || js.match(/apiKey:'(AIza[^']+)'/);
    const projectId =
      js.match(/projectId:"([^"]+)"/) || js.match(/projectId:'([^']+)'/);
    const authDomain =
      js.match(/authDomain:"([^"]+)"/) || js.match(/authDomain:'([^']+)'/);
    const appId = js.match(/appId:"([^"]+)"/) || js.match(/appId:'([^']+)'/);
    const messagingSenderId =
      js.match(/messagingSenderId:"([^"]+)"/) || js.match(/messagingSenderId:'([^']+)'/);
    const storageBucket =
      js.match(/storageBucket:"([^"]+)"/) || js.match(/storageBucket:'([^']+)'/);
    if (key && projectId) {
      found = {
        src,
        apiKey: key[1],
        projectId: projectId[1],
        authDomain: authDomain?.[1],
        appId: appId?.[1],
        messagingSenderId: messagingSenderId?.[1],
        storageBucket: storageBucket?.[1]
      };
      break;
    }
  }
}
console.log(JSON.stringify(found, null, 2));
