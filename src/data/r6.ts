import type { Operator, Weapon, Gadget } from "./types";
import raw from "../../R6_bundle/R6_complete.json";

// Einzige Datenquelle: R6_bundle/R6_complete.json. Diese Datei wird vom Nutzer
// gepflegt/aktualisiert; hier wird sie typisiert aufbereitet.
//
// Die zugehörigen Bilder liegen unter public/img/ (operators/ und loadout/),
// sodass die Pfade aus dem JSON (z.B. "img/operators/ash_render.png") über
// asset() zu "/img/operators/ash_render.png" aufgelöst und ausgeliefert werden.

interface RawShape {
  operators: Operator[];
  weapons: (Weapon & { type?: string; subtype?: string | null })[];
  gadgets: Gadget[];
}

const data = raw as unknown as RawShape;

/** Wandelt "ASSAULT RIFLE" → "Assault Rifle" um. */
function titleCase(s?: string | null): string | undefined {
  if (!s) return undefined;
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bSmg\b/i, "SMG");
}

export const operators: Operator[] = data.operators;

export const weapons: Weapon[] = data.weapons.map((w) => ({
  ...w,
  type: titleCase(w.type) ?? titleCase(w.subtype ?? undefined),
}));

export const gadgets: Gadget[] = data.gadgets;

/**
 * Wandelt einen relativen Bildpfad aus dem JSON in einen absoluten Public-Pfad
 * um (z.B. "img/operators/ash_render.png" → "/img/operators/ash_render.png").
 * Die Bilddateien müssen dafür unter public/ liegen.
 */
export function asset(path?: string): string | undefined {
  if (!path) return undefined;
  return "/" + path.replace(/^\/+/, "");
}

// ---- Lookups --------------------------------------------------------------

const operatorBySlug = new Map(operators.map((o) => [o.slug, o]));
const weaponByName = new Map(
  weapons.map((w) => [w.name.trim().toLowerCase(), w]),
);
const gadgetByName = new Map(
  gadgets.map((g) => [g.name.trim().toLowerCase(), g]),
);

export function getOperator(slug: string): Operator | undefined {
  return operatorBySlug.get(slug);
}

export function getWeapon(name: string): Weapon | undefined {
  return weaponByName.get(name.trim().toLowerCase());
}

export function getGadget(name: string): Gadget | undefined {
  return gadgetByName.get(name.trim().toLowerCase());
}

/** Findet den Namen der einzigartigen Fähigkeit eines Operators. */
export function uniqueAbilityName(op: Operator): string | undefined {
  return op.loadout.find((l) => l.slot === "unique-ability")?.name;
}

// Alle Rollen (für Filter-UI), alphabetisch.
export const allRoles = Array.from(
  new Set(operators.flatMap((o) => o.roles)),
).sort();
