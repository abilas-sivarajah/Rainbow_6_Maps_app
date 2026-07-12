// Zentrale Typdefinitionen für die R6-Datenbank.
// Alle Inhalte (Operator, Waffen, Maps) folgen diesen Typen, damit die
// Datenbasis konsistent und leicht erweiterbar bleibt.

// Die Daten stammen aus R6_complete.json (siehe src/data/r6.ts).

export type Side = "attacker" | "defender";

export type LoadoutSlot =
  | "primary"
  | "secondary"
  | "gadget"
  | "unique-ability";

/** Ein Eintrag im Operator-Loadout (verweist per Name auf Waffe/Gadget). */
export interface LoadoutItem {
  name: string;
  slot: LoadoutSlot;
  subtype?: string | null;
  image?: string;
}

export interface Weapon {
  name: string;
  slot?: string;
  subtype?: string | null;
  /** Normalisierter Typ (Title Case), z.B. "Assault Rifle" */
  type?: string;
  /** Schaden pro Treffer */
  damage?: number;
  /** Detaillierte Schadenswerte (Distanz/Aufsätze) */
  damageDetail?: string;
  /** Schussrate in Schuss/Minute */
  rpm?: number;
  /** Mobilität */
  mobility?: number;
  /** Magazingröße (String, da z.B. "25+1") */
  magazine?: string | number;
  maxAmmo?: string;
  ammoType?: string;
  fireModes?: string;
  description?: string;
  /** Bildpfad (relativ, siehe R6_complete.json) */
  image?: string;
  /** Operator, die diese Waffe nutzen */
  usedBy?: string[];
}

export interface Gadget {
  name: string;
  usedBy?: string[];
  description?: string;
}

export interface Operator {
  name: string;
  slug: string;
  realName?: string;
  side: Side;
  /** Absolute Gesundheit (HP) */
  health: number;
  /** Geschwindigkeit 1–3 */
  speed: number;
  /** Rüstung 1–3 */
  armor: number;
  /** Schwierigkeit 1–3 */
  difficulty: number;
  /** Spezialeinheit, z.B. "SAS", "GIGN", "SWAT" */
  faction?: string | null;
  squad?: string[];
  /** Rollen/Spielweisen, z.B. "breach", "intel", "support" */
  roles: string[];
  dateOfBirth?: string;
  placeOfBirth?: string;
  /** Überschrift der Fähigkeit (aus JSON) */
  ability: string;
  /** Beschreibungstext der Fähigkeit */
  abilityDescription?: string;
  loadout: LoadoutItem[];
  organization?: string;
  quote?: string;
  /** Render-/Portrait-Bild (relativ, siehe R6_complete.json) */
  image?: string;
  /** Icon-Bild (relativ, siehe R6_complete.json) */
  icon?: string;
}

// ---- Maps -----------------------------------------------------------------

/** Eine Etage als optimiertes Bild (WebP) mit Größe. */
export interface MapFloor {
  id: string;
  name: string;
  /** Pfad unter /public, z.B. "/maps-img/oregon/floor-1.webp" */
  image: string;
  /** Bildmaße (für passgenaues Einpassen) */
  w?: number;
  h?: number;
}

/**
 * Eine Map besteht aus mehreren Etagen-Bildern, die im interaktiven Viewer
 * (Zoom/Pan) einzeln angezeigt werden.
 */
export interface GameMap {
  id: string;
  name: string;
  floors: MapFloor[];
  releaseYear?: number;
  /** Spiellisten, z.B. "Ranked", "Standard", "Quick Match" */
  playlists?: string[];
  location?: string;
  description?: string;
  /** Akzentfarbe für die Übersichtskarte (Hex) */
  accent?: string;
}
