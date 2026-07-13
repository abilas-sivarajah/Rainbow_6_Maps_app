import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUNDLE_DIR = path.join(ROOT, 'R6_bundle');
const INPUT_DB_PATH = path.join(BUNDLE_DIR, 'R6_complete.json');

// Helper to translate a string using Google Translate single API
async function translateString(text, targetLang) {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed) return text;
  
  // Cache to avoid translating identical strings
  const cacheKey = `${targetLang}:${trimmed}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      const translation = data[0].map(x => x[0]).join('');
      
      translationCache[cacheKey] = translation;
      return translation;
    } catch (err) {
      console.warn(`Translation attempt ${attempt} failed for text: "${trimmed.slice(0, 30)}...". Error: ${err.message}`);
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 500 * attempt)); // exponential backoff
      }
    }
  }
  
  return text; // Fallback to original
}

const translationCache = {};

async function translateDb(targetLang) {
  const db = JSON.parse(fs.readFileSync(INPUT_DB_PATH, 'utf8'));
  console.log(`\nTranslating database to [${targetLang.toUpperCase()}]...`);

  // 1. Translate Operators
  let opCount = 0;
  for (const op of db.operators) {
    opCount++;
    console.log(`[${targetLang.toUpperCase()}] Operator ${opCount}/${db.operators.length}: ${op.name}...`);
    
    if (op.ability) {
      op.ability = await translateString(op.ability, targetLang);
      await new Promise(r => setTimeout(r, 80));
    }
    if (op.abilityDescription) {
      op.abilityDescription = await translateString(op.abilityDescription, targetLang);
      await new Promise(r => setTimeout(r, 80));
    }
    if (op.roles && Array.isArray(op.roles)) {
      const translatedRoles = [];
      for (const r of op.roles) {
        translatedRoles.push(await translateString(r, targetLang));
        await new Promise(r => setTimeout(r, 40));
      }
      op.roles = translatedRoles;
    }
  }

  // 2. Translate Weapons
  let wpCount = 0;
  for (const wp of db.weapons) {
    wpCount++;
    if (wpCount % 10 === 0 || wpCount === db.weapons.length) {
      console.log(`[${targetLang.toUpperCase()}] Weapons progress: ${wpCount}/${db.weapons.length}...`);
    }
    if (wp.description) {
      wp.description = await translateString(wp.description, targetLang);
      await new Promise(r => setTimeout(r, 80));
    }
  }

  // 3. Translate Gadgets
  let gdCount = 0;
  for (const gd of db.gadgets) {
    gdCount++;
    console.log(`[${targetLang.toUpperCase()}] Gadget ${gdCount}/${db.gadgets.length}: ${gd.name}...`);
    
    if (gd.name) {
      gd.name = await translateString(gd.name, targetLang);
      await new Promise(r => setTimeout(r, 40));
    }
    if (gd.description) {
      gd.description = await translateString(gd.description, targetLang);
      await new Promise(r => setTimeout(r, 80));
    }
  }

  const outputPath = path.join(BUNDLE_DIR, `R6_complete_${targetLang}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Saved translation to ${outputPath}`);
}

async function main() {
  if (!fs.existsSync(INPUT_DB_PATH)) {
    console.error(`Input JSON not found: ${INPUT_DB_PATH}`);
    process.exit(1);
  }

  // Translate to DE and FR
  await translateDb('de');
  await translateDb('fr');

  // Copy English (original source)
  const enOutputPath = path.join(BUNDLE_DIR, 'R6_complete_en.json');
  fs.copyFileSync(INPUT_DB_PATH, enOutputPath);
  console.log(`Saved original English version to ${enOutputPath}`);
  
  console.log('\nAll databases translated successfully!');
}

main().catch(console.error);
