/**
 * Génère les icônes carrées Learnoon (favicon, apple, OG) depuis logo-mark.png.
 * Usage: node scripts/generate-brand-icons.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "public/brand/logo-mark.png");

async function squareMark(size, { padRatio = 0.1, background = { r: 0, g: 0, b: 0, alpha: 0 } } = {}) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const logo = await sharp(sourcePath)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toBuffer();
}

/** Construit un .ico multi-tailles avec des PNG embarqués (format moderne). */
function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + entrySize * count;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(count, 4);

  const entries = [];
  const payloads = [];
  let offset = dataOffset;

  for (const png of pngBuffers) {
    const meta = Buffer.alloc(entrySize);
    // PNG IHDR width/height (0 in ICO entry means 256)
    const w = png.readUInt32BE(16);
    const h = png.readUInt32BE(20);
    meta.writeUInt8(w >= 256 ? 0 : w, 0);
    meta.writeUInt8(h >= 256 ? 0 : h, 1);
    meta.writeUInt8(0, 2); // color palette
    meta.writeUInt8(0, 3); // reserved
    meta.writeUInt16LE(1, 4); // color planes
    meta.writeUInt16LE(32, 6); // bits per pixel
    meta.writeUInt32LE(png.length, 8);
    meta.writeUInt32LE(offset, 12);
    entries.push(meta);
    payloads.push(png);
    offset += png.length;
  }

  return Buffer.concat([header, ...entries, ...payloads]);
}

async function openGraphImage() {
  const width = 1200;
  const height = 630;
  const markSize = 280;
  const mark = await squareMark(markSize, {
    padRatio: 0.08,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  });

  // Fond canvas + bande bleue à gauche + mark centré
  const svg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#F8FAFC"/>
      <rect x="0" y="0" width="16" height="100%" fill="#2563EB"/>
      <text x="80" y="520" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="#111827">Learnoon Academy</text>
      <text x="80" y="570" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#6B7280">Apprends aujourd’hui. Réussis demain.</text>
    </svg>
  `);

  return sharp(svg)
    .composite([{ input: mark, left: Math.round((width - markSize) / 2), top: 90 }])
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(path.join(root, "public/brand"), { recursive: true });
  await mkdir(path.join(root, "app"), { recursive: true });
  await mkdir(path.join(root, "scripts"), { recursive: true });

  const icon512 = await squareMark(512, { padRatio: 0.1 });
  const icon180 = await squareMark(180, { padRatio: 0.1 });
  const icon32 = await squareMark(32, { padRatio: 0.08 });
  const icon16 = await squareMark(16, { padRatio: 0.06 });
  const icon48 = await squareMark(48, { padRatio: 0.08 });
  const og = await openGraphImage();

  await writeFile(path.join(root, "app/icon.png"), icon512);
  await writeFile(path.join(root, "app/apple-icon.png"), icon180);
  await writeFile(path.join(root, "public/brand/icon-512.png"), icon512);
  await writeFile(path.join(root, "public/brand/icon-180.png"), icon180);
  await writeFile(path.join(root, "app/opengraph-image.png"), og);

  const ico = buildIco([icon16, icon32, icon48]);
  await writeFile(path.join(root, "app/favicon.ico"), ico);
  // Miroir public pour clients qui demandent /favicon.ico hors metadata App Router
  await writeFile(path.join(root, "public/favicon.ico"), ico);

  const check = async (rel) => {
    const meta = await sharp(path.join(root, rel)).metadata();
    console.log(`${rel}: ${meta.width}x${meta.height} ${meta.format}`);
  };

  await check("app/icon.png");
  await check("app/apple-icon.png");
  await check("app/opengraph-image.png");
  await check("public/brand/icon-512.png");
  console.log("app/favicon.ico + public/favicon.ico: écrits");
  console.log("OK — icônes Learnoon générées.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
