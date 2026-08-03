import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import toIco from "to-ico";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src/app/icon.png");
const sizes = [16, 32, 48];

const pngBuffers = await Promise.all(
  sizes.map((size) => sharp(source).ensureAlpha().resize(size, size).png().toBuffer())
);

const ico = await toIco(pngBuffers);

for (const target of ["src/app/favicon.ico", "public/favicon.ico"]) {
  fs.writeFileSync(path.join(root, target), ico);
}

console.log("Regenerated favicon.ico (RGBA) -> src/app/favicon.ico, public/favicon.ico");
