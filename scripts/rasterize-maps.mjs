// Rendert die Etagen der ursprünglichen SVG-Viewer (public/maps/<id>.html) als
// optimierte WebP-Bilder nach public/maps-img/<id>/ und schreibt ein Manifest.
//
// Voraussetzungen (nicht Teil der App-Dependencies):
//   npm install --no-save playwright-core sharp
//   sowie die Original-Viewer unter public/maps/<id>.html (liegen in der
//   Git-Historie; für ein Re-Rendern zunächst auschecken).
//
// Aufruf:  node scripts/rasterize-maps.mjs [all|<id>,<id>]

import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");
const sharp = require("sharp");

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const OUT_DIR = join(PUBLIC, "maps-img");
const EXE =
  process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const RENDER_W = 3000; // Render-Breite im Browser
const OUT_W = 2600; // Ausgabe-Breite WebP
const QUALITY = 80;

const ALL = [
  "oregon", "bank", "villa", "club", "kafe", "border", "chalet",
  "coastline", "consulate", "emerald", "labs", "lair", "skyscraper",
];
const arg = process.argv[2];
const maps = !arg || arg === "all" ? ALL : arg.split(",");

const browser = await chromium.launch({ executablePath: EXE });
const manifest = {};

for (const id of maps) {
  const ctx = await browser.newContext({
    viewport: { width: RENDER_W, height: 1600 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`file://${PUBLIC}/maps/${id}.html`, {
    waitUntil: "load",
    timeout: 120000,
  });
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    const bar = document.getElementById("bar");
    if (bar) bar.style.display = "none";
    const wrap = document.getElementById("wrap");
    if (wrap) wrap.style.paddingTop = "0";
    document.body.style.margin = "0";
  });

  const labels = await page.$$eval("#bar button", (bs) =>
    bs.map((b) => b.textContent.trim()),
  );
  const count = await page.$$eval("#bar button", (bs) => bs.length);

  mkdirSync(join(OUT_DIR, id), { recursive: true });
  const floors = [];
  for (let i = 0; i < count; i++) {
    await page.$$eval("#bar button", (bs, idx) => bs[idx].click(), i);
    await page.waitForTimeout(250);
    const svg = await page.$("#wrap svg");
    const png = await svg.screenshot({ type: "png" });
    const file = `floor-${i + 1}.webp`;
    const info = await sharp(png)
      .resize({ width: OUT_W, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(join(OUT_DIR, id, file));
    floors.push({
      id: `floor-${i + 1}`,
      name: labels[i] || `Etage ${i + 1}`,
      image: `/maps-img/${id}/${file}`,
      w: info.width,
      h: info.height,
      kb: Math.round(info.size / 1024),
    });
    console.log(`${id} ${file}: ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`);
  }
  manifest[id] = floors;
  await ctx.close();
}

await browser.close();
writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("manifest.json geschrieben");
