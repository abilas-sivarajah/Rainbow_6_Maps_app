import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('C:/Rainbow_6_Maps_app/node_modules/sharp');

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const MAPS_IMG_DIR = path.join(PUBLIC, 'maps-img');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const MAPS_TO_RENDER = [
  {
    id: 'casino',
    svgFile: 'casino.svg',
    floors: ['Floor 0', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5']
  },
  {
    id: 'fortress',
    svgFile: 'fortress.svg',
    floors: ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5']
  },
  {
    id: 'kanal',
    svgFile: 'kanal.svg',
    floors: ['Floor 0', 'Floor 1', 'Floor 2', 'Floor 3']
  },
  {
    id: 'outback',
    svgFile: 'outback.svg',
    floors: ['Floor 1', 'Floor 2', 'Floor 3']
  },
  {
    id: 'themepark',
    svgFile: 'themepark.svg',
    floors: ['Floor 1', 'Floor 2', 'Floor 3']
  }
];

const RENDER_W = 2600;
const RENDER_H = 1463;
const QUALITY = 80;

async function main() {
  const manifestPath = path.join(MAPS_IMG_DIR, 'manifest.json');
  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }

  const tempHtmlPath = path.join(ROOT, 'scripts', 'temp_floor.html');
  const tempPngPath = path.join(ROOT, 'scripts', 'temp_floor.png');

  for (const map of MAPS_TO_RENDER) {
    console.log(`\n--- Rendering Map: ${map.id} ---`);
    const svgPath = path.join(ROOT, 'MapSVG neu', map.svgFile);
    if (!fs.existsSync(svgPath)) {
      console.error(`SVG not found: ${svgPath}`);
      continue;
    }

    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const outMapDir = path.join(MAPS_IMG_DIR, map.id);
    fs.mkdirSync(outMapDir, { recursive: true });

    // Clear existing floor WebP files to prevent stale images
    const existingFiles = fs.readdirSync(outMapDir);
    for (const file of existingFiles) {
      if (file.startsWith('floor-') && file.endsWith('.webp')) {
        fs.unlinkSync(path.join(outMapDir, file));
      }
    }

    const floorsMeta = [];

    for (let i = 0; i < map.floors.length; i++) {
      const targetFloorId = map.floors[i];
      const floorFileName = `floor-${i + 1}.webp`;
      const outWebpPath = path.join(outMapDir, floorFileName);

      console.log(`Isolating floor "${targetFloorId}"...`);

      // Hide all other floors
      let modifiedSvg = svgContent.replace(/<g\s+([^>]*id="(Floor [^"]+)"[^>]*)/g, (match, full, floorId) => {
        let clean = match.replace(/\bdisplay="[^"]*"/g, '').replace(/style="[^"]*display\s*:\s*none[^"]*"/g, '');
        if (floorId === targetFloorId) {
          return clean.replace('<g', '<g display="inline"');
        } else {
          return clean.replace('<g', '<g display="none"');
        }
      });

      // Make SVG scale to 100% of the viewport
      modifiedSvg = modifiedSvg.replace(/<svg\s+([^>]*)/, (match, attrs) => {
        let clean = attrs.replace(/\bwidth="[^"]*"/g, '').replace(/\bheight="[^"]*"/g, '');
        return `<svg ${clean} width="100%" height="100%"`;
      });

      // HTML wrapper with transparent background and responsive layout
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: transparent;
          }
          svg {
            width: 100%;
            height: 100%;
            display: block;
          }
        </style>
      </head>
      <body>
        ${modifiedSvg}
      </body>
      </html>
      `;

      fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

      // Screenshot with Edge Headless
      const cmd = `"${EDGE_PATH}" --headless=new --disable-gpu --default-background-color=00000000 --window-size=${RENDER_W},${RENDER_H} --screenshot="${tempPngPath}" "file:///${tempHtmlPath.replace(/\\/g, '/')}"`;
      
      try {
        execSync(cmd, { stdio: 'pipe' });
      } catch (err) {
        console.error(`Edge screenshot failed for ${map.id} ${targetFloorId}:`, err.message);
        continue;
      }

      // Convert and optimize with sharp
      if (fs.existsSync(tempPngPath)) {
        const info = await sharp(tempPngPath)
          .webp({ quality: QUALITY })
          .toFile(outWebpPath);
        
        floorsMeta.push({
          id: `floor-${i + 1}`,
          name: targetFloorId,
          image: `/maps-img/${map.id}/${floorFileName}`,
          w: info.width,
          h: info.height,
          kb: Math.round(info.size / 1024)
        });

        console.log(`Rendered floor-${i + 1} (${targetFloorId}): ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`);
        
        // Clean up temp PNG
        try {
          fs.unlinkSync(tempPngPath);
        } catch (e) {}
      } else {
        console.error(`Temp PNG not found for ${map.id} ${targetFloorId}`);
      }
    }

    manifest[map.id] = floorsMeta;
    console.log(`Map ${map.id} done. Total floors: ${floorsMeta.length}`);
  }

  // Clean up temp HTML
  try {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  } catch (e) {}

  // Save manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('\nmanifest.json successfully updated.');
}

main().catch(console.error);
