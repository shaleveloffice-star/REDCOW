import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const brandDir = path.join(root, "public/images/brand");
const source = path.join(brandDir, "nb-burger-logo-source.png");
const logoMaster = path.join(brandDir, "nb-burger-logo.png");
const wordmarkPng = path.join(brandDir, "nb-burger-wordmark-alpha.png");
const wordmarkWebp = path.join(brandDir, "nb-burger-wordmark-alpha.webp");

async function squareLogo(inputBuffer, size) {
  return sharp(inputBuffer)
    .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();
}

const sourceBuffer = await sharp(source).toBuffer();

const master512 = await squareLogo(sourceBuffer, 512);
await sharp(master512).toFile(logoMaster);
await sharp(master512).toFile(wordmarkPng);
await sharp(master512).webp({ quality: 90 }).toFile(wordmarkWebp);

console.log("wrote", logoMaster);
console.log("wrote", wordmarkPng);
console.log("wrote", wordmarkWebp);

const iconOutputs = [
  { file: "public/icon.png", size: 512 },
  { file: "public/apple-touch-icon.png", size: 180 },
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
];

for (const { file, size } of iconOutputs) {
  const buffer = await squareLogo(sourceBuffer, size);
  await sharp(buffer).toFile(path.join(root, file));
  console.log("wrote", file, size);
}

const favicon32 = await squareLogo(sourceBuffer, 32);
await sharp(favicon32).toFile(path.join(root, "public/favicon.ico"));
console.log("wrote public/favicon.ico");
