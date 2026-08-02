import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const brandSourcesDir = path.join(root, "brand-sources");
const brandDir = path.join(root, "public/images/brand");
const wordmarkSource = path.join(brandSourcesDir, "nb-burger-logo-source.png");
const iconSource = path.join(brandSourcesDir, "nb-burger-icon-source.png");

const iconsOnly = process.argv.includes("--icons-only");

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

/** Build multi-size favicon.ico (16/32/48) from square logo artwork. */
async function buildFaviconIco(sourcePngBuffer) {
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(sizes.map((size) => squareLogo(sourcePngBuffer, size)));

  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];

  for (let i = 0; i < count; i += 1) {
    const size = sizes[i];
    const png = pngBuffers[i];
    entries.push({ size, png, offset });
    offset += png.length;
  }

  const totalSize = offset;
  const buffer = Buffer.alloc(totalSize);

  buffer.writeUInt16LE(0, 0);
  buffer.writeUInt16LE(1, 2);
  buffer.writeUInt16LE(count, 4);

  entries.forEach((entry, index) => {
    const base = 6 + index * 16;
    buffer.writeUInt8(entry.size === 256 ? 0 : entry.size, base);
    buffer.writeUInt8(entry.size === 256 ? 0 : entry.size, base + 1);
    buffer.writeUInt8(0, base + 2);
    buffer.writeUInt8(0, base + 3);
    buffer.writeUInt16LE(1, base + 4);
    buffer.writeUInt16LE(32, base + 6);
    buffer.writeUInt32LE(entry.png.length, base + 8);
    buffer.writeUInt32LE(entry.offset, base + 12);
    entry.png.copy(buffer, entry.offset);
  });

  return buffer;
}

async function resolveIconSourceBuffer() {
  try {
    return await fs.readFile(iconSource);
  } catch {
    return fs.readFile(wordmarkSource);
  }
}

async function generateIcons() {
  const sourceBuffer = await resolveIconSourceBuffer();
  const trimmed = await sharp(sourceBuffer).trim().png().toBuffer();
  const darkTransparent = await blackOnTransparent(await readRgba(trimmed));
  const darkPng = await darkTransparent.png().toBuffer();

  const logoMaster = await squareLogo(darkPng, 512, "#ffffff");
  await fs.writeFile(path.join(brandDir, "nb-burger-logo.png"), logoMaster);
  console.log("wrote", path.join(brandDir, "nb-burger-logo.png"));

  const iconOutputs = [
    { file: "public/icon.png", size: 512 },
    { file: "public/apple-touch-icon.png", size: 180 },
    { file: "public/icons/icon-16.png", size: 16 },
    { file: "public/icons/icon-32.png", size: 32 },
    { file: "public/icons/icon-48.png", size: 48 },
    { file: "public/icons/icon-192.png", size: 192 },
    { file: "public/icons/icon-512.png", size: 512 },
    { file: "src/app/icon.png", size: 512 },
    { file: "src/app/apple-icon.png", size: 180 }
  ];

  for (const { file, size } of iconOutputs) {
    const buffer = await squareLogo(darkPng, size, "#ffffff");
    const target = path.join(root, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, buffer);
    console.log("wrote", file, `${size}x${size}`);
  }

  const faviconIco = await buildFaviconIco(darkPng);
  for (const file of ["public/favicon.ico", "src/app/favicon.ico"]) {
    await fs.writeFile(path.join(root, file), faviconIco);
    console.log("wrote", file);
  }
}

async function generateWordmarks() {
  const sourceBuffer = await fs.readFile(wordmarkSource);
  const trimmed = await sharp(sourceBuffer).trim().png().toBuffer();
  const darkTransparent = await blackOnTransparent(await readRgba(trimmed));
  const darkPng = await darkTransparent.png().toBuffer();
  const lightPng = await whiteOnTransparent(darkPng).then((img) => img.png().toBuffer());

  const outputs = [
    ["nb-burger-wordmark-dark.png", darkPng],
    ["nb-burger-wordmark-dark.webp", await sharp(darkPng).webp({ quality: 92 }).toBuffer()],
    ["nb-burger-wordmark-light.png", lightPng],
    ["nb-burger-wordmark-light.webp", await sharp(lightPng).webp({ quality: 92 }).toBuffer()],
    ["nb-burger-wordmark-alpha.png", darkPng],
    ["nb-burger-wordmark-alpha.webp", await sharp(darkPng).webp({ quality: 92 }).toBuffer()]
  ];

  for (const [fileName, buffer] of outputs) {
    const target = path.join(brandDir, fileName);
    await fs.writeFile(target, buffer);
    console.log("wrote", target);
  }
}

await generateIcons();
if (!iconsOnly) {
  await generateWordmarks();
}
