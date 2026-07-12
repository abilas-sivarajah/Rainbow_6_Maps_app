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

/**
 * Eine Map wird über einen eigenständigen, interaktiven Etagen-Viewer
 * (HTML-Datei unter /public/maps/<id>.html) dargestellt. Jede Viewer-Datei
 * enthält das komplette SVG samt Etagen-Umschalter und wird per iframe
 * eingebettet.
 */
export interface GameMap {
  id: string;
  name: string;
  /** Pfad zum eingebetteten Etagen-Viewer, z.B. "/maps/oregon.html" */
  viewer: string;
  /** Anzahl der Etagen (für Anzeige/Übersicht) */
  floors: number;
  releaseYear?: number;
  /** Spiellisten, z.B. "Ranked", "Standard", "Quick Match" */
  playlists?: string[];
  location?: string;
  description?: string;
  /** Akzentfarbe für die Übersichtskarte (Hex) */
  accent?: string;
}
