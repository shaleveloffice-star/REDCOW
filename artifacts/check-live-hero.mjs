const html = await (await fetch("https://www.sowhat.co.il/")).text();
const videos = [...new Set([...html.matchAll(/\/videos\/[^"'>\s]+\.mp4/g)].map((m) => m[0]))];
const blobs = [...new Set([...html.matchAll(/https:\/\/[^"'>\s]+\.mp4/g)].map((m) => m[0]))];
console.log({ videos, blobs: blobs.slice(0, 10) });
