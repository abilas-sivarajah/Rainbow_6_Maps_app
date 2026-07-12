// Zentrale Typdefinitionen für die R6-Datenbank.
// Alle Inhalte (Operator, Waffen, Maps) folgen diesen Typen, damit die
// Datenbasis konsistent und leicht erweiterbar bleibt.

export type Side = "attacker" | "defender";

export type WeaponType =
  | "Assault Rifle"
  | "SMG"
  | "LMG"
  | "Shotgun"
  | "Marksman Rifle"
  | "Pistol"
  | "Machine Pistol"
  | "Shield";

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  /** Schaden pro Treffer */
  damage: number;
  /** Schussrate in Schuss/Minute (0 bei Einzelfeuer/Shotguns ohne RPM) */
  fireRate: number;
  /** Mobilität 1–100 (höher = beweglicher) */
  mobility: number;
  /** Magazingröße */
  magazine: number;
  /** Anzahl Magazine (Reserve inkl.) */
  capacity: number;
  description?: string;
}

/** Ein Loadout referenziert Waffen über ihre id (siehe weapons.ts). */
export interface Loadout {
  primary: string[];
  secondary: string[];
  gadgets: string[];
}

export interface Ability {
  name: string;
  description: string;
}

export interface Operator {
  id: string;
  name: string;
  side: Side;
  /** Spezialeinheit, z.B. "SAS", "GIGN", "FBI SWAT" */
  organization: string;
  /** Herkunftsland (ISO-Kürzel oder Klartext) */
  country: string;
  /** Geschwindigkeit 1–3 */
  speed: 1 | 2 | 3;
  /** Rüstung 1–3 */
  armor: 1 | 2 | 3;
  /** Absolute Gesundheit (HP) */
  health: number;
  /** Schwierigkeit 1–3 */
  difficulty: 1 | 2 | 3;
  /** Rollen/Spielweisen, z.B. "Breach", "Intel", "Anchor" */
  roles: string[];
  /** Das definierende Gadget / die Spezialfähigkeit */
  gadget: Ability;
  loadout: Loadout;
  bio: string;
  /** Optionaler Portrait-Pfad unter /public. Fällt sonst auf Initialen zurück. */
  portrait?: string;
  /** Akzentfarbe für Initialen-Avatar (Hex) */
  accent?: string;
}

// ---- Maps -----------------------------------------------------------------

export type RoomShape = "rect" | "circle";

/**
 * Ein anklickbarer Raum auf einer Etage.
 * Koordinaten sind PROZENTUAL (0–100) relativ zur Etagengrafik, damit das
 * Overlay bei jeder Bildgröße korrekt sitzt.
 */
export interface Room {
  id: string;
  name: string;
  shape: RoomShape;
  /** Position der oberen linken Ecke (rect) bzw. des Mittelpunkts (circle), in % */
  x: number;
  y: number;
  /** Breite/Höhe in % (nur rect) */
  width?: number;
  height?: number;
  /** Radius in % (nur circle) */
  radius?: number;
  /** Ist hier ein Missionsziel (Bombe/Geisel/Secure)? */
  objective?: boolean;
  description?: string;
}

export interface Floor {
  id: string;
  name: string;
  /** Reihenfolge von unten (0 = tiefste Etage) nach oben */
  order: number;
  /** Bildpfad unter /public, z.B. "/maps/oregon/basement.svg" */
  image: string;
  rooms?: Room[];
}

export interface GameMap {
  id: string;
  name: string;
  releaseYear?: number;
  /** Spiellisten, z.B. "Ranked", "Standard", "Quick Match" */
  playlists: string[];
  /** Thumbnail unter /public */
  thumbnail: string;
  location?: string;
  description?: string;
  floors: Floor[];
}
