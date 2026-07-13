import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE_DIR = path.join(ROOT, 'Rainbow maps Template');
const MAPS_IMG_DIR = path.join(ROOT, 'public', 'maps-img');

const THUMBNAIL_MAPPING = {
  'R6S_Maps_Bank_EXT.avif': 'bank',
  'R6S_Maps_Border_EXT.avif': 'border',
  'R6S_Maps_CalypsoCasino_Background.avif': 'casino',
  'R6S_Maps_Chalet_EXT.avif': 'chalet',
  'R6S_Maps_ClubHouse_EXT.avif': 'club',
  'ModernizedMap_Consulate_keyart.avif': 'consulate',
  'r6s_maps_emeraldplains__1_.avif': 'emerald',
  'R6S_Maps_RussianCafe_EXT.avif': 'kafe',
  'ModernizedMap_Nighthaven_keyart.avif': 'labs',
  'ModernizedMap_Lair_keyart.avif': 'lair',
  'r6s_maps_oregon_thumbnail.avif': 'oregon',
  'skycraper_modernized_keyart.avif': 'skyscraper',
  'r6s-maps-villa-thumb.avif': 'villa',
  'r6s-maps-coastline-thumb.avif': 'coastline',
  'fortress-reworked-thumbnail.avif': 'fortress',
  'r6-maps-kanal.avif': 'kanal',
  'r6-maps-outback.avif': 'outback',
  'themepark_modernized_keyart.avif': 'themepark'
};

function main() {
  console.log('Copying map thumbnails...');
  let count = 0;

  for (const [sourceFile, targetDirName] of Object.entries(THUMBNAIL_MAPPING)) {
    const sourcePath = path.join(TEMPLATE_DIR, sourceFile);
    const destDir = path.join(MAPS_IMG_DIR, targetDirName);
    const destPath = path.join(destDir, 'thumbnail.avif');

    if (!fs.existsSync(sourcePath)) {
      console.error(`Source thumbnail not found: ${sourcePath}`);
      continue;
    }

    // Ensure the target directory exists
    fs.mkdirSync(destDir, { recursive: true });

    // Copy the file
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${sourceFile} -> public/maps-img/${targetDirName}/thumbnail.avif`);
    count++;
  }

  console.log(`Successfully copied ${count} thumbnails.`);
}

main();
