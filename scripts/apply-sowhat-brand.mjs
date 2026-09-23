import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const assetsDir = path.join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "c-Users-OneDrive-Desktop-REDCOW-PROJECT",
  "assets"
);

const OUT = {
  logoSource: path.join(root, "brand-sources/nb-burger-logo-source.png"),
  iconSource: path.join(root, "brand-sources/nb-burger-icon-source.png"),
  siteLogo: path.join(root, "public/images/brand/nb-burger-logo.png"),
  wordmarkDarkPng: path.join(root, "public/images/brand/nb-burger-wordmark-dark.png"),
  wordmarkDarkWebp: path.join(root, "public/images/brand/nb-burger-wordmark-dark.webp"),
  wordmarkLightPng: path.join(root, "public/images/brand/nb-burger-wordmark-light.png"),
  wordmarkLightWebp: path.join(root, "public/images/brand/nb-burger-wordmark-light.webp"),
  wordmarkAlphaPng: path.join(root, "public/images/brand/nb-burger-wordmark-alpha.png"),
  wordmarkAlphaWebp: path.join(root, "public/images/brand/nb-burger-wordmark-alpha.webp"),
  loadingMark: path.join(root, "public/images/brand/nb-loading-mark.png"),
  loadingLarge: path.join(root, "public/images/brand/nb-burger-loading.png")
};

const WEBP_QUALITY = 88;

/** Only the SO WHAT files attached in the current rebrand handoff. */
const ALLOWED_IDS = [
  "ffce5e65-f649-41ab-9ba6-e420a609ba13",
  "21bff80c-89cc-40d4-8951-529f211bc7d5",
  "c43bc940-d381-4c5a-981d-be4e5ff9570f",
  "320247c7-6b4a-463d-9aed-a40018c394c9",
  "a3c8a4bf-50de-4440-85ae-9a9bf3aca58c",
  "924c517a-11d0-41b8-b9a2-d4863af6953d",
  "550afaee-4f33-49d7-a2fe-4e5056b5b0a9"
];

async function listUploads() {
  const names = await fs.readdir(assetsDir);
  return names
    .filter(
      (n) =>
        /\.(png|jpe?g|webp)$/i.test(n) &&
        ALLOWED_IDS.some((id) => n.includes(id))
    )
    .map((n) => path.join(assetsDir, n));
}

async function analyze(file) {
  const meta = await sharp(file).metadata();
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let dark = 0;
  let light = 0;
  let mid = 0;
  let ink = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 12) continue;
    const y = (data[i] + data[i + 1] + data[i + 2]) / 3;
    ink += 1;
    if (y < 35) dark += 1;
    else if (y > 185) light += 1;
    else mid += 1;
  }
  const lightRatio = ink ? light / ink : 0;
  const midRatio = ink ? mid / ink : 0;
  // Icon marks: tall capsule occupies less of frame; full logos have more mid/light ink area.
  // Heuristic: many light pixels + square + relatively compact → icon if light ink is oval-shaped.
  // Simpler: if filename order / aspect; count connected? Use lightRatio + whether image is mostly black.
  const blackBg = dark / Math.max(ink, 1) > 0.55;
  let kind = "unknown";
  if (blackBg && lightRatio > 0.08 && lightRatio < 0.35 && midRatio < 0.08) {
    // Could be icon or light wordmark. Wordmarks have more horizontal extent of light pixels.
    // Sample bounding box of light pixels.
    let minX = info.width;
    let minY = info.height;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const i = (y * info.width + x) * 4;
        if (data[i + 3] < 12) continue;
        const luma = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (luma > 185) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    const bw = Math.max(1, maxX - minX);
    const bh = Math.max(1, maxY - minY);
    const aspect = bw / bh;
    kind = aspect < 0.75 ? "icon-light" : "wordmark-light";
  } else if (blackBg && midRatio > 0.05 && lightRatio < 0.05) {
    kind = "wordmark-dark";
  } else if (blackBg && lightRatio >= 0.35) {
    kind = "wordmark-light";
  }
  return {
    file,
    base: path.basename(file),
    width: meta.width,
    height: meta.height,
    format: meta.format,
    size: (await fs.stat(file)).size,
    lightRatio,
    midRatio,
    darkRatio: ink ? dark / ink : 0,
    kind
  };
}

