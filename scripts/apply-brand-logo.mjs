import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const brandDir = path.join(root, "public/images/brand");
const source = path.join(brandDir, "nb-burger-logo-source.png");

async function readRgba(input) {
  const image = sharp(input).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  return { pixels: new Uint8ClampedArray(data), info };
}

/** Turn near-white pixels transparent; keep logo ink opaque. */
function blackOnTransparent({ pixels, info }) {
  const next = new Uint8ClampedArray(pixels);
  for (let i = 0; i < next.length; i += 4) {
    const r = next[i];
    const g = next[i + 1];
    const b = next[i + 2];
    if (r > 235 && g > 235 && b > 235) {
      next[i + 3] = 0;
    } else {
      next[i] = 0;
      next[i + 1] = 0;
      next[i + 2] = 0;
      next[i + 3] = 255;
    }
  }
  return sharp(Buffer.from(next), {
    raw: { width: info.width, height: info.height, channels: 4 }
  });
}

/** Invert opaque logo pixels to white; preserve alpha. */
async function whiteOnTransparent(blackTransparentBuffer) {
  const { pixels, info } = await readRgba(blackTransparentBuffer);
  const next = new Uint8ClampedArray(pixels);
  for (let i = 0; i < next.length; i += 4) {
    if (next[i + 3] > 0) {
      next[i] = 255;
      next[i + 1] = 255;
      next[i + 2] = 255;
    }
  }
  return sharp(Buffer.from(next), {
    raw: { width: info.width, height: info.height, channels: 4 }
  });
}

async function squareLogo(inputBuffer, size, background = "#ffffff") {
  return sharp(inputBuffer)
    .resize(size, size, { fit: "contain", background })
    .flatten({ background })
    .png()
    .toBuffer();
}

const sourceBuffer = await fs.readFile(source);
const trimmed = await sharp(sourceBuffer).trim().png().toBuffer();
const darkTransparent = await blackOnTransparent(await readRgba(trimmed));
const darkPng = await darkTransparent.png().toBuffer();
const lightPng = await whiteOnTransparent(darkPng).then((img) => img.png().toBuffer());

const outputs = [
  ["nb-burger-wordmark-dark.png", darkPng],
  ["nb-burger-wordmark-dark.webp", await sharp(darkPng).webp({ quality: 92 }).toBuffer()],
  ["nb-burger-wordmark-light.png", lightPng],
  ["nb-burger-wordmark-light.webp", await sharp(lightPng).webp({ quality: 92 }).toBuffer()],
  // Backward-compatible aliases (dark = default file name used in older code paths)
  ["nb-burger-wordmark-alpha.png", darkPng],
  ["nb-burger-wordmark-alpha.webp", await sharp(darkPng).webp({ quality: 92 }).toBuffer()]
];

for (const [fileName, buffer] of outputs) {
  const target = path.join(brandDir, fileName);
  await fs.writeFile(target, buffer);
  console.log("wrote", target);
}

const logoMaster = await squareLogo(darkPng, 512, "#ffffff");
await fs.writeFile(path.join(brandDir, "nb-burger-logo.png"), logoMaster);
console.log("wrote", path.join(brandDir, "nb-burger-logo.png"));

const iconOutputs = [
  { file: "public/icon.png", size: 512 },
  { file: "public/apple-touch-icon.png", size: 180 },
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 }
];

for (const { file, size } of iconOutputs) {
  const buffer = await squareLogo(darkPng, size, "#ffffff");
  await fs.writeFile(path.join(root, file), buffer);
  console.log("wrote", file, size);
}

const favicon32 = await squareLogo(darkPng, 32, "#ffffff");
await fs.writeFile(path.join(root, "public/favicon.ico"), favicon32);
console.log("wrote public/favicon.ico");
