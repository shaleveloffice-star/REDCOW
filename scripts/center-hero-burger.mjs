import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const input = path.join(root, "public/images/hero/nb-burger-hero-current.webp");
const output = path.join(root, "public/images/hero/nb-burger-hero-desktop.webp");

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

let minX = width;
let maxX = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a > 20 && r + g + b > 40) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
  }
}

const contentCenterX = (minX + maxX) / 2;
const shiftX = Math.round(width / 2 - contentCenterX);

console.log("contentCenterX", contentCenterX, "shiftX", shiftX);

const source = await sharp(input).toBuffer();

await sharp({
  create: {
    width,
    height,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 1 },
  },
})
  .composite([{ input: source, left: shiftX, top: 0 }])
  .webp({ quality: 86, effort: 6 })
  .toFile(output);

const verify = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let vMinX = width;
let vMaxX = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * channels;
    const r = verify.data[i];
    const g = verify.data[i + 1];
    const b = verify.data[i + 2];
    const a = verify.data[i + 3];

    if (a > 20 && r + g + b > 40) {
      vMinX = Math.min(vMinX, x);
      vMaxX = Math.max(vMaxX, x);
    }
  }
}

const newCenter = (vMinX + vMaxX) / 2;
console.log("verified content center", newCenter, "target", width / 2, "delta", newCenter - width / 2);
console.log("written", output);