/** Black/near-black → transparent; keep light/mid ink colors. */
async function knockOutBlack(input, threshold = 42) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const next = Buffer.from(data);
  for (let i = 0; i < next.length; i += 4) {
    const y = (next[i] + next[i + 1] + next[i + 2]) / 3;
    if (y <= threshold) {
      next[i + 3] = 0;
    }
  }
  return sharp(next, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** Opaque pixels → solid black; preserve alpha. */
async function toBlackInk(transparentPng) {
  const { data, info } = await sharp(transparentPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const next = Buffer.from(data);
  for (let i = 0; i < next.length; i += 4) {
    if (next[i + 3] > 0) {
      next[i] = 18;
      next[i + 1] = 18;
      next[i + 2] = 18;
    }
  }
  return sharp(next, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** Opaque pixels → ivory; preserve alpha. */
async function toIvoryInk(transparentPng) {
  const { data, info } = await sharp(transparentPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const next = Buffer.from(data);
  for (let i = 0; i < next.length; i += 4) {
    if (next[i + 3] > 0) {
      next[i] = 245;
      next[i + 1] = 245;
      next[i + 2] = 240;
    }
  }
  return sharp(next, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function fitOnCanvas(pngBuffer, width, height, { maxFill = 0.86, background = { r: 0, g: 0, b: 0, alpha: 0 } } = {}) {
  const trimmed = await sharp(pngBuffer).trim({ threshold: 5 }).png().toBuffer();
  const meta = await sharp(trimmed).metadata();
  const targetW = Math.floor(width * maxFill);
  const targetH = Math.floor(height * maxFill);
  const scale = Math.min(targetW / meta.width, targetH / meta.height, 1);
  const rw = Math.max(1, Math.round(meta.width * scale));
  const rh = Math.max(1, Math.round(meta.height * scale));
  const resized = await sharp(trimmed).resize(rw, rh, { fit: "inside", kernel: sharp.kernel.lanczos3 }).png().toBuffer();
  return sharp({
    create: { width, height, channels: 4, background }
  })
    .composite([{ input: resized, gravity: "centre" }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function squareOpaque(pngBuffer, size, background = "#ffffff") {
  const trimmed = await sharp(pngBuffer).trim({ threshold: 5 }).png().toBuffer();
  return sharp(trimmed)
    .resize(size, size, { fit: "contain", background, kernel: sharp.kernel.lanczos3 })
    .flatten({ background })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function buildFaviconIco(sourcePngBuffer) {
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(sizes.map((size) => squareOpaque(sourcePngBuffer, size, "#ffffff")));
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];
  for (let i = 0; i < count; i += 1) {
    entries.push({ size: sizes[i], png: pngBuffers[i], offset });
    offset += pngBuffers[i].length;
  }
  const buffer = Buffer.alloc(offset);
  buffer.writeUInt16LE(0, 0);
  buffer.writeUInt16LE(1, 2);
  buffer.writeUInt16LE(count, 4);
  entries.forEach((entry, index) => {
    const base = 6 + index * 16;
    buffer.writeUInt8(entry.size, base);
    buffer.writeUInt8(entry.size, base + 1);
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

function fileSize(p) {
  return fs.stat(p).then((s) => s.size).catch(() => 0);
}

async function writeWithReport(target, buffer, beforeSizes) {
  const before = beforeSizes[target] ?? (await fileSize(target));
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer);
  const after = buffer.length;
  const saved = before ? (((before - after) / before) * 100).toFixed(1) : "n/a";
  console.log(
    `wrote ${path.relative(root, target)}  ${before}→${after} bytes (${saved}% vs previous)`
  );
  return { target, before, after };
}

async function main() {
  const uploads = await listUploads();
  if (!uploads.length) throw new Error(`No uploaded brand images in ${assetsDir}`);

  const analyses = [];
  for (const file of uploads) analyses.push(await analyze(file));
  console.log("Detected uploads:");
  for (const a of analyses) {
    console.log(`  ${a.kind.padEnd(16)} ${a.width}x${a.height} light=${a.lightRatio.toFixed(2)} mid=${a.midRatio.toFixed(2)}  ${a.base}`);
  }

  const icons = analyses.filter((a) => a.kind === "icon-light");
  const lightMarks = analyses.filter((a) => a.kind === "wordmark-light");
  if (!icons.length) throw new Error("No icon/burger-mark source detected");
  if (!lightMarks.length) throw new Error("No light wordmark/full logo source detected");

  // Prefer PNG over JPEG, then largest near-square sources.
  const score = (a) => {
    const aspect = a.width / a.height;
    const squarePenalty = Math.abs(1 - aspect);
    const formatBonus = /\.png$/i.test(a.file) ? 1.35 : 1;
    return a.size * formatBonus * (1 / (1 + squarePenalty * 2));
  };
  icons.sort((a, b) => score(b) - score(a));
  lightMarks.sort((a, b) => score(b) - score(a));
  const iconSrcFile = icons[0].file;
  const logoSrcFile = lightMarks[0].file;
  console.log("\nUsing icon source:", path.basename(iconSrcFile));
  console.log("Using logo/wordmark source:", path.basename(logoSrcFile));

  const beforeSizes = {};
  for (const p of Object.values(OUT)) beforeSizes[p] = await fileSize(p);
  const iconTargets = [
    "public/icon.png",
    "public/apple-touch-icon.png",
    "public/icons/icon-16.png",
    "public/icons/icon-32.png",
    "public/icons/icon-48.png",
    "public/icons/icon-192.png",
    "public/icons/icon-512.png",
    "src/app/icon.png",
    "src/app/apple-icon.png",
    "public/favicon.ico",
    "src/app/favicon.ico"
  ];
  for (const rel of iconTargets) beforeSizes[path.join(root, rel)] = await fileSize(path.join(root, rel));

  // Transparent light logo (ivory ink)
  const logoKnocked = await knockOutBlack(logoSrcFile, 48);
  const logoIvory = await toIvoryInk(logoKnocked);
  const logoBlack = await toBlackInk(logoKnocked);

  // Transparent icon (ivory capsule with transparent burger holes)
  const iconKnocked = await knockOutBlack(iconSrcFile, 48);
  const iconIvory = await toIvoryInk(iconKnocked);
  const iconBlack = await toBlackInk(iconKnocked);

  // 1-2 sources
  const logoSource512 = await fitOnCanvas(logoIvory, 512, 512, { maxFill: 0.88 });
  // Icon source: black mark on white is more reusable for scripts; also keep visual mark centered.
  // Store as ivory-on-transparent on square for brand fidelity, AND generate black-on-white for favicons.
  const iconSource512 = await fitOnCanvas(iconIvory, 512, 512, { maxFill: 0.78 });

  await writeWithReport(OUT.logoSource, logoSource512, beforeSizes);
  await writeWithReport(OUT.iconSource, iconSource512, beforeSizes);

  // 3 site logo — solid square for schema/OG-ish use: black ink on white
  const siteLogo = await squareOpaque(logoBlack, 512, "#ffffff");
  await writeWithReport(OUT.siteLogo, siteLogo, beforeSizes);

  // 4-6 wordmarks on 621x598 transparent
  const wmLight = await fitOnCanvas(logoIvory, 621, 598, { maxFill: 0.88 });
  const wmDark = await fitOnCanvas(logoBlack, 621, 598, { maxFill: 0.88 });
  await writeWithReport(OUT.wordmarkLightPng, wmLight, beforeSizes);
  await writeWithReport(
    OUT.wordmarkLightWebp,
    await sharp(wmLight).webp({ quality: WEBP_QUALITY, alphaQuality: 100 }).toBuffer(),
    beforeSizes
  );
  await writeWithReport(OUT.wordmarkDarkPng, wmDark, beforeSizes);
  await writeWithReport(
    OUT.wordmarkDarkWebp,
    await sharp(wmDark).webp({ quality: WEBP_QUALITY, alphaQuality: 100 }).toBuffer(),
    beforeSizes
  );
  // alpha follows dark (existing script behavior)
  await writeWithReport(OUT.wordmarkAlphaPng, wmDark, beforeSizes);
  await writeWithReport(
    OUT.wordmarkAlphaWebp,
    await sharp(wmDark).webp({ quality: WEBP_QUALITY, alphaQuality: 100 }).toBuffer(),
    beforeSizes
  );

  // 7-8 loading — ivory mark on transparent (used on dark UI)
  const loadingMark = await fitOnCanvas(iconIvory, 320, 277, { maxFill: 0.78 });
  const loadingLarge = await fitOnCanvas(iconIvory, 1024, 885, { maxFill: 0.78 });
  await writeWithReport(OUT.loadingMark, loadingMark, beforeSizes);
  await writeWithReport(OUT.loadingLarge, loadingLarge, beforeSizes);

  // 9 favicons / app icons — black mark on white for readability at 16px
  const faviconMaster = iconBlack;
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
    const buf = await squareOpaque(faviconMaster, size, "#ffffff");
    await writeWithReport(path.join(root, file), buf, beforeSizes);
  }
  const ico = await buildFaviconIco(faviconMaster);
  await writeWithReport(path.join(root, "public/favicon.ico"), ico, beforeSizes);
  await writeWithReport(path.join(root, "src/app/favicon.ico"), ico, beforeSizes);

  // Verify dimensions
  console.log("\nVerification:");
  for (const [label, file] of Object.entries({
    logoSource: OUT.logoSource,
    iconSource: OUT.iconSource,
    siteLogo: OUT.siteLogo,
    wmLight: OUT.wordmarkLightPng,
    wmDark: OUT.wordmarkDarkPng,
    loading: OUT.loadingMark,
    loadingLg: OUT.loadingLarge,
    icon512: path.join(root, "public/icons/icon-512.png")
  })) {
    const m = await sharp(file).metadata();
    console.log(`  ${label}: ${m.width}x${m.height} ${m.format} hasAlpha=${m.hasAlpha}`);
  }

  console.log("\nMAPPING");
  console.log(JSON.stringify({ iconSrcFile: path.basename(iconSrcFile), logoSrcFile: path.basename(logoSrcFile) }, null, 2));
}

await main();
